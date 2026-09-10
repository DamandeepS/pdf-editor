import React, { useState, useEffect, useCallback } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { SampleBillMeta, ModificationDelta, PageModifications, EditorTool } from '@inq/types';
import { PdfEngine } from '@inq/pdf-engine';
import { trpc } from './trpc';
import { loadPdfDocument } from './utils/pdfRenderer';
import { TopNav } from './components/TopNav';
import { PageRail } from './components/PageRail';
import { EditorCanvas } from './components/EditorCanvas';
import { StatusBar } from './components/StatusBar';
import { ShortcutsModal } from './components/ShortcutsModal';

const DEFAULT_SAMPLES: SampleBillMeta[] = [
  {
    id: 'saas-invoice',
    title: 'Cloud Tech SaaS Invoice',
    category: 'invoice',
    description: 'Itemized cloud computing & AI infrastructure statement with tax calculation and invoice table.',
    filename: 'cloud-tech-invoice.pdf',
    badgeColor: '#4285f4',
  },
  {
    id: 'electric-utility',
    title: 'City Electric Utility Bill',
    category: 'utility',
    description: 'Municipal power statement with meter readings, energy breakdown, and payment stub barcode.',
    filename: 'electric-utility-bill.pdf',
    badgeColor: '#34a853',
  },
  {
    id: 'retail-receipt',
    title: 'Artisan Cafe & Bistro Receipt',
    category: 'receipt',
    description: 'Thermal-style dining receipt with timestamp, itemized order, tip breakdown, and payment card auth.',
    filename: 'cafe-bistro-receipt.pdf',
    badgeColor: '#fbbc05',
  },
];

const clientPdfEngine = new PdfEngine();

export const App: React.FC = () => {
  // Document state
  const [documentTitle, setDocumentTitle] = useState('Cloud Tech SaaS Invoice');
  const [sampleBills, setSampleBills] = useState<SampleBillMeta[]>(DEFAULT_SAMPLES);
  const [currentSampleId, setCurrentSampleId] = useState<string>('saas-invoice');
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Viewport & tool state
  const [scale, setScale] = useState<number>(1.25);
  const [activeTool, setActiveTool] = useState<EditorTool>('select');
  const [selectedItem, setSelectedItem] = useState<{ type: 'text' | 'whiteout' | 'image'; id: string } | null>(null);

  // History & Delta
  const [delta, setDelta] = useState<ModificationDelta>({ pages: {} });
  const [undoStack, setUndoStack] = useState<ModificationDelta[]>([]);
  const [redoStack, setRedoStack] = useState<ModificationDelta[]>([]);

  // UI state
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isRailCollapsed, setIsRailCollapsed] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [ipcStatus, setIpcStatus] = useState<'connected' | 'offline' | 'checking'>('checking');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = `theme-${theme}`;
  }, [theme]);

  // Load sample bill via tRPC
  const loadSample = useCallback(async (sampleId: string) => {
    try {
      setCurrentSampleId(sampleId);
      const res = await trpc.samples.get.query({ sampleId });
      const raw = res.base64;
      const binary = atob(raw);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      setPdfBytes(bytes);
      const doc = await loadPdfDocument(bytes);
      setPdfDocument(doc);
      setNumPages(doc.numPages);
      setCurrentPage(1);
      setDelta({ pages: {} });
      setUndoStack([]);
      setRedoStack([]);
      setSelectedItem(null);
      if (res.meta?.title) {
        setDocumentTitle(res.meta.title);
      }
    } catch (err) {
      console.warn('Failed to load sample bill from tRPC, checking fallback:', err);
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
      } catch (err) {
        console.warn('tRPC server unreachable at http://localhost:4000/trpc:', err);
        setIpcStatus('offline');
      }
    }

    init();
  }, [loadSample]);

  // Handle custom PDF file upload
  const handleUploadFile = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      setPdfBytes(bytes);
      setCurrentSampleId('');
      setDocumentTitle(file.name.replace(/\.[^/.]+$/, ''));

      const doc = await loadPdfDocument(bytes);
      setPdfDocument(doc);
      setNumPages(doc.numPages);
      setCurrentPage(1);
      setDelta({ pages: {} });
      setUndoStack([]);
      setRedoStack([]);
      setSelectedItem(null);
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

  // Export PDF: Calls tRPC export with client-side fallback
  const handleExport = async () => {
    if (!pdfBytes) {
      alert('No document is currently loaded to export.');
      return;
    }

    setIsExporting(true);
    try {
      let finalBytes: Uint8Array;

      if (ipcStatus === 'connected') {
        // Primary IPC export via tRPC
        const res = await trpc.export.generate.mutate({
          documentTitle,
          sampleId: currentSampleId || undefined,
          pdfBase64: !currentSampleId
            ? btoa(String.fromCharCode(...pdfBytes))
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
        finalBytes = await clientPdfEngine.modifyPdf(pdfBytes, delta);
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
        onResetZoom={() => setScale(1.0)}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        onExport={handleExport}
        isExporting={isExporting}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      <div className="workspace-body">
        <PageRail
          numPages={numPages}
          currentPage={currentPage}
          onSelectPage={setCurrentPage}
          isCollapsed={isRailCollapsed}
          onToggleCollapse={() => setIsRailCollapsed((c) => !c)}
        />

        <EditorCanvas
          pdfDocument={pdfDocument}
          currentPage={currentPage}
          scale={scale}
          activeTool={activeTool}
          pageModifications={currentPageModifications}
          onUpdatePageModifications={updateCurrentPageModifications}
          selectedItem={selectedItem}
          onSelectItem={setSelectedItem}
        />
      </div>

      <StatusBar
        currentPage={currentPage}
        totalPages={numPages}
        scale={scale}
        totalEdits={totalEdits}
        ipcStatus={ipcStatus}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};
export default App;
