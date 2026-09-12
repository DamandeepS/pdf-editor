import { rgb, Color } from 'pdf-lib';

/**
 * Result of parsing a CSS color string for PDF rendering.
 */
export interface ParsedPdfColor {
  color: Color;
  opacity: number;
}

/**
 * Parses hex, rgb, or rgba color strings into a pdf-lib Color and opacity (0 to 1).
 */
export function parseColorAndOpacity(
  colorStr: string,
  defaultColor = rgb(0, 0, 0),
  defaultOpacity = 1
): ParsedPdfColor {
  if (!colorStr || typeof colorStr !== 'string') {
    return { color: defaultColor, opacity: defaultOpacity };
  }

  const str = colorStr.trim().toLowerCase();

  // 1. Handle rgba(...) and rgb(...) formats
  const rgbaMatch = str.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([0-9.]+)\s*\)/);
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1], 10) / 255;
    const g = parseInt(rgbaMatch[2], 10) / 255;
    const b = parseInt(rgbaMatch[3], 10) / 255;
    const a = parseFloat(rgbaMatch[4]);
    return {
      color: rgb(
        Math.min(1, Math.max(0, r)),
        Math.min(1, Math.max(0, g)),
        Math.min(1, Math.max(0, b))
      ),
      opacity: isNaN(a) ? 1 : Math.min(1, Math.max(0, a)),
    };
  }

  const rgbMatch = str.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10) / 255;
    const g = parseInt(rgbMatch[2], 10) / 255;
    const b = parseInt(rgbMatch[3], 10) / 255;
    return {
      color: rgb(
        Math.min(1, Math.max(0, r)),
        Math.min(1, Math.max(0, g)),
        Math.min(1, Math.max(0, b))
      ),
      opacity: 1,
    };
  }

  // 2. Handle 'transparent'
  if (str === 'transparent') {
    return { color: defaultColor, opacity: 0 };
  }

  // 3. Handle hex formats
  const hexPattern = /^#?([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
  if (!hexPattern.test(str)) {
    return { color: defaultColor, opacity: defaultOpacity };
  }

  let cleanHex = str.replace('#', '').trim();

  // Shorthand #RGB -> #RRGGBB
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
  }

  // 8-digit hex #RRGGBBAA
  if (cleanHex.length === 8) {
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
    const a = parseInt(cleanHex.substring(6, 8), 16) / 255;
    return {
      color: rgb(
        isNaN(r) ? 0 : Math.min(1, Math.max(0, r)),
        isNaN(g) ? 0 : Math.min(1, Math.max(0, g)),
        isNaN(b) ? 0 : Math.min(1, Math.max(0, b))
      ),
      opacity: isNaN(a) ? 1 : Math.min(1, Math.max(0, a)),
    };
  }

  // 6-digit hex #RRGGBB
  if (cleanHex.length >= 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
    return {
      color: rgb(
        isNaN(r) ? 0 : Math.min(1, Math.max(0, r)),
        isNaN(g) ? 0 : Math.min(1, Math.max(0, g)),
        isNaN(b) ? 0 : Math.min(1, Math.max(0, b))
      ),
      opacity: 1,
    };
  }

  return { color: defaultColor, opacity: defaultOpacity };
}

/**
 * Converts a hex or rgb/rgba color string into a pdf-lib Color (values 0 to 1).
 */
export function hexToPdfColor(colorStr: string, defaultColor = rgb(0, 0, 0)): Color {
  return parseColorAndOpacity(colorStr, defaultColor).color;
}
