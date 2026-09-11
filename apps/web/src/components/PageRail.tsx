import React, { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { PageModifications } from '@inq/types';
import { IconButton } from '@inq/ui/icon-button';
import { ChevronDownIcon, LayersIcon } from '@inq/icons';

export interface PageRailProps {
  numPages: number;
  currentPage: number;
  onSelectPage: (pageNum: number) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  pdfDocument?: PDFDocumentProxy | null;
  modifications?: Record<number, PageModifications>;
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

    if (!pdfDocument || !canvasRef.current) {
      setIsRendered(false);
      return;
    }

    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch {
        // Safe ignore
      }
      renderTaskRef.current = null;
    }

    async function renderThumbnail() {
      try {
        if (!pdfDocument) return;
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
              ctx.fillText(edit.newText, curX, curY + curH / 2);
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
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // Safe ignore
        }
        renderTaskRef.current = null;
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
}) => {
  const pages = Array.from({ length: Math.max(1, numPages) }, (_, i) => i + 1);

  const handlePageClick = (pageNum: number) => {
    onSelectPage(pageNum);
    if (typeof window !== 'undefined' && window.innerWidth < 768 && !isCollapsed) {
      onToggleCollapse();
    }
  };

  return (
    <aside className={`page-rail ${isCollapsed ? 'collapsed' : ''}`} aria-label="Page Navigation Rail">
      <div className="page-rail-header">
        {!isCollapsed && <span className="rail-title">Document Pages</span>}
        <IconButton
          tooltip={isCollapsed ? 'Expand Page Rail' : 'Collapse Page Rail'}
          size="sm"
          onClick={onToggleCollapse}
        >
          {isCollapsed ? <LayersIcon size={16} /> : <ChevronDownIcon size={16} />}
        </IconButton>
      </div>

      <div className="page-card-list">
        {pages.map((pageNum) => {
          const isActive = pageNum === currentPage;
          return (
            <div
              key={pageNum}
              className={`page-card ${isActive ? 'active' : ''}`}
              onClick={() => handlePageClick(pageNum)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handlePageClick(pageNum);
                }
              }}
              title={`Page ${pageNum}`}
            >
              <PageThumbnail
                pdfDocument={pdfDocument}
                pageNum={pageNum}
                pageModifications={modifications?.[pageNum - 1]}
              />
              {!isCollapsed && <span className="page-number-tag">Page {pageNum}</span>}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
