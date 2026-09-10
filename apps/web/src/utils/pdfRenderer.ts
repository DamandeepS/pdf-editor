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
  y: number;          // PDF pt (from bottom) - baseline
  width: number;      // PDF pt
  height: number;     // PDF pt
  fontSize: number;   // approximate pt
  fontName: string;
  screenX: number;    // Viewport pixels (from left)
  screenY: number;    // Viewport pixels (from top)
  screenWidth: number;
  screenHeight: number;
  // Enhanced typographic & visual attributes
  baselineY: number;
  isBold: boolean;
  isItalic: boolean;
  fontFamily: string;
  detectedColorHex: string;
  detectedBackgroundColorHex: string;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
    };
  }
  return {
    r: parseInt(clean.substring(0, 2), 16) || 0,
    g: parseInt(clean.substring(2, 4), 16) || 0,
    b: parseInt(clean.substring(4, 6), 16) || 0,
  };
}

function sampleColorsFromCanvas(
  canvas: HTMLCanvasElement | null | undefined,
  screenX: number,
  screenY: number,
  screenWidth: number,
  screenHeight: number
): { textColorHex: string; backgroundColorHex: string } {
  const defaultRes = { textColorHex: '#1f1f1f', backgroundColorHex: '#ffffff' };
  if (!canvas) return defaultRes;

  try {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return defaultRes;

    const scaleX = canvas.width / (canvas.clientWidth || 1);
    const scaleY = canvas.height / (canvas.clientHeight || 1);

    const cx = screenX * scaleX;
    const cy = screenY * scaleY;
    const cw = screenWidth * scaleX;
    const ch = screenHeight * scaleY;

    // 1. Perimeter sampling (outside text bounds) to find background color
    const margin = Math.max(4 * scaleX, 4);
    const perimeterPoints = [
      { x: cx - margin, y: cy + ch * 0.5 },
      { x: cx + cw + margin, y: cy + ch * 0.5 },
      { x: cx + cw * 0.5, y: cy - margin },
      { x: cx + cw * 0.5, y: cy + ch + margin },
      { x: cx - margin, y: cy - margin },
      { x: cx + cw + margin, y: cy - margin },
      { x: cx - margin, y: cy + ch + margin },
      { x: cx + cw + margin, y: cy + ch + margin },
    ];

    const bgColors: Record<string, number> = {};
    for (const pt of perimeterPoints) {
      const px = Math.min(Math.max(0, Math.round(pt.x)), canvas.width - 1);
      const py = Math.min(Math.max(0, Math.round(pt.y)), canvas.height - 1);
      const pixel = ctx.getImageData(px, py, 1, 1).data;
      if (pixel[3] < 10) continue; // transparent
      const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
      bgColors[hex] = (bgColors[hex] || 0) + 1;
    }

    let dominantBg = '#ffffff';
    let maxBgCount = 0;
    for (const [hex, count] of Object.entries(bgColors)) {
      if (count > maxBgCount) {
        maxBgCount = count;
        dominantBg = hex;
      }
    }

    // 2. Interior sampling to find dominant text glyph color
    const sx = Math.min(Math.max(0, Math.round(cx)), canvas.width - 1);
    const sy = Math.min(Math.max(0, Math.round(cy)), canvas.height - 1);
    const sw = Math.min(Math.max(1, Math.round(cw)), canvas.width - sx);
    const sh = Math.min(Math.max(1, Math.round(ch)), canvas.height - sy);

    const imgData = ctx.getImageData(sx, sy, sw, sh);
    const textColors: Record<string, number> = {};
    const bgRgb = hexToRgb(dominantBg);

    for (let i = 0; i < imgData.data.length; i += 4) {
      const r = imgData.data[i];
      const g = imgData.data[i + 1];
      const b = imgData.data[i + 2];
      const a = imgData.data[i + 3];
      if (a < 50) continue;

      // Color distance from background
      const dist = Math.abs(r - bgRgb.r) + Math.abs(g - bgRgb.g) + Math.abs(b - bgRgb.b);
      if (dist > 60) {
        const hex = rgbToHex(r, g, b);
        textColors[hex] = (textColors[hex] || 0) + 1;
      }
    }

    let dominantText = '#1f1f1f';
    let maxTextCount = 0;
    for (const [hex, count] of Object.entries(textColors)) {
      if (count > maxTextCount) {
        maxTextCount = count;
        dominantText = hex;
      }
    }

    return {
      textColorHex: dominantText,
      backgroundColorHex: dominantBg,
    };
  } catch {
    return defaultRes;
  }
}

function inferFontProperties(page: PDFPageProxy, fontName: string): {
  fontFamily: string;
  isBold: boolean;
  isItalic: boolean;
  resolvedFontName: string;
} {
  let resolvedFontName = fontName || '';
  let isBold = false;
  let isItalic = false;

  try {
    const fontObj =
      (page.commonObjs as any)?.get?.(fontName) ||
      (page as any).objs?.get?.(fontName);
    if (fontObj) {
      if (fontObj.name) resolvedFontName = fontObj.name;
      if (typeof fontObj.bold === 'boolean') isBold = fontObj.bold;
      if (typeof fontObj.italic === 'boolean') isItalic = fontObj.italic;
    }
  } catch {
    // ignore
  }

  const lower = resolvedFontName.toLowerCase();
  if (!isBold) {
    isBold = /bold|black|heavy|b[-_]|[-_]b$/i.test(lower);
  }
  if (!isItalic) {
    isItalic = /italic|oblique|i[-_]|[-_]i$/i.test(lower);
  }

  let fontFamily = 'Helvetica';
  if (/times|serif|roman/i.test(lower)) {
    fontFamily = 'Times-Roman';
  } else if (/courier|mono|consolas|code/i.test(lower)) {
    fontFamily = 'Courier';
  } else if (/roboto/i.test(lower)) {
    fontFamily = 'Roboto';
  } else if (/inter/i.test(lower)) {
    fontFamily = 'Inter';
  }

  return { fontFamily, isBold, isItalic, resolvedFontName };
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
    // CRITICAL: Always slice/copy the Uint8Array buffer before passing to pdfjs.getDocument!
    // The PDF.js web worker transfers the underlying ArrayBuffer via postMessage transferable list,
    // which detaches the buffer on the main thread. By slicing here, the caller's Uint8Array remains
    // fully attached and valid for subsequent export operations, local modifications, and downloads.
    sourceData = data.slice();
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
  scale: number,
  canvas?: HTMLCanvasElement | null
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
    const pdfY = transform[5]; // Baseline in PDF coordinate space
    const fontSize = Math.hypot(transform[2], transform[3]) || Math.abs(transform[0]) || 12;
    const fontHeight = fontSize;
    const fontWidth = item.width || (item.str.length * fontSize * 0.6);

    const descent = fontSize * 0.28;
    const ascent = fontSize * 0.85;

    // Convert PDF pt coordinates to screen coordinates
    // PDF coordinates: (pdfX, pdfY) is baseline in bottom-left origin
    const [screenXBaseline, screenYBaseline] = viewport.convertToViewportPoint(pdfX, pdfY);

    const screenWidth = fontWidth * scale;
    const screenHeight = (ascent + descent) * scale;
    // Top of text bounding box on screen
    const screenY = screenYBaseline - ascent * scale;
    const screenX = screenXBaseline;

    // Infer font properties
    const fontProps = inferFontProperties(page, item.fontName);

    // Sample colors from canvas if available
    const colors = sampleColorsFromCanvas(
      canvas,
      screenX,
      screenY,
      screenWidth,
      screenHeight
    );

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
      baselineY: pdfY,
      isBold: fontProps.isBold,
      isItalic: fontProps.isItalic,
      fontFamily: fontProps.fontFamily,
      detectedColorHex: colors.textColorHex,
      detectedBackgroundColorHex: colors.backgroundColorHex,
    });
  }

  return items;
}
