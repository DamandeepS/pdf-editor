import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { SampleBillMeta, ModificationDelta, PageModifications, EditorTool } from '@inq/types';
import { PdfEngine, getSamplePdfBytes, SAMPLE_BILLS_META } from '@inq/pdf-engine';
import { trpc } from './trpc';
import { loadPdfDocument } from './utils/pdfRenderer';
import { TopNav } from './components/TopNav';
import { PageRail } from './components/PageRail';
import { EditorCanvas } from './components/EditorCanvas';
import { StatusBar } from './components/StatusBar';
import { ShortcutsModal } from './components/ShortcutsModal';
import { PrivacyModal } from './components/PrivacyModal';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { trackEvent } from './utils/analytics';

const DEFAULT_SAMPLES: SampleBillMeta[] = SAMPLE_BILLS_META;

const clientPdfEngine = new PdfEngine();

/**
 * Safely converts a Uint8Array into a base64 string in chunks without exceeding call stack limits
 */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  const chunkSize = 0x8000; // 32KB chunks
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  return btoa(binary);
}

export const App: React.FC = () => {
  // Document state
  const [documentTitle, setDocumentTitle] = useState('Cloud Tech SaaS Invoice');
  const [sampleBills, setSampleBills] = useState<SampleBillMeta[]>(DEFAULT_SAMPLES);
  const [currentSampleId, setCurrentSampleId] = useState<string>('saas-invoice');
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Viewport & tool state (auto-fit scale and auto-collapse sidebar on mobile screens)
  const [scale, setScale] = useState<number>(() => {
    if (typeof window === 'undefined') return 1.25;
    if (window.innerWidth < 768) {
      return Math.max(0.4, Math.min(1.0, Math.round(((window.innerWidth - 24) / 612) * 100) / 100));
    }
    return 1.25;
  });
  const [activeTool, setActiveTool] = useState<EditorTool>('select');
  const [selectedItem, setSelectedItem] = useState<{ type: 'text' | 'whiteout' | 'image'; id: string } | null>(null);

  // History & Delta
  const [delta, setDelta] = useState<ModificationDelta>({ pages: {} });
  const [undoStack, setUndoStack] = useState<ModificationDelta[]>([]);
  const [redoStack, setRedoStack] = useState<ModificationDelta[]>([]);

  // UI state
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isRailCollapsed, setIsRailCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);
  const [ipcStatus, setIpcStatus] = useState<'connected' | 'offline' | 'checking'>('checking');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const activeLoadIdRef = useRef<number>(0);

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = `theme-${theme}`;
  }, [theme]);

  // Load sample bill via tRPC with client-side fallback
  const loadSample = useCallback(async (sampleId: string) => {
    const loadId = ++activeLoadIdRef.current;
    setCurrentSampleId(sampleId);
    let bytes: Uint8Array | null = null;
    let title: string | undefined;

    try {
      const res = await trpc.samples.get.query({ sampleId });
      const raw = res.base64;
      const binary = atob(raw);
      bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      title = res.meta?.title;
    } catch {
      // Standalone / static deployment fallback via @inq/pdf-engine
      bytes = await getSamplePdfBytes(sampleId);
      const meta = DEFAULT_SAMPLES.find((s) => s.id === sampleId);
      title = meta?.title;
    }

    if (bytes) {
      if (loadId !== activeLoadIdRef.current) return;
      setPdfBytes(bytes.slice());
      const doc = await loadPdfDocument(bytes.slice());
      if (loadId !== activeLoadIdRef.current) return;
      setPdfDocument(doc);
      setNumPages(doc.numPages);
      setCurrentPage(1);
      setDelta({ pages: {} });
      setUndoStack([]);
      setRedoStack([]);
      setSelectedItem(null);
      if (title) {
        setDocumentTitle(title);
      }
      trackEvent('pdf_sample_loaded', { sample_id: sampleId });
    }
  }, []);

  // Initial mount: connect to tRPC & load initial sample bill
  useEffect(() => {
    async function init() {
      try {
        await trpc.health.query();
        setIpcStatus('connected');

        const samples = await trpc.samples.list.query();
        if (samples && samples.length > 0) {
          setSampleBills(samples);
        }

        await loadSample('saas-invoice');
      } catch {
        // Operates in standalone client mode when backend is absent (e.g. Vercel static deployment)
        setIpcStatus('offline');
        await loadSample('saas-invoice');
      }
    }

    init();
  }, [loadSample]);

  // Handle custom PDF file upload
  const handleUploadFile = async (file: File) => {
    const loadId = ++activeLoadIdRef.current;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      if (loadId !== activeLoadIdRef.current) return;
      setPdfBytes(bytes.slice());
      setCurrentSampleId('');
      setDocumentTitle(file.name.replace(/\.[^/.]+$/, ''));

      const doc = await loadPdfDocument(bytes.slice());
      if (loadId !== activeLoadIdRef.current) return;
      setPdfDocument(doc);
      setNumPages(doc.numPages);
      setCurrentPage(1);
      setDelta({ pages: {} });
      setUndoStack([]);
      setRedoStack([]);
      setSelectedItem(null);
      trackEvent('pdf_custom_uploaded', { pages: doc.numPages });
    } catch (err) {
      console.error('Failed to parse uploaded PDF:', err);
      alert('Unable to load uploaded PDF file.');
    }
  };

  // Delta updater with automatic Undo history snapshot
  const updateCurrentPageModifications = useCallback(
    (updater: (prev: PageModifications) => PageModifications) => {
      setDelta((prevDelta) => {
        // Push snapshot to undo stack
        setUndoStack((prevUndo) => [...prevUndo.slice(-30), prevDelta]);
        setRedoStack([]); // Clear redo stack on new action

        const pageIdx = currentPage - 1;
        const currentPageMods: PageModifications = prevDelta.pages[pageIdx] || {
          pageIndex: pageIdx,
          whiteouts: [],
          textEdits: [],
          images: [],
          newTexts: [],
        };
        const updatedMods = updater(currentPageMods);

        return {
          ...prevDelta,
          pages: {
            ...prevDelta.pages,
            [pageIdx]: updatedMods,
          },
        };
      });
    },
    [currentPage]
  );

  // Undo / Redo handlers
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, delta]);
    setDelta(previous);
    setSelectedItem(null);
  }, [undoStack, delta]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, delta]);
    setDelta(next);
    setSelectedItem(null);
  }, [redoStack, delta]);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputFocused =
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement;

      // Global Undo/Redo
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Help Modal
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setIsShortcutsOpen(true);
        return;
      }

      if (isInputFocused) return;

      // Tool selection shortcuts
      if (e.key.toLowerCase() === 'v') setActiveTool('select');
      if (e.key.toLowerCase() === 't') setActiveTool('text');
      if (e.key.toLowerCase() === 'w') setActiveTool('whiteout');
      if (e.key.toLowerCase() === 'i') setActiveTool('image');

      // Zoom shortcuts
      if (e.key === '+' || e.key === '=') setScale((s) => Math.min(3.0, s + 0.15));
      if (e.key === '-' || e.key === '_') setScale((s) => Math.max(0.4, s - 0.15));
      if (e.key === '0') setScale(1.0);

      // Escape to deselect
      if (e.key === 'Escape') setSelectedItem(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Prevent browser viewport zooming the whole site outside the canvas viewport
  useEffect(() => {
    const handleGestureStart = (e: Event) => {
      if (!document.querySelector('.canvas-viewport')?.contains(e.target as Node)) {
        e.preventDefault();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey && !document.querySelector('.canvas-viewport')?.contains(e.target as Node)) {
        e.preventDefault();
      }
    };

    document.addEventListener('gesturestart', handleGestureStart, { passive: false });
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('gesturestart', handleGestureStart);
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Export PDF: Calls tRPC export with client-side fallback
  const handleExport = async () => {
    if (!pdfBytes || pdfBytes.byteLength === 0 || pdfBytes.buffer?.byteLength === 0) {
      alert('No document is currently loaded to export.');
      return;
    }

    setIsExporting(true);
    try {
      let finalBytes: Uint8Array;
      const workingBytes = pdfBytes.slice();

      if (ipcStatus === 'connected') {
        // Primary IPC export via tRPC
        const res = await trpc.export.generate.mutate({
          documentTitle,
          sampleId: currentSampleId || undefined,
          pdfBase64: !currentSampleId
            ? uint8ArrayToBase64(workingBytes)
            : undefined,
          delta,
        });

        const binary = atob(res.pdfBase64);
        finalBytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          finalBytes[i] = binary.charCodeAt(i);
        }
      } else {
        // Client-side fallback via @inq/pdf-engine
        finalBytes = await clientPdfEngine.modifyPdf(workingBytes, delta);
      }

      // Trigger instant browser download
      const blob = new Blob([finalBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentTitle.toLowerCase().replace(/[^a-z0-9-_]/g, '-')}-edited.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      trackEvent('pdf_exported', { edits_count: totalEdits });
    } catch (err: any) {
      console.error('Export failed:', err);
      alert(`Export failed: ${err.message || String(err)}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Count total modifications across all pages
  const totalEdits = Object.values(delta.pages).reduce((sum, page) => {
    return sum + (page.whiteouts?.length || 0) + (page.textEdits?.length || 0) + (page.images?.length || 0);
  }, 0);

  const currentPageModifications: PageModifications = delta.pages[currentPage - 1] || {
    pageIndex: currentPage - 1,
    whiteouts: [],
    textEdits: [],
    images: [],
    newTexts: [],
  };

  return (
    <div className="app-root">
      <TopNav
        title={documentTitle}
        onTitleChange={setDocumentTitle}
        sampleBills={sampleBills}
        currentSampleId={currentSampleId}
        onSelectSample={loadSample}
        onUploadFile={handleUploadFile}
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        scale={scale}
        onZoomIn={() => setScale((s) => Math.min(3.0, s + 0.15))}
        onZoomOut={() => setScale((s) => Math.max(0.4, s - 0.15))}
        onResetZoom={() => {
          if (window.innerWidth < 768) {
            const fitScale = Math.max(0.4, Math.min(1.0, Math.round(((window.innerWidth - 24) / 612) * 100) / 100));
            setScale((s) => (Math.abs(s - fitScale) < 0.05 ? 1.0 : fitScale));
          } else {
            setScale((s) => (s === 1.0 ? 1.25 : 1.0));
          }
        }}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        onExport={handleExport}
        isExporting={isExporting}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        isRailCollapsed={isRailCollapsed}
        onToggleRail={() => setIsRailCollapsed((c) => !c)}
      />

      <main className="workspace-body" id="main-content" role="main">
        {!isRailCollapsed && (
          <div
            className="mobile-rail-backdrop"
            onClick={() => setIsRailCollapsed(true)}
            aria-hidden="true"
          />
        )}

        <PageRail
          numPages={numPages}
          currentPage={currentPage}
          onSelectPage={setCurrentPage}
          isCollapsed={isRailCollapsed}
          onToggleCollapse={() => setIsRailCollapsed((c) => !c)}
          pdfDocument={pdfDocument}
          modifications={delta.pages}
        />

        <EditorCanvas
          pdfDocument={pdfDocument}
          currentPage={currentPage}
          scale={scale}
          onScaleChange={setScale}
          activeTool={activeTool}
          pageModifications={currentPageModifications}
          onUpdatePageModifications={updateCurrentPageModifications}
          selectedItem={selectedItem}
          onSelectItem={setSelectedItem}
        />
      </main>

      <StatusBar
        currentPage={currentPage}
        totalPages={numPages}
        scale={scale}
        totalEdits={totalEdits}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      <CookieConsentBanner
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />
    </div>
  );
};
export default App;
