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

        const extracted = await extractPageTextItems(page, scale);
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

  // Mouse Handlers for Whiteout Drawing
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
    if (!isDrawingWhiteout || !drawStart || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const currentX = Math.max(0, Math.min(pageSize.width, e.clientX - rect.left));
    const currentY = Math.max(0, Math.min(pageSize.height, e.clientY - rect.top));

    const x = Math.min(drawStart.x, currentX);
    const y = Math.min(drawStart.y, currentY);
    const w = Math.abs(currentX - drawStart.x);
    const h = Math.abs(currentY - drawStart.y);

    setCurrentWhiteoutRect({ x, y, w, h });
  };

  const handleMouseUp = () => {
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

  // Find active selected text or whiteout for floating toolbar
  const activeTextEdit = pageModifications.textEdits?.find((t: TextBlockEdit) => t.id === selectedItem?.id);
  const activeWhiteout = pageModifications.whiteouts?.find((w: WhiteoutBlock) => w.id === selectedItem?.id);

  // Calculate position for floating toolbar docked above selection
  let toolbarPosition: { top: number; left: number } | null = null;
  if (selectedItem?.type === 'text') {
    const textItem = textItems.find((t) => t.id === selectedItem.id);
    if (textItem) {
      toolbarPosition = {
        top: textItem.screenY,
        left: textItem.screenX,
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

          {/* Render Text Items (Extracted from PDF.js + Modified) */}
          {textItems.map((item) => {
            const edit = pageModifications.textEdits?.find((e: TextBlockEdit) => e.id === item.id);
            const isSelected = selectedItem?.type === 'text' && selectedItem.id === item.id;
            const displayText = edit ? edit.newText : item.text;
            const fontSize = (edit?.style.fontSize || item.fontSize) * scale;
            const color = edit?.style.colorHex || '#1f1f1f';
            const isBold = edit?.style.isBold ?? false;
            const isItalic = edit?.style.isItalic ?? false;

            return (
              <div
                key={item.id}
                className={`text-span-box ${isSelected ? 'selected' : ''} ${edit ? 'modified' : ''}`}
                style={{
                  left: `${item.screenX}px`,
                  top: `${item.screenY}px`,
                  width: `${Math.max(item.screenWidth, 20)}px`,
                  height: `${Math.max(item.screenHeight, 16)}px`,
                  fontSize: `${fontSize}px`,
                  color,
                  fontWeight: isBold ? 700 : 400,
                  fontStyle: isItalic ? 'italic' : 'normal',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectItem({ type: 'text', id: item.id });
                }}
              >
                {/* If modified, place whiteout under the original text to cover it */}
                {edit && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#ffffff',
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
                    onChange={(e) => {
                      const newText = e.target.value;
                      onUpdatePageModifications((prev: PageModifications) => {
                        const existingEdits = prev.textEdits || [];
                        const withoutCurrent = existingEdits.filter((t: TextBlockEdit) => t.id !== item.id);

                        const defaultStyle: TextStyleOptions = {
                          fontFamily: edit?.style.fontFamily || 'Helvetica',
                          fontSize: edit?.style.fontSize || item.fontSize,
                          colorHex: edit?.style.colorHex || '#1f1f1f',
                          isBold: edit?.style.isBold ?? false,
                          isItalic: edit?.style.isItalic ?? false,
                          letterSpacing: 0,
                          lineHeight: 1.2,
                          textAlign: 'left',
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
                          currentBbox: {
                            x: item.x,
                            y: item.y,
                            width: item.width,
                            height: item.height,
                          },
                          style: defaultStyle,
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
                  <span>{displayText}</span>
                ) : null}
              </div>
            );
          })}

          {/* Floating Formatting Toolbar */}
          {toolbarPosition && selectedItem && (
            <FloatingFormatToolbar
              position={toolbarPosition}
              type={selectedItem.type}
              fontFamily={activeTextEdit?.style.fontFamily || 'Helvetica'}
              onFontFamilyChange={(fontFamily) => {
                onUpdatePageModifications((prev: PageModifications) => ({
                  ...prev,
                  textEdits: (prev.textEdits || []).map((t: TextBlockEdit) =>
                    t.id === selectedItem.id
                      ? { ...t, style: { ...t.style, fontFamily } }
                      : t
                  ),
                }));
              }}
              fontSize={activeTextEdit?.style.fontSize || 12}
              onFontSizeChange={(fontSize) => {
                onUpdatePageModifications((prev: PageModifications) => ({
                  ...prev,
                  textEdits: (prev.textEdits || []).map((t: TextBlockEdit) =>
                    t.id === selectedItem.id
                      ? { ...t, style: { ...t.style, fontSize } }
                      : t
                  ),
                }));
              }}
              isBold={activeTextEdit?.style.isBold || false}
              onToggleBold={() => {
                onUpdatePageModifications((prev: PageModifications) => ({
                  ...prev,
                  textEdits: (prev.textEdits || []).map((t: TextBlockEdit) =>
                    t.id === selectedItem.id
                      ? { ...t, style: { ...t.style, isBold: !t.style.isBold } }
                      : t
                  ),
                }));
              }}
              isItalic={activeTextEdit?.style.isItalic || false}
              onToggleItalic={() => {
                onUpdatePageModifications((prev: PageModifications) => ({
                  ...prev,
                  textEdits: (prev.textEdits || []).map((t: TextBlockEdit) =>
                    t.id === selectedItem.id
                      ? { ...t, style: { ...t.style, isItalic: !t.style.isItalic } }
                      : t
                  ),
                }));
              }}
              color={activeTextEdit?.style.colorHex || '#1f1f1f'}
              onColorChange={(colorHex) => {
                onUpdatePageModifications((prev: PageModifications) => ({
                  ...prev,
                  textEdits: (prev.textEdits || []).map((t: TextBlockEdit) =>
                    t.id === selectedItem.id
                      ? { ...t, style: { ...t.style, colorHex } }
                      : t
                  ),
                }));
              }}
              fillColor={activeWhiteout?.fillColorHex || '#ffffff'}
              onFillColorChange={(fillColorHex) => {
                onUpdatePageModifications((prev: PageModifications) => ({
                  ...prev,
                  whiteouts: (prev.whiteouts || []).map((w: WhiteoutBlock) =>
                    w.id === selectedItem.id ? { ...w, fillColorHex } : w
                  ),
                }));
              }}
              onDelete={() => {
                if (selectedItem.type === 'text') {
                  // Whiteout / Erase original text
                  const item = textItems.find((t) => t.id === selectedItem.id);
                  if (item) {
                    const whiteout: WhiteoutBlock = {
                      id: `whiteout-del-${Date.now()}`,
                      pageIndex: currentPage - 1,
                      bbox: {
                        x: item.x - 2,
                        y: item.y - 2,
                        width: item.width + 4,
                        height: item.height + 4,
                      },
                      fillColorHex: '#ffffff',
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
