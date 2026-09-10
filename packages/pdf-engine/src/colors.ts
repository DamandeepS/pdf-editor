import { rgb, Color } from 'pdf-lib';

/**
 * Converts a hex color string (e.g. #4285f4 or #fff) into a pdf-lib Color (values 0 to 1).
 */
export function hexToPdfColor(hex: string): Color {
  if (!hex || typeof hex !== 'string') {
    return rgb(0, 0, 0);
  }

  let cleanHex = hex.replace('#', '').trim();

  // Expand shorthand format (e.g. "03F") to full form ("0033FF")
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
  }

  if (cleanHex.length >= 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
    return rgb(
      isNaN(r) ? 0 : Math.min(1, Math.max(0, r)),
      isNaN(g) ? 0 : Math.min(1, Math.max(0, g)),
      isNaN(b) ? 0 : Math.min(1, Math.max(0, b))
    );
  }

  return rgb(0, 0, 0);
}
