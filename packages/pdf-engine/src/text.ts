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
 * Safely sanitizes text for encoding with the given PDFFont.
 * If the font natively supports the characters (e.g. TrueType font embedded with fontkit),
 * the text is returned unmodified.
 * If the font cannot encode certain characters (e.g. Standard 14 PDF fonts with WinAnsi encoding),
 * unsupported characters like the Indian Rupee symbol ('₹') are transliterated to safe equivalents
 * (e.g. 'Rs. ' or 'INR') and any remaining unencodable characters are replaced with safe ASCII fallbacks.
 */
export function sanitizeTextForFont(text: string, font: PDFFont): string {
  if (!text) return '';

  // 1. First test if the font can already encode the string directly as-is
  try {
    font.encodeText(text);
    return text;
  } catch {
    // Font cannot encode some characters in this text; proceed with safe transliteration
  }

  // 2. Perform intelligent transliteration for common financial/document Unicode characters
  const candidate = text
    // Indian Rupee (U+20B9)
    .replace(/(\d+)\s*\u20B9/g, '$1 Rs.')
    .replace(/\u20B9\s*/g, 'Rs. ')
    .replace(/\u20B9/g, 'Rs.')
    // Other common currency symbols not in WinAnsi
    .replace(/\u20BD\s*/g, 'RUB ') // Russian Ruble
    .replace(/\u20BA\s*/g, 'TRY ') // Turkish Lira
    .replace(/\u20A9\s*/g, 'KRW ') // Korean Won
    .replace(/\u20AB\s*/g, 'VND ') // Vietnamese Dong
    .replace(/\u20BF\s*/g, 'BTC ') // Bitcoin
    .replace(/\u20A6\s*/g, 'NGN ') // Nigerian Naira
    .replace(/\u20B1\s*/g, 'PHP ') // Philippine Peso
    .replace(/\u20B4\s*/g, 'UAH ') // Ukrainian Hryvnia
    .replace(/\u20AA\s*/g, 'ILS ') // Israeli Shekel
    // Punctuation and typographer quotes/dashes
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u201A\u201E]/g, ',')
    .replace(/\u2026/g, '...')
    .replace(/\u2212/g, '-')
    .replace(/[\u2010\u2011\u2012\u2013]/g, '-')
    .replace(/[\u2014\u2015]/g, '--')
    .replace(/[\u00A0\u2000-\u200A]/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\u2022/g, '*')
    .replace(/\u2122/g, 'TM');

  // Test if candidate can now be encoded cleanly
  try {
    font.encodeText(candidate);
    return candidate;
  } catch {
    // If some characters still fail, filter character-by-character
    let result = '';
    for (const char of candidate) {
      try {
        font.encodeText(char);
        result += char;
      } catch {
        // Fallback: strip or replace unencodable character
        result += '?';
      }
    }
    return result;
  }
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

  const safeText = sanitizeTextForFont(text, font);
  if (!safeText) return;

  let fontSize = style.fontSize || 12;
  const { color, opacity } = parseColorAndOpacity(style.colorHex || '#1f1f1f');

  // Auto-fit calculation: If text overflows the bounding box width, scale font size
  if (style.autoFit && bbox.width > 0) {
    const textWidth = font.widthOfTextAtSize(safeText, fontSize);
    if (textWidth > bbox.width) {
      const scaleFactor = bbox.width / textWidth;
      fontSize = Math.max(5, Math.floor(fontSize * scaleFactor * 10) / 10);
    }
  }

  // Calculate text dimensions
  const finalWidth = font.widthOfTextAtSize(safeText, fontSize);
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

  page.drawText(safeText, {
    x: startX,
    y: startY,
    size: fontSize,
    font,
    color,
    opacity: opacity < 1 ? opacity : undefined,
    lineHeight: style.lineHeight ? style.lineHeight * fontSize : undefined,
  });
}
