import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { SampleBillMeta, ModificationDelta, PageModifications, EditorTool, SelectedItem } from '@inq/types';
import {
  PdfEngine,
  getSamplePdfBytes,
  SAMPLE_BILLS_META,
  deletePage,
  reorderPages,
  rotatePage,
  duplicatePage,
  addBlankPage,
  mergePdfs,
  extractPage,
} from '@inq/pdf-engine';
import { UploadIcon } from '@inq/icons';
import { Toast } from '@inq/ui/toast';
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
 * Snapshot for comprehensive Undo / Redo history
 */
interface HistorySnapshot {
  pdfBytes: Uint8Array | null;
  delta: ModificationDelta;
  numPages: number;
  currentPage: number;
  documentTitle: string;
}

/**
 * Toast notification model
 */
interface ToastNotification {
  id: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  duration?: number;
}

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
  const [docRevision, setDocRevision] = useState<number>(0);

  // Viewport & tool state (auto-fit scale and auto-collapse sidebar on mobile screens)
  const [scale, setScale] = useState<number>(() => {
    if (typeof window === 'undefined') return 1.25;
    if (window.innerWidth < 768) {
      return Math.max(0.4, Math.min(1.0, Math.round(((window.innerWidth - 24) / 612) * 100) / 100));
    }
    return 1.25;
  });
  const [activeTool, setActiveTool] = useState<EditorTool>('select');
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);

  // History & Delta
  const [delta, setDelta] = useState<ModificationDelta>({ pages: {} });
  const [undoStack, setUndoStack] = useState<HistorySnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<HistorySnapshot[]>([]);

  // Toast feedback state
  const [toast, setToast] = useState<ToastNotification | null>(null);

  // Drag & drop file ingestion state
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [dragOverZone, setDragOverZone] = useState<'none' | 'canvas' | 'rail'>('none');
  const dragCounterRef = useRef(0);

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
  const customFontBuffersRef = useRef<Map<string, Uint8Array>>(new Map());

  // Pre-load Unicode-compatible TrueType font for native vector rendering of symbols like ₹
  useEffect(() => {
    async function loadClientFonts() {
      try {
        const [regRes, boldRes, italicRes] = await Promise.allSettled([
          fetch('/fonts/LiberationSans-Regular.ttf'),
          fetch('/fonts/LiberationSans-Bold.ttf'),
          fetch('/fonts/LiberationSans-Italic.ttf'),
        ]);

        let regBuf: Uint8Array | undefined;
        let boldBuf: Uint8Array | undefined;
        let italicBuf: Uint8Array | undefined;

        if (regRes.status === 'fulfilled' && regRes.value.ok) {
          regBuf = new Uint8Array(await regRes.value.arrayBuffer());
          customFontBuffersRef.current.set('default', regBuf);
        }
        if (boldRes.status === 'fulfilled' && boldRes.value.ok) {
          boldBuf = new Uint8Array(await boldRes.value.arrayBuffer());
          customFontBuffersRef.current.set('default-bold', boldBuf);
        }
        if (italicRes.status === 'fulfilled' && italicRes.value.ok) {
          italicBuf = new Uint8Array(await italicRes.value.arrayBuffer());
          customFontBuffersRef.current.set('default-italic', italicBuf);
        }

        const fallbackBold = boldBuf || regBuf;
        const fallbackItalic = italicBuf || regBuf;

        for (const name of ['Helvetica', 'helvetica', 'Arial', 'arial', 'Roboto', 'roboto', 'Inter', 'inter']) {
          if (regBuf) customFontBuffersRef.current.set(name, regBuf);
          if (fallbackBold) customFontBuffersRef.current.set(`${name}-bold`, fallbackBold);
          if (fallbackItalic) customFontBuffersRef.current.set(`${name}-italic`, fallbackItalic);
        }
      } catch (err) {
        console.warn('Could not pre-load client TTF font buffers:', err);
      }
    }
    loadClientFonts();
  }, []);

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = `theme-${theme}`;
  }, [theme]);

  // Push unified snapshot before mutations
  const pushHistorySnapshot = useCallback(() => {
    const snapshot: HistorySnapshot = {
      pdfBytes: pdfBytes ? pdfBytes.slice() : null,
      delta: JSON.parse(JSON.stringify(delta)),
      numPages,
      currentPage,
      documentTitle,
    };
    setUndoStack((prev) => [...prev.slice(-30), snapshot]);
    setRedoStack([]);
  }, [pdfBytes, delta, numPages, currentPage, documentTitle]);

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
      setDocRevision((r) => r + 1);
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
        // Operates in standalone client mode when backend is absent
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
      setDocRevision((r) => r + 1);
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
      pushHistorySnapshot();
      setDelta((prevDelta) => {
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
    [currentPage, pushHistorySnapshot]
  );

  // Undo / Redo handlers supporting both content and structural changes
  const handleUndo = useCallback(async () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    const currentSnapshot: HistorySnapshot = {
      pdfBytes: pdfBytes ? pdfBytes.slice() : null,
      delta: JSON.parse(JSON.stringify(delta)),
      numPages,
      currentPage,
      documentTitle,
    };
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, currentSnapshot]);

    setDelta(previous.delta);
    setNumPages(previous.numPages);
    setCurrentPage(previous.currentPage);
    setDocumentTitle(previous.documentTitle);
    setSelectedItem(null);

    if (previous.pdfBytes) {
      setPdfBytes(previous.pdfBytes.slice());
      const doc = await loadPdfDocument(previous.pdfBytes.slice());
      setPdfDocument(doc);
      setDocRevision((r) => r + 1);
    }
  }, [undoStack, pdfBytes, delta, numPages, currentPage, documentTitle]);

  const handleRedo = useCallback(async () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    const currentSnapshot: HistorySnapshot = {
      pdfBytes: pdfBytes ? pdfBytes.slice() : null,
      delta: JSON.parse(JSON.stringify(delta)),
      numPages,
      currentPage,
      documentTitle,
    };
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, currentSnapshot]);

    setDelta(next.delta);
    setNumPages(next.numPages);
    setCurrentPage(next.currentPage);
    setDocumentTitle(next.documentTitle);
    setSelectedItem(null);

    if (next.pdfBytes) {
      setPdfBytes(next.pdfBytes.slice());
      const doc = await loadPdfDocument(next.pdfBytes.slice());
      setPdfDocument(doc);
      setDocRevision((r) => r + 1);
    }
  }, [redoStack, pdfBytes, delta, numPages, currentPage, documentTitle]);

  // Page Operations
  const handleReorderPage = async (fromIdx: number, toIdx: number) => {
    if (!pdfBytes || fromIdx === toIdx) return;
    pushHistorySnapshot();
    try {
      const newBytes = await reorderPages(pdfBytes, fromIdx, toIdx);
      const newPagesDelta: Record<number, PageModifications> = {};
      const oldIndices = Array.from({ length: numPages }, (_, i) => i);
      const [moved] = oldIndices.splice(fromIdx, 1);
      oldIndices.splice(toIdx, 0, moved);

      oldIndices.forEach((oldIdx, newIdx) => {
        if (delta.pages[oldIdx]) {
          newPagesDelta[newIdx] = {
            ...delta.pages[oldIdx],
            pageIndex: newIdx,
          };
        }
      });

      setDelta({ ...delta, pages: newPagesDelta });
      setPdfBytes(newBytes);
      const doc = await loadPdfDocument(newBytes);
      setPdfDocument(doc);
      setDocRevision((r) => r + 1);

      if (currentPage === fromIdx + 1) {
        setCurrentPage(toIdx + 1);
      } else if (fromIdx < currentPage - 1 && toIdx >= currentPage - 1) {
        setCurrentPage(currentPage - 1);
      } else if (fromIdx > currentPage - 1 && toIdx <= currentPage - 1) {
        setCurrentPage(currentPage + 1);
      }
    } catch (err: any) {
      console.error('Failed to reorder pages:', err);
      alert(`Could not reorder pages: ${err.message || String(err)}`);
    }
  };

  const handleDeletePage = async (pageIdx: number) => {
    if (!pdfBytes || numPages <= 1) {
      alert('Cannot delete the only page in the document.');
      return;
    }
    pushHistorySnapshot();
    try {
      const newBytes = await deletePage(pdfBytes, pageIdx);
      const newPagesDelta: Record<number, PageModifications> = {};
      Object.entries(delta.pages).forEach(([k, mods]) => {
        const idx = Number(k);
        if (idx < pageIdx) {
          newPagesDelta[idx] = mods;
        } else if (idx > pageIdx) {
          newPagesDelta[idx - 1] = {
            ...mods,
            pageIndex: idx - 1,
          };
        }
      });

      setDelta({ ...delta, pages: newPagesDelta });
      setPdfBytes(newBytes);
      const doc = await loadPdfDocument(newBytes);
      setPdfDocument(doc);
      setDocRevision((r) => r + 1);
      const newNum = doc.numPages;
      setNumPages(newNum);

      if (currentPage > newNum) {
        setCurrentPage(newNum);
      } else if (currentPage === pageIdx + 1 && pageIdx === newNum) {
        setCurrentPage(Math.max(1, newNum));
      }

      setToast({
        id: String(Date.now()),
        message: `Page ${pageIdx + 1} deleted`,
        actionLabel: 'Undo',
        onAction: () => {
          handleUndo();
          setToast(null);
        },
        duration: 5000,
        variant: 'info',
      });
    } catch (err: any) {
      console.error('Failed to delete page:', err);
      alert(`Could not delete page: ${err.message || String(err)}`);
    }
  };

  const handleRotatePage = async (pageIdx: number, degrees = 90) => {
    if (!pdfBytes) return;
    pushHistorySnapshot();
    try {
      const newBytes = await rotatePage(pdfBytes, pageIdx, degrees);
      setPdfBytes(newBytes);
      const doc = await loadPdfDocument(newBytes);
      setPdfDocument(doc);
      setDocRevision((r) => r + 1);
      setToast({
        id: String(Date.now()),
        message: `Page ${pageIdx + 1} rotated 90°`,
        duration: 3000,
        variant: 'info',
      });
    } catch (err: any) {
      console.error('Failed to rotate page:', err);
      alert(`Could not rotate page: ${err.message || String(err)}`);
    }
  };

  const handleDuplicatePage = async (pageIdx: number) => {
    if (!pdfBytes) return;
    pushHistorySnapshot();
    try {
      const newBytes = await duplicatePage(pdfBytes, pageIdx);
      const newPagesDelta: Record<number, PageModifications> = {};
      Object.entries(delta.pages).forEach(([k, mods]) => {
        const idx = Number(k);
        if (idx <= pageIdx) {
          newPagesDelta[idx] = mods;
        } else {
          newPagesDelta[idx + 1] = {
            ...mods,
            pageIndex: idx + 1,
          };
        }
      });
      if (delta.pages[pageIdx]) {
        newPagesDelta[pageIdx + 1] = {
          ...JSON.parse(JSON.stringify(delta.pages[pageIdx])),
          pageIndex: pageIdx + 1,
        };
      }

      setDelta({ ...delta, pages: newPagesDelta });
      setPdfBytes(newBytes);
      const doc = await loadPdfDocument(newBytes);
      setPdfDocument(doc);
      setDocRevision((r) => r + 1);
      setNumPages(doc.numPages);
      setCurrentPage(pageIdx + 2);
      setToast({
        id: String(Date.now()),
        message: `Page ${pageIdx + 1} duplicated`,
        duration: 3000,
        variant: 'success',
      });
    } catch (err: any) {
      console.error('Failed to duplicate page:', err);
      alert(`Could not duplicate page: ${err.message || String(err)}`);
    }
  };

  const handleAddBlankPage = async () => {
    if (!pdfBytes) return;
    pushHistorySnapshot();
    try {
      const newBytes = await addBlankPage(pdfBytes);
      setPdfBytes(newBytes);
      const doc = await loadPdfDocument(newBytes);
      setPdfDocument(doc);
      setDocRevision((r) => r + 1);
      const newNum = doc.numPages;
      setNumPages(newNum);
      setCurrentPage(newNum);
      setToast({
        id: String(Date.now()),
        message: `Blank page added as Page ${newNum}`,
        duration: 3000,
        variant: 'success',
      });
    } catch (err: any) {
      console.error('Failed to add blank page:', err);
      alert(`Could not add blank page: ${err.message || String(err)}`);
    }
  };

  const handleDownloadSinglePage = async (pageIdx: number) => {
    if (!pdfBytes) return;
    try {
      let workingBytes: Uint8Array = pdfBytes.slice();
      if (delta.pages[pageIdx]) {
        const singleDelta: ModificationDelta = {
          pages: { [pageIdx]: delta.pages[pageIdx] },
        };
        const fontBuffers = customFontBuffersRef.current.size > 0 ? customFontBuffersRef.current : undefined;
        const modified = await clientPdfEngine.modifyPdf(workingBytes, singleDelta, {
          customFontBuffers: fontBuffers,
        });
        workingBytes = Uint8Array.from(modified);
      }
      const singlePageBytes = await extractPage(workingBytes, pageIdx);
      const blob = new Blob([singlePageBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanTitle = (documentTitle || 'document').toLowerCase().replace(/[^a-z0-9-_]/g, '-');
      a.download = `${cleanTitle}-page-${pageIdx + 1}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Failed to download single page:', err);
      alert(`Could not download page: ${err.message || String(err)}`);
    }
  };

  const handleAppendPdf = async (file: File) => {
    if (!pdfBytes) {
      handleUploadFile(file);
      return;
    }
    pushHistorySnapshot();
    try {
      const arrayBuffer = await file.arrayBuffer();
      const sourceBytes = new Uint8Array(arrayBuffer);
      const mergedBytes = await mergePdfs(pdfBytes, sourceBytes);
      setPdfBytes(mergedBytes);
      const doc = await loadPdfDocument(mergedBytes);
      setPdfDocument(doc);
      setDocRevision((r) => r + 1);
      const oldNum = numPages;
      const newNum = doc.numPages;
      setNumPages(newNum);
      setCurrentPage(oldNum + 1);
      setToast({
        id: String(Date.now()),
        message: `Appended ${newNum - oldNum} pages from "${file.name}"`,
        duration: 4000,
        variant: 'success',
      });
    } catch (err: any) {
      console.error('Failed to append PDF:', err);
      alert(`Could not append PDF: ${err.message || String(err)}`);
    }
  };

  // Window-wide drag and drop listener for PDF files
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      if (e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files')) {
        dragCounterRef.current++;
        setIsDraggingFile(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      if (e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files')) {
        dragCounterRef.current--;
        if (dragCounterRef.current <= 0) {
          dragCounterRef.current = 0;
          setIsDraggingFile(false);
          setDragOverZone('none');
        }
      }
    };

    const handleDragOver = (e: DragEvent) => {
      if (e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files')) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const handleDrop = (e: DragEvent) => {
      dragCounterRef.current = 0;
      setIsDraggingFile(false);
      setDragOverZone('none');
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

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

      // Page Navigation shortcuts
      if (e.key === 'PageDown' || (e.altKey && e.key === 'ArrowDown')) {
        e.preventDefault();
        setCurrentPage((p) => Math.min(numPages, p + 1));
      }
      if (e.key === 'PageUp' || (e.altKey && e.key === 'ArrowUp')) {
        e.preventDefault();
        setCurrentPage((p) => Math.max(1, p - 1));
      }

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
  }, [handleUndo, handleRedo, numPages]);

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
        const fontBuffers = customFontBuffersRef.current.size > 0 ? customFontBuffersRef.current : undefined;
        finalBytes = await clientPdfEngine.modifyPdf(workingBytes, delta, {
          customFontBuffers: fontBuffers,
        });
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
          docRevision={docRevision}
          onReorderPage={handleReorderPage}
          onDeletePage={handleDeletePage}
          onRotatePage={handleRotatePage}
          onDuplicatePage={handleDuplicatePage}
          onAddBlankPage={handleAddBlankPage}
          onDownloadSinglePage={handleDownloadSinglePage}
          isDragOverRail={isDraggingFile && dragOverZone === 'rail'}
        />

        <EditorCanvas
          key={`editor-canvas-${docRevision}-${currentPage}`}
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

        {/* Fullscreen dual-target file drop overlay */}
        {isDraggingFile && (
          <div
            className="file-drop-overlay"
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'copy';
            }}
          >
            <div
              className={`file-drop-zone drop-zone-rail ${dragOverZone === 'rail' ? 'is-active' : ''}`}
              onDragEnter={() => setDragOverZone('rail')}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverZone('rail');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDraggingFile(false);
                dragCounterRef.current = 0;
                setDragOverZone('none');
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
                    alert('Please drop a valid PDF file.');
                    return;
                  }
                  handleAppendPdf(file);
                }
              }}
            >
              <div className="drop-zone-card">
                <div className="drop-icon-wrapper">
                  <UploadIcon size={32} />
                </div>
                <h3>Append Pages</h3>
                <p>Drop here to add pages to current document</p>
              </div>
            </div>

            <div
              className={`file-drop-zone drop-zone-canvas ${dragOverZone === 'canvas' ? 'is-active' : ''}`}
              onDragEnter={() => setDragOverZone('canvas')}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverZone('canvas');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDraggingFile(false);
                dragCounterRef.current = 0;
                setDragOverZone('none');
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
                    alert('Please drop a valid PDF file.');
                    return;
                  }
                  if (totalEdits > 0) {
                    const confirmed = window.confirm(
                      'You have unsaved edits in the active document. Open new document and discard changes?'
                    );
                    if (!confirmed) return;
                  }
                  handleUploadFile(file);
                }
              }}
            >
              <div className="drop-zone-card">
                <div className="drop-icon-wrapper">
                  <UploadIcon size={44} />
                </div>
                <h3>Open as New Document</h3>
                <p>Drop anywhere here to replace the active document</p>
              </div>
            </div>
          </div>
        )}
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

      {/* Floating Action Toast */}
      {toast && (
        <div className="floating-toast-container">
          <Toast
            id={toast.id}
            message={toast.message}
            actionLabel={toast.actionLabel}
            onAction={toast.onAction}
            variant={toast.variant || 'info'}
            duration={toast.duration || 5000}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </div>
  );
};

export default App;
