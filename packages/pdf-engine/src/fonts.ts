import { PDFDocument, PDFFont, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

export interface FontResolver {
  resolveFont(
    doc: PDFDocument,
    family: string,
    isBold?: boolean,
    isItalic?: boolean,
    customFontBuffers?: Map<string, Uint8Array>
  ): Promise<PDFFont>;
}

export class StandardFontResolver implements FontResolver {
  private embeddedFontCache: WeakMap<PDFDocument, Map<string, PDFFont>> = new WeakMap();

  async resolveFont(
    doc: PDFDocument,
    family = 'Helvetica',
    isBold = false,
    isItalic = false,
    customFontBuffers?: Map<string, Uint8Array>
  ): Promise<PDFFont> {
    const key = `${family}-${isBold ? 'bold' : 'normal'}-${isItalic ? 'italic' : 'normal'}`;

    let docCache = this.embeddedFontCache.get(doc);
    if (!docCache) {
      docCache = new Map();
      this.embeddedFontCache.set(doc, docCache);
    }

    if (docCache.has(key)) {
      return docCache.get(key)!;
    }

    // Check custom font buffer first (exact variant, family, bold default, or generic default)
    if (customFontBuffers) {
      const buffer =
        customFontBuffers.get(key) ||
        customFontBuffers.get(`${family}-${isBold ? 'bold' : 'normal'}`) ||
        customFontBuffers.get(family) ||
        customFontBuffers.get(isBold ? 'default-bold' : 'default') ||
        customFontBuffers.get('default');

      if (buffer) {
        doc.registerFontkit(fontkit);
        const customFont = await doc.embedFont(buffer);
        docCache.set(key, customFont);
        return customFont;
      }
    }

    // Map family to PDF Standard Fonts
    const normalized = family.toLowerCase().replace(/[\s-_]/g, '');

    let standardFont: StandardFonts = StandardFonts.Helvetica;

    if (normalized.includes('courier') || normalized.includes('mono')) {
      if (isBold && isItalic) standardFont = StandardFonts.CourierBoldOblique;
      else if (isBold) standardFont = StandardFonts.CourierBold;
      else if (isItalic) standardFont = StandardFonts.CourierOblique;
      else standardFont = StandardFonts.Courier;
    } else if (normalized.includes('times') || normalized.includes('serif')) {
      if (isBold && isItalic) standardFont = StandardFonts.TimesRomanBoldItalic;
      else if (isBold) standardFont = StandardFonts.TimesRomanBold;
      else if (isItalic) standardFont = StandardFonts.TimesRomanItalic;
      else standardFont = StandardFonts.TimesRoman;
    } else {
      // Default to Helvetica (matches Arial, Roboto, Inter, Sans-serif)
      if (isBold && isItalic) standardFont = StandardFonts.HelveticaBoldOblique;
      else if (isBold) standardFont = StandardFonts.HelveticaBold;
      else if (isItalic) standardFont = StandardFonts.HelveticaOblique;
      else standardFont = StandardFonts.Helvetica;
    }

    const font = await doc.embedFont(standardFont);
    docCache.set(key, font);
    return font;
  }
}
