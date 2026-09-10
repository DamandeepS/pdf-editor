import { BoundingBox } from '@inq/types';

export interface ViewportScale {
  scaleX: number;
  scaleY: number;
  pageHeightPt: number;
}

/**
 * Converts screen/viewport coordinates (top-left origin) to PDF points (bottom-left origin).
 */
export function viewportToPdfCoordinates(
  screenBox: BoundingBox,
  pageHeightPt: number,
  scale = 1
): BoundingBox {
  const width = screenBox.width * scale;
  const height = screenBox.height * scale;
  const x = screenBox.x * scale;
  // Invert Y axis: PDF origin is bottom-left
  const y = pageHeightPt - (screenBox.y * scale + height);

  return {
    x: Math.round(x * 100) / 100,
    y: Math.round(y * 100) / 100,
    width: Math.round(width * 100) / 100,
    height: Math.round(height * 100) / 100,
  };
}

/**
 * Converts PDF coordinates (bottom-left origin) back to screen viewport coordinates (top-left origin).
 */
export function pdfToViewportCoordinates(
  pdfBox: BoundingBox,
  pageHeightPt: number,
  scale = 1
): BoundingBox {
  const width = pdfBox.width / scale;
  const height = pdfBox.height / scale;
  const x = pdfBox.x / scale;
  const y = (pageHeightPt - (pdfBox.y + pdfBox.height)) / scale;

  return {
    x: Math.round(x * 100) / 100,
    y: Math.round(y * 100) / 100,
    width: Math.round(width * 100) / 100,
    height: Math.round(height * 100) / 100,
  };
}
