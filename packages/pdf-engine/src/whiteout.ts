import { PDFPage } from 'pdf-lib';
import { WhiteoutBlock } from '@inq/types';
import { hexToPdfColor } from './colors';

/**
 * Applies a vector whiteout / redaction box onto a PDF page.
 * Coordinates are expected in standard PDF 72pt points.
 */
export function applyWhiteout(page: PDFPage, block: WhiteoutBlock): void {
  const { x, y, width, height } = block.bbox;
  const color = hexToPdfColor(block.fillColorHex || '#ffffff');

  // Draw opaque vector rectangle over the area
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color,
    opacity: 1,
  });
}
