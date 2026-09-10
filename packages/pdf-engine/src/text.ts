import { PDFPage, PDFFont } from 'pdf-lib';
import { TextBlockEdit, NewTextBlock, TextStyleOptions } from '@inq/types';
import { hexToPdfColor } from './colors';

export interface TextInjectionOptions {
  text: string;
  bbox: { x: number; y: number; width: number; height: number };
  style: TextStyleOptions;
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
  const { text, bbox, style } = options;
  if (!text) return;

  let fontSize = style.fontSize || 12;
  const color = hexToPdfColor(style.colorHex || '#1f1f1f');

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
    startX = bbox.x + Math.max(0, (bbox.width - finalWidth) / 2);
  } else if (style.textAlign === 'right') {
    startX = bbox.x + Math.max(0, bbox.width - finalWidth);
  }

  // Baseline Calculation:
  // In PDF, y represents the text baseline. We vertically center or align to bottom of bbox.
  const baselineOffset = textHeight * 0.2;
  const startY = bbox.y + Math.max(0, (bbox.height - textHeight) / 2) + baselineOffset;

  page.drawText(text, {
    x: startX,
    y: startY,
    size: fontSize,
    font,
    color,
    lineHeight: style.lineHeight ? style.lineHeight * fontSize : undefined,
  });
}
