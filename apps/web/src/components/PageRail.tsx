import React, { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { PageModifications } from '@inq/types';
import { IconButton } from '@inq/ui/icon-button';
import {
  ChevronDownIcon,
  LayersIcon,
  TrashIcon,
  MoreVerticalIcon,
  RotateCwIcon,
  CopyIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DownloadIcon,
  UploadIcon,
} from '@inq/icons';

export interface PageRailProps {
  numPages: number;
  currentPage: number;
  onSelectPage: (pageNum: number) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  pdfDocument?: PDFDocumentProxy | null;
  modifications?: Record<number, PageModifications>;
  docRevision?: number;
  onReorderPage?: (fromIndex: number, toIndex: number) => void;
  onDeletePage?: (pageIndex: number) => void;
  onRotatePage?: (pageIndex: number) => void;
  onDuplicatePage?: (pageIndex: number) => void;
  onAddBlankPage?: () => void;
  onDownloadSinglePage?: (pageIndex: number) => void;
  isDragOverRail?: boolean;
}

interface PageThumbnailProps {
  pdfDocument?: PDFDocumentProxy | null;
  pageNum: number;
  pageModifications?: PageModifications;
}

const PageThumbnail: React.FC<PageThumbnailProps> = ({
  pdfDocument,
  pageNum,
  pageModifications,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);
  const [isRendered, setIsRendered] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<number>(1 / 1.294);

  useEffect(() => {
    let isCancelled = false;
    let activeTask: any = null;

    if (!pdfDocument) {
      setIsRendered(false);
      return;
    }
    setIsRendered(false);

    async function renderThumbnail() {
      try {
        if (!pdfDocument) return;

        // Ensure previous render on this canvas is cancelled and awaited before starting a new one
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
            await renderTaskRef.current.promise.catch(() => {});
          } catch {
            // Safe ignore
          }
          renderTaskRef.current = null;
        }

        if (isCancelled || !canvasRef.current) return;
        const page = await pdfDocument.getPage(pageNum);
        if (isCancelled || !canvasRef.current) return;

        const baseViewport = page.getViewport({ scale: 1.0 });
        const ratio = baseViewport.width / baseViewport.height;
        setAspectRatio(ratio);

        // High-DPI thumbnail scaling (target display width ~180px)
        const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
        const targetWidth = 180;
        const scale = (targetWidth / baseViewport.width) * dpr;
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const renderTask = page.render({
          canvasContext: ctx,
          canvas,
          viewport,
        });
        renderTaskRef.current = renderTask;
        activeTask = renderTask;
        await renderTask.promise;
        if (isCancelled) return;

        // Paint live modifications on top of the thumbnail canvas
        if (pageModifications) {
          // 1. Vector whiteouts
          if (pageModifications.whiteouts && pageModifications.whiteouts.length > 0) {
            for (const w of pageModifications.whiteouts) {
              const [vx, vy] = viewport.convertToViewportPoint(w.bbox.x, w.bbox.y + w.bbox.height);
              const vw = w.bbox.width * scale;
              const vh = w.bbox.height * scale;
              ctx.fillStyle = w.fillColorHex || '#ffffff';
              ctx.fillRect(vx, vy, vw, vh);
            }
          }

          // 2. Text edits
          if (pageModifications.textEdits && pageModifications.textEdits.length > 0) {
            for (const edit of pageModifications.textEdits) {
              // If text was nudged/moved, cover original position
              if (edit.originalBbox) {
                const [origX, origY] = viewport.convertToViewportPoint(
                  edit.originalBbox.x,
                  edit.originalBbox.y + edit.originalBbox.height
                );
                const origW = edit.originalBbox.width * scale;
                const origH = edit.originalBbox.height * scale;
                ctx.fillStyle = edit.backgroundColorHex || '#ffffff';
                ctx.fillRect(origX - 1, origY - 1, origW + 2, origH + 2);
              }

              // Cover current position background
              const curBbox = edit.currentBbox || edit.originalBbox;
              const [curX, curY] = viewport.convertToViewportPoint(curBbox.x, curBbox.y + curBbox.height);
              const curW = curBbox.width * scale;
              const curH = curBbox.height * scale;
              ctx.fillStyle = edit.backgroundColorHex || '#ffffff';
              ctx.fillRect(curX - 1, curY - 1, curW + 2, curH + 2);

              // Draw new text
              const fontSize = Math.max(5, (edit.style.fontSize || 12) * scale);
              const fontWeight = edit.style.isBold ? '700 ' : '400 ';
              const fontStyle = edit.style.isItalic ? 'italic ' : 'normal ';
              ctx.font = `${fontStyle}${fontWeight}${fontSize}px ${edit.style.fontFamily || 'Roboto'}, sans-serif`;
              ctx.fillStyle = edit.style.colorHex || '#1f1f1f';
              ctx.textBaseline = 'middle';
              if (edit.style.textAlign === 'right') {
                ctx.textAlign = 'right';
                ctx.fillText(edit.newText, curX + curW, curY + curH / 2);
              } else if (edit.style.textAlign === 'center') {
                ctx.textAlign = 'center';
                ctx.fillText(edit.newText, curX + curW / 2, curY + curH / 2);
              } else {
                ctx.textAlign = 'left';
                ctx.fillText(edit.newText, curX, curY + curH / 2);
              }
            }
          }

          // 3. Image stamps
          if (pageModifications.images && pageModifications.images.length > 0) {
            for (const img of pageModifications.images) {
              const [sx, sy] = viewport.convertToViewportPoint(img.bbox.x, img.bbox.y + img.bbox.height);
              const sw = img.bbox.width * scale;
              const sh = img.bbox.height * scale;
              try {
                const stampImg = new Image();
                stampImg.src = img.dataUrl;
                if (stampImg.complete && stampImg.naturalWidth > 0) {
                  ctx.globalAlpha = img.opacity ?? 1;
                  ctx.drawImage(stampImg, sx, sy, sw, sh);
                  ctx.globalAlpha = 1;
                } else {
                  await new Promise<void>((resolve) => {
                    stampImg.onload = () => {
                      ctx.globalAlpha = img.opacity ?? 1;
                      ctx.drawImage(stampImg, sx, sy, sw, sh);
                      ctx.globalAlpha = 1;
                      resolve();
                    };
                    stampImg.onerror = () => resolve();
                  });
                }
              } catch {
                // Ignore stamp rendering error
              }
            }
          }
        }

        setIsRendered(true);
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.warn('Sidebar thumbnail render warning:', err);
        }
      }
    }

    renderThumbnail();

    return () => {
      isCancelled = true;
      if (activeTask) {
        try {
          activeTask.cancel();
        } catch {
          // Safe ignore
        }
      }
    };
  }, [pdfDocument, pageNum, pageModifications]);

  return (
    <div
      className="page-thumbnail-container"
      style={{ aspectRatio: `${aspectRatio}` }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className={`page-thumbnail-canvas ${isRendered ? 'visible' : ''}`}
      />
      {!isRendered && (
        <div className="page-thumbnail-skeleton">
          <div className="skeleton-shimmer" />
        </div>
      )}
    </div>
  );
};

export const PageRail: React.FC<PageRailProps> = ({
  numPages,
  currentPage,
  onSelectPage,
  isCollapsed,
  onToggleCollapse,
  pdfDocument,
  modifications,
  docRevision,
  onReorderPage,
  onDeletePage,
  onRotatePage,
  onDuplicatePage,
  onAddBlankPage,
  onDownloadSinglePage,
  isDragOverRail,
}) => {
  const pages = Array.from({ length: Math.max(1, numPages) }, (_, i) => i + 1);
  const docFingerprint = (pdfDocument as any)?.fingerprint || (pdfDocument as any)?._pdfInfo?.fingerprint || '';

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [dropPosition, setDropPosition] = useState<'top' | 'bottom' | null>(null);

  // 3-dot menu state
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);

  // Close menu on Escape or click outside
  useEffect(() => {
    if (activeMenuIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenuIndex(null);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.page-menu-container')) {
        setActiveMenuIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenuIndex]);

  const handlePageClick = (pageNum: number) => {
    onSelectPage(pageNum);
    if (typeof window !== 'undefined' && window.innerWidth < 768 && !isCollapsed) {
      onToggleCollapse();
    }
  };

  const handleDragStart = (e: React.DragEvent, pageIdx: number) => {
    e.dataTransfer.setData('text/plain', String(pageIdx));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIndex(pageIdx);
    setActiveMenuIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, pageIdx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const rect = e.currentTarget.getBoundingClientRect();
    const isTopHalf = e.clientY - rect.top < rect.height / 2;
    setDropPosition(isTopHalf ? 'top' : 'bottom');
    setDropTargetIndex(pageIdx);
  };

  const handleDragLeave = (pageIdx: number) => {
    if (dropTargetIndex === pageIdx) {
      setDropTargetIndex(null);
      setDropPosition(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedIndex === null || draggedIndex === undefined) return;
    if (draggedIndex === targetIdx) {
      setDraggedIndex(null);
      setDropTargetIndex(null);
      setDropPosition(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const isTopHalf = e.clientY - rect.top < rect.height / 2;
    let destination = isTopHalf ? targetIdx : targetIdx + 1;
    if (draggedIndex < destination) {
      destination -= 1;
    }

    if (destination !== draggedIndex && onReorderPage) {
      onReorderPage(draggedIndex, destination);
    }

    setDraggedIndex(null);
    setDropTargetIndex(null);
    setDropPosition(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDropTargetIndex(null);
    setDropPosition(null);
  };

  return (
    <aside
      className={`page-rail ${isCollapsed ? 'collapsed' : ''} ${isDragOverRail ? 'drag-target-active' : ''}`}
      aria-label="Page Navigation Rail"
    >
      <div className="page-rail-header">
        {!isCollapsed && <span className="rail-title">Document Pages ({numPages})</span>}
        <IconButton
          tooltip={isCollapsed ? 'Expand Page Rail' : 'Collapse Page Rail'}
          size="sm"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Expand Page Rail' : 'Collapse Page Rail'}
        >
          {isCollapsed ? <LayersIcon size={16} /> : <ChevronDownIcon size={16} />}
        </IconButton>
      </div>

      {isDragOverRail && (
        <div className="rail-drop-indicator-banner">
          <UploadIcon size={16} />
          <span>Drop to Append Pages</span>
        </div>
      )}

      <div className="page-card-list">
        {pages.map((pageNum, idx) => {
          const isActive = pageNum === currentPage;
          const isDraggingThis = draggedIndex === idx;
          const showTopDropLine = dropTargetIndex === idx && dropPosition === 'top' && draggedIndex !== idx;
          const showBottomDropLine = dropTargetIndex === idx && dropPosition === 'bottom' && draggedIndex !== idx;

          return (
            <div
              key={`page-card-${docRevision ?? 0}-${docFingerprint}-${pageNum}`}
              className={`page-card-wrapper ${showTopDropLine ? 'has-drop-indicator-top' : ''} ${showBottomDropLine ? 'has-drop-indicator-bottom' : ''}`}
            >
              {showTopDropLine && <div className="page-card-drop-line line-top" />}
              <div
                className={`page-card ${isActive ? 'active' : ''} ${isDraggingThis ? 'is-dragging' : ''}`}
                onClick={() => handlePageClick(pageNum)}
                role="button"
                tabIndex={0}
                draggable={!isCollapsed}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragLeave={() => handleDragLeave(idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handlePageClick(pageNum);
                  }
                }}
                title={isCollapsed ? `Page ${pageNum}` : `Page ${pageNum} (Drag to reorder)`}
                aria-label={`Page ${pageNum}`}
              >
                <PageThumbnail
                  key={`thumb-${docRevision ?? 0}-${docFingerprint}-${pageNum}`}
                  pdfDocument={pdfDocument}
                  pageNum={pageNum}
                  pageModifications={modifications?.[pageNum - 1]}
                />

                {!isCollapsed && (
                  <div className="page-card-footer">
                    <span className="page-number-tag">Page {pageNum}</span>
                    <div className="page-card-actions" onClick={(e) => e.stopPropagation()}>
                      <IconButton
                        tooltip={numPages <= 1 ? 'Cannot delete the only page' : 'Delete Page'}
                        size="sm"
                        disabled={numPages <= 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePage?.(idx);
                        }}
                        aria-label={`Delete page ${pageNum}`}
                        className="page-delete-btn"
                      >
                        <TrashIcon size={14} />
                      </IconButton>

                      <div className="page-menu-container">
                        <IconButton
                          tooltip="More actions"
                          size="sm"
                          aria-haspopup="true"
                          aria-expanded={activeMenuIndex === idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuIndex(activeMenuIndex === idx ? null : idx);
                          }}
                          aria-label={`Actions for page ${pageNum}`}
                          className="page-menu-btn"
                        >
                          <MoreVerticalIcon size={14} />
                        </IconButton>

                        {activeMenuIndex === idx && (
                          <div
                            className="page-action-menu"
                            role="menu"
                            aria-label={`Page ${pageNum} options`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              role="menuitem"
                              className="page-menu-item"
                              disabled={idx === 0}
                              onClick={() => {
                                onReorderPage?.(idx, idx - 1);
                                setActiveMenuIndex(null);
                              }}
                            >
                              <ArrowUpIcon size={14} />
                              <span>Move Up</span>
                            </button>

                            <button
                              type="button"
                              role="menuitem"
                              className="page-menu-item"
                              disabled={idx === numPages - 1}
                              onClick={() => {
                                onReorderPage?.(idx, idx + 1);
                                setActiveMenuIndex(null);
                              }}
                            >
                              <ArrowDownIcon size={14} />
                              <span>Move Down</span>
                            </button>

                            <button
                              type="button"
                              role="menuitem"
                              className="page-menu-item"
                              onClick={() => {
                                onRotatePage?.(idx);
                                setActiveMenuIndex(null);
                              }}
                            >
                              <RotateCwIcon size={14} />
                              <span>Rotate 90°</span>
                            </button>

                            <button
                              type="button"
                              role="menuitem"
                              className="page-menu-item"
                              onClick={() => {
                                onDuplicatePage?.(idx);
                                setActiveMenuIndex(null);
                              }}
                            >
                              <CopyIcon size={14} />
                              <span>Duplicate Page</span>
                            </button>

                            <button
                              type="button"
                              role="menuitem"
                              className="page-menu-item"
                              onClick={() => {
                                onDownloadSinglePage?.(idx);
                                setActiveMenuIndex(null);
                              }}
                            >
                              <DownloadIcon size={14} />
                              <span>Download Page</span>
                            </button>

                            <div className="page-menu-divider" />

                            <button
                              type="button"
                              role="menuitem"
                              className="page-menu-item page-menu-item--danger"
                              disabled={numPages <= 1}
                              onClick={() => {
                                onDeletePage?.(idx);
                                setActiveMenuIndex(null);
                              }}
                            >
                              <TrashIcon size={14} />
                              <span>Delete Page</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {showBottomDropLine && <div className="page-card-drop-line line-bottom" />}
            </div>
          );
        })}
      </div>

      {onAddBlankPage && (
        <div className="page-rail-footer">
          {!isCollapsed ? (
            <button
              type="button"
              className="page-rail-add-btn"
              onClick={onAddBlankPage}
              title="Add a blank page to the end of the document"
              aria-label="Add Blank Page"
            >
              <PlusIcon size={16} />
              <span>Add Blank Page</span>
            </button>
          ) : (
            <IconButton
              tooltip="Add Blank Page"
              size="sm"
              onClick={onAddBlankPage}
              aria-label="Add Blank Page"
            >
              <PlusIcon size={16} />
            </IconButton>
          )}
        </div>
      )}
    </aside>
  );
};
