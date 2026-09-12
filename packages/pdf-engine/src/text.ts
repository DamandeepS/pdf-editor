import { PDFPage, PDFFont } from 'pdf-lib';
import { TextBlockEdit, NewTextBlock, TextStyleOptions } from '@inq/types';
import { parseColorAndOpacity } from './colors';

export interface TextInjectionOptions {
  text: string;
  bbox: { x: number; y: number; width: number; height: number };
  style: TextStyleOptions;
  baselineY?: number;
}

/**
 * Injects vector text onto a PDF page with accurate font metrics, auto-fit, and baseline calculation.
 * Coordinates are expected in standard PDF 72pt points.
 */
export function injectVectorText(
  page: PDFPage,
  font: PDFFont,
  options: TextInjectionOptions
): void {
  const { text, bbox, style, baselineY } = options;
  if (!text) return;

  let fontSize = style.fontSize || 12;
  const { color, opacity } = parseColorAndOpacity(style.colorHex || '#1f1f1f');

  // Auto-fit calculation: If text overflows the bounding box width, scale font size
  if (style.autoFit && bbox.width > 0) {
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    if (textWidth > bbox.width) {
      const scaleFactor = bbox.width / textWidth;
      fontSize = Math.max(5, Math.floor(fontSize * scaleFactor * 10) / 10);
    }
  }

  // Calculate text dimensions
  const finalWidth = font.widthOfTextAtSize(text, fontSize);
  const textHeight = font.heightAtSize(fontSize);

  // Horizontal Alignment
  let startX = bbox.x;
  if (style.textAlign === 'center') {
    startX = bbox.x + (bbox.width - finalWidth) / 2;
  } else if (style.textAlign === 'right') {
    startX = (bbox.x + bbox.width) - finalWidth;
  }

  // Baseline Calculation:
  // If baselineY is provided, we use the exact original baseline coordinate.
  // Otherwise, vertically center or align within bbox.
  const baselineOffset = textHeight * 0.2;
  const startY =
    baselineY !== undefined
      ? baselineY
      : bbox.y + Math.max(0, (bbox.height - textHeight) / 2) + baselineOffset;

  page.drawText(text, {
    x: startX,
    y: startY,
    size: fontSize,
    font,
    color,
    opacity: opacity < 1 ? opacity : undefined,
    lineHeight: style.lineHeight ? style.lineHeight * fontSize : undefined,
  });
}
