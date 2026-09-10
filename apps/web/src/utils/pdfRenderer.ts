import * as pdfjs from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

// Initialize PDF.js worker
try {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
} catch {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

export interface ExtractedTextItem {
  id: string;
  text: string;
  x: number;          // PDF pt (from left)
  y: number;          // PDF pt (from bottom)
  width: number;      // PDF pt
  height: number;     // PDF pt
  fontSize: number;   // approximate pt
  fontName: string;
  screenX: number;    // Viewport pixels (from left)
  screenY: number;    // Viewport pixels (from top)
  screenWidth: number;
  screenHeight: number;
}

/**
 * Loads a PDFDocumentProxy from binary Uint8Array or base64
 */
export async function loadPdfDocument(data: Uint8Array | string): Promise<PDFDocumentProxy> {
  let sourceData: Uint8Array;
  if (typeof data === 'string') {
    const raw = data.includes(',') ? data.split(',')[1] : data;
    const binary = atob(raw);
    const len = binary.length;
    sourceData = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      sourceData[i] = binary.charCodeAt(i);
    }
  } else {
    sourceData = data;
  }

  const loadingTask = pdfjs.getDocument({ data: sourceData });
  return await loadingTask.promise;
}

/**
 * Renders a PDF page to an HTML5 Canvas with device pixel ratio scaling for ultra-crisp display
 */
export async function renderPageToCanvas(
  page: PDFPageProxy,
  canvas: HTMLCanvasElement,
  scale: number
): Promise<{ width: number; height: number; scale: number }> {
  const dpr = window.devicePixelRatio || 1;
  const viewport = page.getViewport({ scale: scale * dpr });
  const displayViewport = page.getViewport({ scale });

  // Canvas internal buffer scaled by DPR for Retina crispness
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  // CSS display dimensions match the unscaled viewport
  canvas.style.width = `${displayViewport.width}px`;
  canvas.style.height = `${displayViewport.height}px`;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D canvas context');

  // Fill canvas with pure paper white
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const renderContext = {
    canvasContext: ctx,
    canvas,
    viewport,
  };

  await page.render(renderContext).promise;

  return {
    width: displayViewport.width,
    height: displayViewport.height,
    scale,
  };
}

/**
 * Extracts text items from a PDF page with coordinate conversion to viewport screen coordinates
 */
export async function extractPageTextItems(
  page: PDFPageProxy,
  scale: number
): Promise<ExtractedTextItem[]> {
  const viewport = page.getViewport({ scale });
  const textContent = await page.getTextContent();
  const items: ExtractedTextItem[] = [];

  for (let i = 0; i < textContent.items.length; i++) {
    const item = textContent.items[i] as any;
    if (!item.str || item.str.trim().length === 0) continue;

    // item.transform is [scaleX, skewY, skewX, scaleY, transX, transY]
    const transform = item.transform;
    const pdfX = transform[4];
    const pdfY = transform[5];
    const fontSize = Math.hypot(transform[2], transform[3]) || Math.abs(transform[0]) || 12;
    const fontHeight = fontSize;
    const fontWidth = item.width || (item.str.length * fontSize * 0.6);

    // Convert PDF pt coordinates to screen coordinates
    // PDF coordinates: (pdfX, pdfY) is baseline in bottom-left origin
    // Viewport convertToViewportPoint converts (pdfX, pdfY) to top-left origin screen point
    const [screenX, screenYBaseline] = viewport.convertToViewportPoint(pdfX, pdfY);

    const screenWidth = fontWidth * scale;
    const screenHeight = fontHeight * scale;
    // The top-left screen Y is roughly baseline minus font height
    const screenY = screenYBaseline - screenHeight;

    items.push({
      id: `text-${page.pageNumber}-${i}`,
      text: item.str,
      x: pdfX,
      y: pdfY,
      width: fontWidth,
      height: fontHeight,
      fontSize: Math.round(fontSize * 10) / 10,
      fontName: item.fontName || 'Helvetica',
      screenX: Math.max(0, screenX),
      screenY: Math.max(0, screenY),
      screenWidth: Math.max(12, screenWidth),
      screenHeight: Math.max(12, screenHeight),
    });
  }

  return items;
}
