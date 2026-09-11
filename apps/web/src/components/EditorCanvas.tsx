import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import type {
  PageModifications,
  TextBlockEdit,
  WhiteoutBlock,
  ImageStamp,
  EditorTool,
  TextStyleOptions,
} from '@inq/types';
import {
  renderPageToCanvas,
  extractPageTextItems,
  type ExtractedTextItem,
} from '../utils/pdfRenderer';
import { FloatingFormatToolbar } from './FloatingFormatToolbar';
import { createStampDataUrl, STAMP_PRESETS } from '../utils/stampGenerator';
import { MoveIcon, UploadIcon } from '@inq/icons';

let measurementCanvas: HTMLCanvasElement | null = null;
function measureRenderedTextWidth(
  text: string,
  fontSize: number,
  fontFamily: string,
  isBold: boolean,
  isItalic: boolean
): number {
  if (typeof document === 'undefined') return text.length * fontSize * 0.55;
  try {
    if (!measurementCanvas) {
      measurementCanvas = document.createElement('canvas');
    }
    const ctx = measurementCanvas.getContext('2d');
    if (!ctx) return text.length * fontSize * 0.55;
    ctx.font = `${isItalic ? 'italic ' : ''}${isBold ? '700 ' : '400 '}${fontSize}px ${fontFamily}, sans-serif`;
    return ctx.measureText(text).width;
  } catch {
    return text.length * fontSize * 0.55;
  }
}

export interface EditorCanvasProps {
  pdfDocument: PDFDocumentProxy | null;
  currentPage: number;
  scale: number;
  activeTool: EditorTool;
  pageModifications: PageModifications;
  onUpdatePageModifications: (updater: (prev: PageModifications) => PageModifications) => void;
  selectedItem: { type: 'text' | 'whiteout' | 'image'; id: string } | null;
  onSelectItem: (item: { type: 'text' | 'whiteout' | 'image'; id: string } | null) => void;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
  pdfDocument,
  currentPage,
  scale,
  activeTool,
  pageModifications,
  onUpdatePageModifications,
  selectedItem,
  onSelectItem,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [textItems, setTextItems] = useState<ExtractedTextItem[]>([]);
  const [pageSize, setPageSize] = useState<{ width: number; height: number; pdfWidth: number; pdfHeight: number }>({
    width: 612,
    height: 792,
    pdfWidth: 612,
    pdfHeight: 792,
  });
  const [isDrawingWhiteout, setIsDrawingWhiteout] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentWhiteoutRect, setCurrentWhiteoutRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [draggingStampId, setDraggingStampId] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{
    mouseX: number;
    mouseY: number;
    initPdfX: number;
    initPdfY: number;
  } | null>(null);
  const [draggingTextId, setDraggingTextId] = useState<string | null>(null);
  const [textDragStartPos, setTextDragStartPos] = useState<{
    mouseX: number;
    mouseY: number;
    initPdfX: number;
    initPdfY: number;
    initBaselineY: number;
  } | null>(null);
  const stampFileInputRef = useRef<HTMLInputElement>(null);

  const renderTaskRef = useRef<any>(null);

  // Render current PDF page whenever document, page, or scale changes
  useEffect(() => {
    let isCancelled = false;

    async function render() {
      if (!pdfDocument || !canvasRef.current) return;

      // Cancel previous ongoing render task if any
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore
        }
        renderTaskRef.current = null;
      }

      try {
        const page: PDFPageProxy = await pdfDocument.getPage(currentPage);
        if (isCancelled) return;

        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const dpr = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale: scale * dpr });
        const displayViewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = `${displayViewport.width}px`;
        canvas.style.height = `${displayViewport.height}px`;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const renderContext = {
          canvasContext: ctx,
          canvas,
          viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
        renderTaskRef.current = null;

        if (isCancelled) return;

        setPageSize({
          width: displayViewport.width,
          height: displayViewport.height,
          pdfWidth: unscaledViewport.width,
          pdfHeight: unscaledViewport.height,
        });

        const extracted = await extractPageTextItems(page, scale, canvas);
        if (!isCancelled) {
          setTextItems(extracted);
        }
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('Failed to render PDF page:', err);
        }
      }
    }

    render();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore
        }
        renderTaskRef.current = null;
      }
    };
  }, [pdfDocument, currentPage, scale]);

  // Convert Screen coordinates to PDF 72pt coordinates
  const screenToPdf = useCallback(
    (screenX: number, screenY: number, screenW: number, screenH: number) => {
      const pdfX = screenX / scale;
      const pdfW = screenW / scale;
      const pdfH = screenH / scale;
      const pdfY = pageSize.pdfHeight - (screenY / scale) - pdfH;
      return { pdfX, pdfY, pdfW, pdfH };
    },
    [scale, pageSize.pdfHeight]
  );

  // Convert PDF 72pt coordinates to Screen coordinates
  const pdfToScreen = useCallback(
    (pdfX: number, pdfY: number, pdfW: number, pdfH: number) => {
      const screenX = pdfX * scale;
      const screenY = (pageSize.pdfHeight - pdfY - pdfH) * scale;
      const screenW = pdfW * scale;
      const screenH = pdfH * scale;
      return { screenX, screenY, screenW, screenH };
    },
    [scale, pageSize.pdfHeight]
  );

  // Stamp placement and drag handlers
  const handleApplyStamp = async (presetId: string) => {
    const preset = STAMP_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const dataUrl = await createStampDataUrl(preset.label, preset.colorHex, preset.subtext);
    const stampWidth = 140;
    const stampHeight = 55;
    const pdfX = Math.max(20, (pageSize.pdfWidth - stampWidth) / 2);
    const pdfY = Math.max(20, (pageSize.pdfHeight - stampHeight) / 2);

    const newStamp: ImageStamp = {
      id: `stamp-${Date.now()}`,
      pageIndex: currentPage - 1,
      bbox: {
        x: pdfX,
        y: pdfY,
        width: stampWidth,
        height: stampHeight,
      },
      dataUrl,
      mimeType: 'image/png',
      opacity: 0.9,
      name: preset.label,
    };

    onUpdatePageModifications((prev: PageModifications) => ({
      ...prev,
      images: [...(prev.images || []), newStamp],
    }));
    onSelectItem({ type: 'image', id: newStamp.id });
  };

  const handleCustomStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const stampWidth = 120;
      const stampHeight = 60;
      const pdfX = Math.max(20, (pageSize.pdfWidth - stampWidth) / 2);
      const pdfY = Math.max(20, (pageSize.pdfHeight - stampHeight) / 2);

      const newStamp: ImageStamp = {
        id: `stamp-custom-${Date.now()}`,
        pageIndex: currentPage - 1,
        bbox: {
          x: pdfX,
          y: pdfY,
          width: stampWidth,
          height: stampHeight,
        },
        dataUrl,
        mimeType: file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png',
        opacity: 1,
        name: file.name,
      };

      onUpdatePageModifications((prev: PageModifications) => ({
        ...prev,
        images: [...(prev.images || []), newStamp],
      }));
      onSelectItem({ type: 'image', id: newStamp.id });
    };
    reader.readAsDataURL(file);
  };

  const handleStampMouseDown = (e: React.MouseEvent, stamp: ImageStamp) => {
    e.stopPropagation();
    onSelectItem({ type: 'image', id: stamp.id });
    setDraggingStampId(stamp.id);
    setDragStartPos({
      mouseX: e.clientX,
      mouseY: e.clientY,
      initPdfX: stamp.bbox.x,
      initPdfY: stamp.bbox.y,
    });
  };

  const handleTextDragStart = (
    e: React.MouseEvent,
    item: ExtractedTextItem,
    edit?: TextBlockEdit
  ) => {
    e.stopPropagation();
    onSelectItem({ type: 'text', id: item.id });
    setDraggingTextId(item.id);
    setTextDragStartPos({
      mouseX: e.clientX,
      mouseY: e.clientY,
      initPdfX: edit?.currentBbox.x ?? item.x,
      initPdfY: edit?.currentBbox.y ?? item.y,
      initBaselineY: edit?.baselineY ?? item.baselineY ?? item.y,
    });
  };

  // Mouse Handlers for Whiteout, Stamp, and Text Dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool !== 'whiteout') return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawingWhiteout(true);
    setDrawStart({ x, y });
    setCurrentWhiteoutRect({ x, y, w: 0, h: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // 1. Whiteout drawing
    if (isDrawingWhiteout && drawStart && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = Math.max(0, Math.min(pageSize.width, e.clientX - rect.left));
      const currentY = Math.max(0, Math.min(pageSize.height, e.clientY - rect.top));

      const x = Math.min(drawStart.x, currentX);
      const y = Math.min(drawStart.y, currentY);
      const w = Math.abs(currentX - drawStart.x);
      const h = Math.abs(currentY - drawStart.y);

      setCurrentWhiteoutRect({ x, y, w, h });
      return;
    }

    // 2. Stamp dragging
    if (draggingStampId && dragStartPos) {
      const dx = (e.clientX - dragStartPos.mouseX) / scale;
      const dy = (dragStartPos.mouseY - e.clientY) / scale;
      const newPdfX = Math.round(dragStartPos.initPdfX + dx);
      const newPdfY = Math.round(dragStartPos.initPdfY + dy);

      onUpdatePageModifications((prev: PageModifications) => ({
        ...prev,
        images: (prev.images || []).map((img: ImageStamp) =>
          img.id === draggingStampId
            ? { ...img, bbox: { ...img.bbox, x: newPdfX, y: newPdfY } }
            : img
        ),
      }));
      return;
    }

    // 3. Text field dragging
    if (draggingTextId && textDragStartPos) {
      const dx = (e.clientX - textDragStartPos.mouseX) / scale;
      const dy = (textDragStartPos.mouseY - e.clientY) / scale; // Screen Y goes down, PDF Y goes up
      const newPdfX = Math.round((textDragStartPos.initPdfX + dx) * 10) / 10;
      const newPdfY = Math.round((textDragStartPos.initPdfY + dy) * 10) / 10;
      const newBaselineY = Math.round((textDragStartPos.initBaselineY + dy) * 10) / 10;

      onUpdatePageModifications((prev: PageModifications) => {
        const existingEdits = prev.textEdits || [];
        const targetItem = textItems.find((t) => t.id === draggingTextId);
        if (!targetItem) return prev;
        const existing = existingEdits.find((t: TextBlockEdit) => t.id === draggingTextId);

        if (existing) {
          return {
            ...prev,
            textEdits: existingEdits.map((t: TextBlockEdit) =>
              t.id === draggingTextId
                ? {
                    ...t,
                    currentBbox: { ...t.currentBbox, x: newPdfX, y: newPdfY },
                    baselineY: newBaselineY,
                  }
                : t
            ),
          };
        } else {
          const isCurrencyOrNumber = /^\$?\s*[\d,]+(\.\d+)?$/i.test(targetItem.text.trim());
          const newEdit: TextBlockEdit = {
            id: targetItem.id,
            pageIndex: currentPage - 1,
            originalText: targetItem.text,
            newText: targetItem.text,
            originalBbox: {
              x: targetItem.x,
              y: targetItem.y,
              width: targetItem.width,
              height: targetItem.height,
            },
            currentBbox: {
              x: newPdfX,
              y: newPdfY,
              width: targetItem.width,
              height: targetItem.height,
            },
            baselineY: newBaselineY,
            backgroundColorHex: targetItem.detectedBackgroundColorHex || '#ffffff',
            detectedFontName: targetItem.fontName,
            style: {
              fontFamily: targetItem.fontFamily || 'Helvetica',
              fontSize: targetItem.fontSize,
              colorHex: targetItem.detectedColorHex || '#1f1f1f',
              isBold: targetItem.isBold,
              isItalic: targetItem.isItalic,
              letterSpacing: 0,
              lineHeight: 1.2,
              textAlign: isCurrencyOrNumber ? 'right' : 'left',
              autoFit: true,
            },
          };
          return {
            ...prev,
            textEdits: [...existingEdits, newEdit],
          };
        }
      });
      return;
    }
  };

  const handleMouseUp = () => {
    if (draggingStampId) {
      setDraggingStampId(null);
      setDragStartPos(null);
    }

    if (draggingTextId) {
      setDraggingTextId(null);
      setTextDragStartPos(null);
    }

    if (!isDrawingWhiteout || !currentWhiteoutRect) return;

    setIsDrawingWhiteout(false);
    setDrawStart(null);

    // Only create if rectangle has minimum size
    if (currentWhiteoutRect.w > 4 && currentWhiteoutRect.h > 4) {
      const { pdfX, pdfY, pdfW, pdfH } = screenToPdf(
        currentWhiteoutRect.x,
        currentWhiteoutRect.y,
        currentWhiteoutRect.w,
        currentWhiteoutRect.h
      );

      const newWhiteout: WhiteoutBlock = {
        id: `whiteout-${Date.now()}`,
        pageIndex: currentPage - 1,
        bbox: {
          x: pdfX,
          y: pdfY,
          width: pdfW,
          height: pdfH,
        },
        fillColorHex: '#ffffff',
      };

      onUpdatePageModifications((prev: PageModifications) => ({
        ...prev,
        whiteouts: [...(prev.whiteouts || []), newWhiteout],
      }));

      onSelectItem({ type: 'whiteout', id: newWhiteout.id });
    }

    setCurrentWhiteoutRect(null);
  };

  // Nudge text field position in PDF points
  const handleNudgeText = useCallback(
    (direction: 'left' | 'right' | 'up' | 'down', step = 1) => {
      if (!selectedItem || selectedItem.type !== 'text') return;
      const targetItem = textItems.find((t) => t.id === selectedItem.id);
      if (!targetItem) return;

      let deltaX = 0;
      let deltaY = 0;
      if (direction === 'left') deltaX = -step;
      if (direction === 'right') deltaX = step;
      if (direction === 'up') deltaY = step; // PDF Y goes UP
      if (direction === 'down') deltaY = -step; // PDF Y goes DOWN

      onUpdatePageModifications((prev: PageModifications) => {
        const existingEdits = prev.textEdits || [];
        const existing = existingEdits.find((t: TextBlockEdit) => t.id === selectedItem.id);

        if (existing) {
          return {
            ...prev,
            textEdits: existingEdits.map((t: TextBlockEdit) =>
              t.id === selectedItem.id
                ? {
                    ...t,
                    currentBbox: {
                      ...t.currentBbox,
                      x: Math.round((t.currentBbox.x + deltaX) * 10) / 10,
                      y: Math.round((t.currentBbox.y + deltaY) * 10) / 10,
                    },
                    baselineY: Math.round(
                      ((t.baselineY ?? targetItem.baselineY ?? targetItem.y) + deltaY) * 10
                    ) / 10,
                  }
                : t
            ),
          };
        } else {
          const isCurrencyOrNumber = /^\$?\s*[\d,]+(\.\d+)?$/i.test(targetItem.text.trim());
          const newEdit: TextBlockEdit = {
            id: targetItem.id,
            pageIndex: currentPage - 1,
            originalText: targetItem.text,
            newText: targetItem.text,
            originalBbox: {
              x: targetItem.x,
              y: targetItem.y,
              width: targetItem.width,
              height: targetItem.height,
            },
            currentBbox: {
              x: Math.round((targetItem.x + deltaX) * 10) / 10,
              y: Math.round((targetItem.y + deltaY) * 10) / 10,
              width: targetItem.width,
              height: targetItem.height,
            },
            baselineY: Math.round(((targetItem.baselineY ?? targetItem.y) + deltaY) * 10) / 10,
            backgroundColorHex: targetItem.detectedBackgroundColorHex || '#ffffff',
            detectedFontName: targetItem.fontName,
            style: {
              fontFamily: targetItem.fontFamily || 'Helvetica',
              fontSize: targetItem.fontSize,
              colorHex: targetItem.detectedColorHex || '#1f1f1f',
              isBold: targetItem.isBold,
              isItalic: targetItem.isItalic,
              letterSpacing: 0,
              lineHeight: 1.2,
              textAlign: isCurrencyOrNumber ? 'right' : 'left',
              autoFit: true,
            },
          };
          return { ...prev, textEdits: [...existingEdits, newEdit] };
        }
      });
    },
    [selectedItem, textItems, currentPage, onUpdatePageModifications]
  );

  // Reset text field position back to original detected coordinates
  const handleResetTextPosition = useCallback(() => {
    if (!selectedItem || selectedItem.type !== 'text') return;
    const targetItem = textItems.find((t) => t.id === selectedItem.id);
    if (!targetItem) return;

    onUpdatePageModifications((prev: PageModifications) => {
      const existingEdits = prev.textEdits || [];
      return {
        ...prev,
        textEdits: existingEdits.map((t: TextBlockEdit) =>
          t.id === selectedItem.id
            ? {
                ...t,
                currentBbox: {
                  ...t.currentBbox,
                  x: t.originalBbox.x,
                  y: t.originalBbox.y,
                },
                baselineY: targetItem.baselineY ?? targetItem.y,
              }
            : t
        ),
      };
    });
  }, [selectedItem, textItems, onUpdatePageModifications]);

  // Keyboard shortcut listener for arrow keys (Alt + Arrow / Arrow when not input focused)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedItem || selectedItem.type !== 'text') return;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        const isInput =
          document.activeElement?.tagName === 'INPUT' ||
          document.activeElement?.tagName === 'TEXTAREA';
        if (e.altKey || !isInput) {
          e.preventDefault();
          const step = e.shiftKey ? 5 : 1;
          if (e.key === 'ArrowLeft') handleNudgeText('left', step);
          if (e.key === 'ArrowRight') handleNudgeText('right', step);
          if (e.key === 'ArrowUp') handleNudgeText('up', step);
          if (e.key === 'ArrowDown') handleNudgeText('down', step);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, handleNudgeText]);

  // Find active selected text, whiteout, or image for floating toolbar
  const activeTextItem = selectedItem?.type === 'text' ? textItems.find((t) => t.id === selectedItem.id) : undefined;
  const activeTextEdit = pageModifications.textEdits?.find((t: TextBlockEdit) => t.id === selectedItem?.id);
  const activeWhiteout = pageModifications.whiteouts?.find((w: WhiteoutBlock) => w.id === selectedItem?.id);
  const activeImage = pageModifications.images?.find((img: ImageStamp) => img.id === selectedItem?.id);

  const hasPositionOffset = Boolean(
    activeTextEdit &&
      (Math.abs(activeTextEdit.currentBbox.x - activeTextEdit.originalBbox.x) > 0.1 ||
        Math.abs(activeTextEdit.currentBbox.y - activeTextEdit.originalBbox.y) > 0.1)
  );

  // Calculate position for floating toolbar docked above selection
  let toolbarPosition: { top: number; left: number } | null = null;
  if (selectedItem?.type === 'text') {
    const textItem = textItems.find((t) => t.id === selectedItem.id);
    if (textItem) {
      const edit = activeTextEdit;
      const isCurrencyOrNumber = /^\$?\s*[\d,]+(\.\d+)?$/i.test(textItem.text.trim());
      const textAlign = edit?.style.textAlign || (isCurrencyOrNumber ? 'right' : 'left');
      const deltaX = edit ? edit.currentBbox.x - textItem.x : 0;
      const deltaY = edit ? edit.currentBbox.y - textItem.y : 0;
      const offsetX = deltaX * scale;
      const offsetY = -deltaY * scale;

      const fontSize = (edit?.style.fontSize || textItem.fontSize) * scale;
      const displayText = edit ? edit.newText : textItem.text;
      const estimatedWidth = Math.max(
        textItem.screenWidth + 16,
        displayText.length * (fontSize * 0.58) + 24
      );

      let currentScreenX = textItem.screenX + offsetX;
      if (textAlign === 'right') {
        currentScreenX = textItem.screenX + textItem.screenWidth + offsetX - estimatedWidth;
      } else if (textAlign === 'center') {
        currentScreenX = textItem.screenX + textItem.screenWidth / 2 + offsetX - estimatedWidth / 2;
      }

      const approxToolbarWidth = 540;
      const clampedX = Math.max(10, Math.min(pageSize.width - approxToolbarWidth, currentScreenX));

      toolbarPosition = {
        top: textItem.screenY + offsetY,
        left: clampedX,
      };
    } else if (activeTextEdit) {
      const coords = pdfToScreen(
        activeTextEdit.currentBbox.x,
        activeTextEdit.currentBbox.y,
        100,
        activeTextEdit.style.fontSize || 12
      );
      toolbarPosition = {
        top: coords.screenY,
        left: coords.screenX,
      };
    }

  } else if (selectedItem?.type === 'whiteout' && activeWhiteout) {
    const coords = pdfToScreen(
      activeWhiteout.bbox.x,
      activeWhiteout.bbox.y,
      activeWhiteout.bbox.width,
      activeWhiteout.bbox.height
    );
    toolbarPosition = {
      top: coords.screenY,
      left: coords.screenX,
    };
  } else if (selectedItem?.type === 'image' && activeImage) {
    const coords = pdfToScreen(
      activeImage.bbox.x,
      activeImage.bbox.y,
      activeImage.bbox.width,
      activeImage.bbox.height
    );
    toolbarPosition = {
      top: coords.screenY,
      left: coords.screenX,
    };
  }

  return (
    <div
      className="canvas-viewport"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onSelectItem(null);
        }
      }}
    >
      <div
        ref={containerRef}
        className="canvas-container"
        style={{
          width: `${pageSize.width}px`,
          height: `${pageSize.height}px`,
          cursor: activeTool === 'whiteout' ? 'crosshair' : activeTool === 'text' ? 'text' : 'default',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <canvas ref={canvasRef} className="pdf-canvas" />

        {/* Interactive Overlay */}
        <div className="interactive-overlay">
          {/* Stamp Picker Floating Dock when Image/Stamp tool is active */}
          {activeTool === 'image' && (
            <div className="stamp-picker-dock">
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Stamp:
              </span>
              {STAMP_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className="stamp-btn"
                  style={{ color: preset.colorHex, borderColor: preset.colorHex }}
                  onClick={() => handleApplyStamp(preset.id)}
                  title={`Place ${preset.label} Stamp on Page`}
                >
                  {preset.label}
                </button>
              ))}
              <input
                ref={stampFileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                style={{ display: 'none' }}
                onChange={handleCustomStampUpload}
              />
              <button
                type="button"
                className="stamp-btn"
                style={{ color: 'var(--color-brand-primary)', borderColor: 'var(--border-default)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={() => stampFileInputRef.current?.click()}
                title="Upload signature or custom stamp image"
              >
                <UploadIcon size={14} />
                <span>Custom Stamp</span>
              </button>
            </div>
          )}

          {/* Render Vector Whiteouts */}
          {pageModifications.whiteouts?.map((w: WhiteoutBlock) => {
            const coords = pdfToScreen(w.bbox.x, w.bbox.y, w.bbox.width, w.bbox.height);
            const isSelected = selectedItem?.type === 'whiteout' && selectedItem.id === w.id;

            return (
              <div
                key={w.id}
                className={`whiteout-box ${isSelected ? 'selected' : ''}`}
                style={{
                  left: `${coords.screenX}px`,
                  top: `${coords.screenY}px`,
                  width: `${coords.screenW}px`,
                  height: `${coords.screenH}px`,
                  backgroundColor: w.fillColorHex || '#ffffff',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectItem({ type: 'whiteout', id: w.id });
                }}
              />
            );
          })}

          {/* Currently drawing whiteout preview */}
          {isDrawingWhiteout && currentWhiteoutRect && (
            <div
              className="whiteout-box selected"
              style={{
                left: `${currentWhiteoutRect.x}px`,
                top: `${currentWhiteoutRect.y}px`,
                width: `${currentWhiteoutRect.w}px`,
                height: `${currentWhiteoutRect.h}px`,
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                border: '1.5px dashed var(--color-brand-primary)',
              }}
            />
          )}

          {/* Render Image Stamps */}
          {pageModifications.images?.map((img: ImageStamp) => {
            const coords = pdfToScreen(img.bbox.x, img.bbox.y, img.bbox.width, img.bbox.height);
            const isSelected = selectedItem?.type === 'image' && selectedItem.id === img.id;

            return (
              <div
                key={img.id}
                className={`image-stamp-box ${isSelected ? 'selected' : ''}`}
                style={{
                  left: `${coords.screenX}px`,
                  top: `${coords.screenY}px`,
                  width: `${coords.screenW}px`,
                  height: `${coords.screenH}px`,
                  opacity: img.opacity ?? 1,
                }}
                onMouseDown={(e) => handleStampMouseDown(e, img)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectItem({ type: 'image', id: img.id });
                }}
              >
                <img src={img.dataUrl} alt={img.name || 'Stamp'} />
              </div>
            );
          })}

          {/* Render Text Items (Extracted from PDF.js + Modified) */}
          {textItems.map((item) => {
            const edit = pageModifications.textEdits?.find((e: TextBlockEdit) => e.id === item.id);
            const isSelected = selectedItem?.type === 'text' && selectedItem.id === item.id;
            const displayText = edit ? edit.newText : item.text;
            const fontSize = (edit?.style.fontSize || item.fontSize) * scale;
            const color = edit?.style.colorHex || item.detectedColorHex || '#1f1f1f';
            const isBold = edit?.style.isBold ?? item.isBold ?? false;
            const isItalic = edit?.style.isItalic ?? item.isItalic ?? false;
            const fontFamily = edit?.style.fontFamily || item.fontFamily || 'Helvetica';
            const bgColor = edit?.backgroundColorHex || item.detectedBackgroundColorHex || '#ffffff';
            const isCurrencyOrNumber = /^\$?\s*[\d,]+(\.\d+)?$/i.test(item.text.trim());
            const textAlign = edit?.style.textAlign || (isCurrencyOrNumber ? 'right' : 'left');

            // Position calculation accounting for user movement and alignment
            const deltaX = edit ? edit.currentBbox.x - item.x : 0;
            const deltaY = edit ? edit.currentBbox.y - item.y : 0;
            const offsetX = deltaX * scale;
            const offsetY = -deltaY * scale; // PDF Y goes UP, screen Y goes DOWN

            // Measure actual rendered text width for snug, pixel-accurate fit
            const measuredWidth = measureRenderedTextWidth(
              displayText,
              fontSize,
              fontFamily,
              isBold,
              isItalic
            );

            // Container covers at least original text on canvas, plus safety padding for input cursor
            const textContainerWidth = Math.max(
              item.screenWidth,
              measuredWidth + (isSelected ? 8 : 4)
            );

            let currentScreenX = item.screenX + offsetX;
            if (textAlign === 'right') {
              currentScreenX = item.screenX + item.screenWidth + offsetX - textContainerWidth;
            } else if (textAlign === 'center') {
              currentScreenX = item.screenX + item.screenWidth / 2 + offsetX - textContainerWidth / 2;
            }
            const currentScreenY = item.screenY + offsetY;

            return (
              <div
                key={item.id}
                className={`text-span-box ${isSelected ? 'selected' : ''} ${edit ? 'modified' : ''}`}
                data-text={item.text}
                title={`Click to edit "${item.text}" (Alt+Arrows to nudge)`}
                style={{
                  left: `${currentScreenX}px`,
                  top: `${currentScreenY}px`,
                  width: `${textContainerWidth}px`,
                  height: `${Math.max(item.screenHeight, 16)}px`,
                  fontSize: `${fontSize}px`,
                  fontFamily,
                  color,
                  fontWeight: isBold ? 700 : 400,
                  fontStyle: isItalic ? 'italic' : 'normal',
                  justifyContent: textAlign === 'right' ? 'flex-end' : textAlign === 'center' ? 'center' : 'flex-start',
                  backgroundColor: isSelected || edit ? bgColor : 'transparent',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectItem({ type: 'text', id: item.id });
                }}
              >
                {/* Drag Move Handle when Selected */}
                {isSelected && (
                  <div
                    className="text-move-handle"
                    title="Drag to move field (or use Alt+Arrow keys to nudge)"
                    onMouseDown={(e) => handleTextDragStart(e, item, edit)}
                  >
                    <MoveIcon size={11} />
                  </div>
                )}

                {/* If modified, place whiteout under the text to cover original canvas rendering */}
                {edit && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-1px',
                      left: '-2px',
                      width: 'calc(100% + 4px)',
                      height: 'calc(100% + 2px)',
                      backgroundColor: bgColor,
                      borderRadius: '2px',
                      zIndex: -1,
                    }}
                  />
                )}

                {/* When moved away from original position, also whiteout original text position on canvas */}
                {edit && (deltaX !== 0 || deltaY !== 0) && (
                  <div
                    className="original-text-whiteout"
                    style={{
                      position: 'absolute',
                      left: `${item.screenX - currentScreenX - 2}px`,
                      top: `${item.screenY - currentScreenY - 1}px`,
                      width: `${item.screenWidth + 4}px`,
                      height: `${item.screenHeight + 2}px`,
                      backgroundColor: bgColor,
                      pointerEvents: 'none',
                      zIndex: -1,
                    }}
                  />
                )}

                {isSelected ? (
                  <input
                    type="text"
                    className="inline-edit-input"
                    value={displayText}
                    autoFocus
                    style={{
                      fontFamily,
                      fontSize: `${fontSize}px`,
                      color,
                      fontWeight: isBold ? 700 : 400,
                      fontStyle: isItalic ? 'italic' : 'normal',
                      textAlign,
                      backgroundColor: 'transparent',
                    }}
                    onChange={(e) => {
                      const newText = e.target.value;
                      onUpdatePageModifications((prev: PageModifications) => {
                        const existingEdits = prev.textEdits || [];
                        const withoutCurrent = existingEdits.filter((t: TextBlockEdit) => t.id !== item.id);

                        const defaultStyle: TextStyleOptions = {
                          fontFamily: edit?.style.fontFamily || item.fontFamily || 'Helvetica',
                          fontSize: edit?.style.fontSize || item.fontSize,
                          colorHex: edit?.style.colorHex || item.detectedColorHex || '#1f1f1f',
                          isBold: edit?.style.isBold ?? item.isBold ?? false,
                          isItalic: edit?.style.isItalic ?? item.isItalic ?? false,
                          letterSpacing: 0,
                          lineHeight: 1.2,
                          textAlign,
                          autoFit: true,
                        };

                        const updatedEdit: TextBlockEdit = {
                          id: item.id,
                          pageIndex: currentPage - 1,
                          originalText: item.text,
                          newText,
                          originalBbox: {
                            x: item.x,
                            y: item.y,
                            width: item.width,
                            height: item.height,
                          },
                          currentBbox: edit?.currentBbox || {
                            x: item.x,
                            y: item.y,
                            width: item.width,
                            height: item.height,
                          },
                          baselineY: edit?.baselineY ?? item.baselineY ?? item.y,
                          backgroundColorHex: edit?.backgroundColorHex || item.detectedBackgroundColorHex || '#ffffff',
                          detectedFontName: item.fontName,
                          style: edit?.style || defaultStyle,
                        };
                        return {
                          ...prev,
                          textEdits: [...withoutCurrent, updatedEdit],
                        };
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape' || e.key === 'Enter') {
                        e.currentTarget.blur();
                      }
                    }}
                  />
                ) : edit ? (
                  <span style={{ width: '100%', textAlign }}>{displayText}</span>
                ) : null}
              </div>
            );
          })}


          {/* Floating Formatting Toolbar */}
          {toolbarPosition && selectedItem && (
            <FloatingFormatToolbar
              position={toolbarPosition}
              type={selectedItem.type}
              fontFamily={activeTextEdit?.style.fontFamily || activeTextItem?.fontFamily || 'Helvetica'}
              detectedFontName={activeTextEdit?.detectedFontName || activeTextItem?.fontName}
              onFontFamilyChange={(fontFamily) => {
                onUpdatePageModifications((prev: PageModifications) => {
                  const existingEdits = prev.textEdits || [];
                  const existing = existingEdits.find((t: TextBlockEdit) => t.id === selectedItem.id);
                  if (existing) {
                    return {
                      ...prev,
                      textEdits: existingEdits.map((t: TextBlockEdit) =>
                        t.id === selectedItem.id ? { ...t, style: { ...t.style, fontFamily } } : t
                      ),
                    };
                  } else if (activeTextItem) {
                    const newEdit: TextBlockEdit = {
                      id: activeTextItem.id,
                      pageIndex: currentPage - 1,
                      originalText: activeTextItem.text,
                      newText: activeTextItem.text,
                      originalBbox: { x: activeTextItem.x, y: activeTextItem.y, width: activeTextItem.width, height: activeTextItem.height },
                      currentBbox: { x: activeTextItem.x, y: activeTextItem.y, width: activeTextItem.width, height: activeTextItem.height },
                      baselineY: activeTextItem.baselineY ?? activeTextItem.y,
                      backgroundColorHex: activeTextItem.detectedBackgroundColorHex || '#ffffff',
                      detectedFontName: activeTextItem.fontName,
                      style: {
                        fontFamily,
                        fontSize: activeTextItem.fontSize,
                        colorHex: activeTextItem.detectedColorHex || '#1f1f1f',
                        isBold: activeTextItem.isBold,
                        isItalic: activeTextItem.isItalic,
                        letterSpacing: 0,
                        lineHeight: 1.2,
                        textAlign: 'left',
                        autoFit: true,
                      },
                    };
                    return { ...prev, textEdits: [...existingEdits, newEdit] };
                  }
                  return prev;
                });
              }}
              fontSize={activeTextEdit?.style.fontSize || activeTextItem?.fontSize || 12}
              onFontSizeChange={(fontSize) => {
                onUpdatePageModifications((prev: PageModifications) => {
                  const existingEdits = prev.textEdits || [];
                  const existing = existingEdits.find((t: TextBlockEdit) => t.id === selectedItem.id);
                  if (existing) {
                    return {
                      ...prev,
                      textEdits: existingEdits.map((t: TextBlockEdit) =>
                        t.id === selectedItem.id ? { ...t, style: { ...t.style, fontSize } } : t
                      ),
                    };
                  } else if (activeTextItem) {
                    const newEdit: TextBlockEdit = {
                      id: activeTextItem.id,
                      pageIndex: currentPage - 1,
                      originalText: activeTextItem.text,
                      newText: activeTextItem.text,
                      originalBbox: { x: activeTextItem.x, y: activeTextItem.y, width: activeTextItem.width, height: activeTextItem.height },
                      currentBbox: { x: activeTextItem.x, y: activeTextItem.y, width: activeTextItem.width, height: activeTextItem.height },
                      baselineY: activeTextItem.baselineY ?? activeTextItem.y,
                      backgroundColorHex: activeTextItem.detectedBackgroundColorHex || '#ffffff',
                      detectedFontName: activeTextItem.fontName,
                      style: {
                        fontFamily: activeTextItem.fontFamily || 'Helvetica',
                        fontSize,
                        colorHex: activeTextItem.detectedColorHex || '#1f1f1f',
                        isBold: activeTextItem.isBold,
                        isItalic: activeTextItem.isItalic,
                        letterSpacing: 0,
                        lineHeight: 1.2,
                        textAlign: 'left',
                        autoFit: true,
                      },
                    };
                    return { ...prev, textEdits: [...existingEdits, newEdit] };
                  }
                  return prev;
                });
              }}
              isBold={activeTextEdit?.style.isBold ?? activeTextItem?.isBold ?? false}
              onToggleBold={() => {
                onUpdatePageModifications((prev: PageModifications) => {
                  const existingEdits = prev.textEdits || [];
                  const existing = existingEdits.find((t: TextBlockEdit) => t.id === selectedItem.id);
                  const currentBold = activeTextEdit?.style.isBold ?? activeTextItem?.isBold ?? false;
                  if (existing) {
                    return {
                      ...prev,
                      textEdits: existingEdits.map((t: TextBlockEdit) =>
                        t.id === selectedItem.id ? { ...t, style: { ...t.style, isBold: !currentBold } } : t
                      ),
                    };
                  } else if (activeTextItem) {
                    const newEdit: TextBlockEdit = {
                      id: activeTextItem.id,
                      pageIndex: currentPage - 1,
                      originalText: activeTextItem.text,
                      newText: activeTextItem.text,
                      originalBbox: { x: activeTextItem.x, y: activeTextItem.y, width: activeTextItem.width, height: activeTextItem.height },
                      currentBbox: { x: activeTextItem.x, y: activeTextItem.y, width: activeTextItem.width, height: activeTextItem.height },
                      baselineY: activeTextItem.baselineY ?? activeTextItem.y,
                      backgroundColorHex: activeTextItem.detectedBackgroundColorHex || '#ffffff',
                      detectedFontName: activeTextItem.fontName,
                      style: {
                        fontFamily: activeTextItem.fontFamily || 'Helvetica',
                        fontSize: activeTextItem.fontSize,
                        colorHex: activeTextItem.detectedColorHex || '#1f1f1f',
                        isBold: !currentBold,
                        isItalic: activeTextItem.isItalic,
                        letterSpacing: 0,
                        lineHeight: 1.2,
                        textAlign: 'left',
                        autoFit: true,
                      },
                    };
                    return { ...prev, textEdits: [...existingEdits, newEdit] };
                  }
                  return prev;
                });
              }}
              isItalic={activeTextEdit?.style.isItalic ?? activeTextItem?.isItalic ?? false}
              onToggleItalic={() => {
                onUpdatePageModifications((prev: PageModifications) => {
                  const existingEdits = prev.textEdits || [];
                  const existing = existingEdits.find((t: TextBlockEdit) => t.id === selectedItem.id);
                  const currentItalic = activeTextEdit?.style.isItalic ?? activeTextItem?.isItalic ?? false;
                  if (existing) {
                    return {
                      ...prev,
                      textEdits: existingEdits.map((t: TextBlockEdit) =>
                        t.id === selectedItem.id ? { ...t, style: { ...t.style, isItalic: !currentItalic } } : t
                      ),
                    };
                  } else if (activeTextItem) {
                    const newEdit: TextBlockEdit = {
                      id: activeTextItem.id,
                      pageIndex: currentPage - 1,
                      originalText: activeTextItem.text,
                      newText: activeTextItem.text,
                      originalBbox: { x: activeTextItem.x, y: activeTextItem.y, width: activeTextItem.width, height: activeTextItem.height },
                      currentBbox: { x: activeTextItem.x, y: activeTextItem.y, width: activeTextItem.width, height: activeTextItem.height },
                      baselineY: activeTextItem.baselineY ?? activeTextItem.y,
                      backgroundColorHex: activeTextItem.detectedBackgroundColorHex || '#ffffff',
                      detectedFontName: activeTextItem.fontName,
                      style: {
                        fontFamily: activeTextItem.fontFamily || 'Helvetica',
                        fontSize: activeTextItem.fontSize,
                        colorHex: activeTextItem.detectedColorHex || '#1f1f1f',
                        isBold: activeTextItem.isBold,
                        isItalic: !currentItalic,
                        letterSpacing: 0,
                        lineHeight: 1.2,
                        textAlign: 'left',
                        autoFit: true,
                      },
                    };
                    return { ...prev, textEdits: [...existingEdits, newEdit] };
                  }
                  return prev;
                });
              }}
              color={activeTextEdit?.style.colorHex || activeTextItem?.detectedColorHex || '#1f1f1f'}
              onColorChange={(colorHex) => {
                onUpdatePageModifications((prev: PageModifications) => {
                  const existingEdits = prev.textEdits || [];
                  const existing = existingEdits.find((t: TextBlockEdit) => t.id === selectedItem.id);
                  if (existing) {
                    return {
                      ...prev,
                      textEdits: existingEdits.map((t: TextBlockEdit) =>
                        t.id === selectedItem.id ? { ...t, style: { ...t.style, colorHex } } : t
                      ),
                    };
                  } else if (activeTextItem) {
                    const newEdit: TextBlockEdit = {
                      id: activeTextItem.id,
                      pageIndex: currentPage - 1,
                      originalText: activeTextItem.text,
                      newText: activeTextItem.text,
                      originalBbox: { x: activeTextItem.x, y: activeTextItem.y, width: activeTextItem.width, height: activeTextItem.height },
                      currentBbox: { x: activeTextItem.x, y: activeTextItem.y, width: activeTextItem.width, height: activeTextItem.height },
                      baselineY: activeTextItem.baselineY ?? activeTextItem.y,
                      backgroundColorHex: activeTextItem.detectedBackgroundColorHex || '#ffffff',
                      detectedFontName: activeTextItem.fontName,
                      style: {
                        fontFamily: activeTextItem.fontFamily || 'Helvetica',
                        fontSize: activeTextItem.fontSize,
                        colorHex,
                        isBold: activeTextItem.isBold,
                        isItalic: activeTextItem.isItalic,
                        letterSpacing: 0,
                        lineHeight: 1.2,
                        textAlign: 'left',
                        autoFit: true,
                      },
                    };
                    return { ...prev, textEdits: [...existingEdits, newEdit] };
                  }
                  return prev;
                });
              }}
              backgroundColor={activeTextEdit?.backgroundColorHex || activeTextItem?.detectedBackgroundColorHex || '#ffffff'}
              onBackgroundColorChange={(backgroundColorHex) => {
                onUpdatePageModifications((prev: PageModifications) => {
                  const existingEdits = prev.textEdits || [];
                  const existing = existingEdits.find((t: TextBlockEdit) => t.id === selectedItem.id);
                  if (existing) {
                    return {
                      ...prev,
                      textEdits: existingEdits.map((t: TextBlockEdit) =>
                        t.id === selectedItem.id ? { ...t, backgroundColorHex } : t
                      ),
                    };
                  } else if (activeTextItem) {
                    const newEdit: TextBlockEdit = {
                      id: activeTextItem.id,
                      pageIndex: currentPage - 1,
                      originalText: activeTextItem.text,
                      newText: activeTextItem.text,
                      originalBbox: { x: activeTextItem.x, y: activeTextItem.y, width: activeTextItem.width, height: activeTextItem.height },
                      currentBbox: { x: activeTextItem.x, y: activeTextItem.y, width: activeTextItem.width, height: activeTextItem.height },
                      baselineY: activeTextItem.baselineY ?? activeTextItem.y,
                      backgroundColorHex,
                      detectedFontName: activeTextItem.fontName,
                      style: {
                        fontFamily: activeTextItem.fontFamily || 'Helvetica',
                        fontSize: activeTextItem.fontSize,
                        colorHex: activeTextItem.detectedColorHex || '#1f1f1f',
                        isBold: activeTextItem.isBold,
                        isItalic: activeTextItem.isItalic,
                        letterSpacing: 0,
                        lineHeight: 1.2,
                        textAlign: 'left',
                        autoFit: true,
                      },
                    };
                    return { ...prev, textEdits: [...existingEdits, newEdit] };
                  }
                  return prev;
                });
              }}
              textAlign={
                activeTextEdit?.style.textAlign ||
                (activeTextItem && /^\$?\s*[\d,]+(\.\d+)?$/i.test(activeTextItem.text.trim()) ? 'right' : 'left')
              }
              onTextAlignChange={(textAlign) => {
                onUpdatePageModifications((prev: PageModifications) => {
                  const existingEdits = prev.textEdits || [];
                  const existing = existingEdits.find((t: TextBlockEdit) => t.id === selectedItem.id);
                  if (existing) {
                    return {
                      ...prev,
                      textEdits: existingEdits.map((t: TextBlockEdit) =>
                        t.id === selectedItem.id ? { ...t, style: { ...t.style, textAlign } } : t
                      ),
                    };
                  } else if (activeTextItem) {
                    const newEdit: TextBlockEdit = {
                      id: activeTextItem.id,
                      pageIndex: currentPage - 1,
                      originalText: activeTextItem.text,
                      newText: activeTextItem.text,
                      originalBbox: {
                        x: activeTextItem.x,
                        y: activeTextItem.y,
                        width: activeTextItem.width,
                        height: activeTextItem.height,
                      },
                      currentBbox: {
                        x: activeTextItem.x,
                        y: activeTextItem.y,
                        width: activeTextItem.width,
                        height: activeTextItem.height,
                      },
                      baselineY: activeTextItem.baselineY ?? activeTextItem.y,
                      backgroundColorHex: activeTextItem.detectedBackgroundColorHex || '#ffffff',
                      detectedFontName: activeTextItem.fontName,
                      style: {
                        fontFamily: activeTextItem.fontFamily || 'Helvetica',
                        fontSize: activeTextItem.fontSize,
                        colorHex: activeTextItem.detectedColorHex || '#1f1f1f',
                        isBold: activeTextItem.isBold,
                        isItalic: activeTextItem.isItalic,
                        letterSpacing: 0,
                        lineHeight: 1.2,
                        textAlign,
                        autoFit: true,
                      },
                    };
                    return { ...prev, textEdits: [...existingEdits, newEdit] };
                  }
                  return prev;
                });
              }}
              onNudge={handleNudgeText}
              onResetPosition={handleResetTextPosition}
              hasPositionOffset={hasPositionOffset}
              fillColor={activeWhiteout?.fillColorHex || '#ffffff'}
              onFillColorChange={(fillColorHex) => {
                onUpdatePageModifications((prev: PageModifications) => ({
                  ...prev,
                  whiteouts: (prev.whiteouts || []).map((w: WhiteoutBlock) =>
                    w.id === selectedItem.id ? { ...w, fillColorHex } : w
                  ),
                }));
              }}
              opacity={activeImage?.opacity ?? 1}
              onOpacityChange={(opacity) => {
                onUpdatePageModifications((prev: PageModifications) => ({
                  ...prev,
                  images: (prev.images || []).map((img: ImageStamp) =>
                    img.id === selectedItem.id ? { ...img, opacity } : img
                  ),
                }));
              }}
              onDelete={() => {
                if (selectedItem.type === 'text') {
                  // Whiteout / Erase original text
                  const item = textItems.find((t) => t.id === selectedItem.id);
                  if (item) {
                    const descent = item.fontSize * 0.28;
                    const padY = Math.max(1.5, item.fontSize * 0.1);
                    const padX = Math.max(2, item.fontSize * 0.1);
                    const whiteout: WhiteoutBlock = {
                      id: `whiteout-del-${Date.now()}`,
                      pageIndex: currentPage - 1,
                      bbox: {
                        x: item.x - padX,
                        y: (item.baselineY ?? item.y) - descent - padY,
                        width: item.width + 2 * padX,
                        height: item.fontSize * 1.25 + 2 * padY,
                      },
                      fillColorHex: item.detectedBackgroundColorHex || '#ffffff',
                    };
                    onUpdatePageModifications((prev: PageModifications) => ({
                      ...prev,
                      textEdits: (prev.textEdits || []).filter((t: TextBlockEdit) => t.id !== selectedItem.id),
                      whiteouts: [...(prev.whiteouts || []), whiteout],
                    }));
                  }
                } else if (selectedItem.type === 'whiteout') {
                  onUpdatePageModifications((prev: PageModifications) => ({
                    ...prev,
                    whiteouts: (prev.whiteouts || []).filter((w: WhiteoutBlock) => w.id !== selectedItem.id),
                  }));
                } else if (selectedItem.type === 'image') {
                  onUpdatePageModifications((prev: PageModifications) => ({
                    ...prev,
                    images: (prev.images || []).filter((img: ImageStamp) => img.id !== selectedItem.id),
                  }));
                }
                onSelectItem(null);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
