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
  private embeddedFontCache: Map<string, PDFFont> = new Map();

  async resolveFont(
    doc: PDFDocument,
    family = 'Helvetica',
    isBold = false,
    isItalic = false,
    customFontBuffers?: Map<string, Uint8Array>
  ): Promise<PDFFont> {
    const key = `${family}-${isBold ? 'bold' : 'normal'}-${isItalic ? 'italic' : 'normal'}`;

    if (this.embeddedFontCache.has(key)) {
      return this.embeddedFontCache.get(key)!;
    }

    // Check custom font buffer first
    if (customFontBuffers && customFontBuffers.has(family)) {
      doc.registerFontkit(fontkit);
      const fontBuffer = customFontBuffers.get(family)!;
      const customFont = await doc.embedFont(fontBuffer);
      this.embeddedFontCache.set(key, customFont);
      return customFont;
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
    this.embeddedFontCache.set(key, font);
    return font;
  }
}
