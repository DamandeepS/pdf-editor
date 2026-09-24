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
    // 1. Clean family name: strip detected/sans/serif tags in parentheses and extra spaces
    const cleanFamily = (family || 'Helvetica').replace(/\s*\([^)]*\)/g, '').trim();
    const normalized = cleanFamily.toLowerCase().replace(/[\s-_]/g, '');

    // 2. Check if font family name itself explicitly conveys bold or italic weight
    const hasBoldInName = /bold|black|heavy/i.test(cleanFamily);
    const hasItalicInName = /italic|oblique/i.test(cleanFamily);
    const effectiveBold = Boolean(isBold || hasBoldInName);
    const effectiveItalic = Boolean(isItalic || hasItalicInName);

    const key = `${normalized}-${effectiveBold ? 'bold' : 'normal'}-${effectiveItalic ? 'italic' : 'normal'}`;

    let docCache = this.embeddedFontCache.get(doc);
    if (!docCache) {
      docCache = new Map();
      this.embeddedFontCache.set(doc, docCache);
    }

    if (docCache.has(key)) {
      return docCache.get(key)!;
    }

    // 3. Check custom font buffer first (TrueType fonts embedded with fontkit)
    // CRITICAL: Always prioritize the requested variant (Bold/Italic) over generic family name
    // so that an exact bold request is NEVER downgraded to regular.
    if (customFontBuffers) {
      let buffer: Uint8Array | undefined;

      // Check bold+italic variants
      if (effectiveBold && effectiveItalic) {
        buffer =
          customFontBuffers.get(`${cleanFamily}-bolditalic`) ||
          customFontBuffers.get(`${cleanFamily}-BoldItalic`) ||
          customFontBuffers.get(`${cleanFamily}-bold-italic`) ||
          customFontBuffers.get(`${normalized}-bolditalic`) ||
          customFontBuffers.get(`${normalized}-bold-italic`) ||
          customFontBuffers.get('default-bolditalic') ||
          customFontBuffers.get('default-bold') ||
          customFontBuffers.get('bold');
      }
      // Check bold variants
      else if (effectiveBold) {
        buffer =
          customFontBuffers.get(`${cleanFamily}-bold`) ||
          customFontBuffers.get(`${cleanFamily}-Bold`) ||
          customFontBuffers.get(`${cleanFamily}_bold`) ||
          customFontBuffers.get(`${normalized}-bold`) ||
          customFontBuffers.get(`${normalized}bold`) ||
          customFontBuffers.get('Helvetica-bold') ||
          customFontBuffers.get('helvetica-bold') ||
          customFontBuffers.get('default-bold') ||
          customFontBuffers.get('bold');
      }
      // Check italic variants
      else if (effectiveItalic) {
        buffer =
          customFontBuffers.get(`${cleanFamily}-italic`) ||
          customFontBuffers.get(`${cleanFamily}-Italic`) ||
          customFontBuffers.get(`${cleanFamily}_italic`) ||
          customFontBuffers.get(`${normalized}-italic`) ||
          customFontBuffers.get(`${normalized}italic`) ||
          customFontBuffers.get('Helvetica-italic') ||
          customFontBuffers.get('helvetica-italic') ||
          customFontBuffers.get('default-italic') ||
          customFontBuffers.get('italic');
      }
      // Regular variant requested
      else {
        buffer =
          customFontBuffers.get(cleanFamily) ||
          customFontBuffers.get(normalized) ||
          customFontBuffers.get(`${cleanFamily}-regular`) ||
          customFontBuffers.get(`${cleanFamily}-Regular`) ||
          customFontBuffers.get(`${normalized}-regular`) ||
          customFontBuffers.get('default');
      }

      // Safe fallback if specific variant buffer was missing
      if (!buffer) {
        buffer =
          (effectiveBold ? customFontBuffers.get('default-bold') : undefined) ||
          (effectiveItalic ? customFontBuffers.get('default-italic') : undefined) ||
          customFontBuffers.get('default') ||
          customFontBuffers.get(cleanFamily) ||
          customFontBuffers.get(normalized);
      }

      if (buffer) {
        doc.registerFontkit(fontkit);
        const customFont = await doc.embedFont(buffer);
        docCache.set(key, customFont);
        return customFont;
      }
    }

    // 4. Map family to PDF Standard Fonts (Helvetica, Courier, Times-Roman)
    let standardFont: StandardFonts = StandardFonts.Helvetica;

    if (normalized.includes('courier') || normalized.includes('mono')) {
      if (effectiveBold && effectiveItalic) standardFont = StandardFonts.CourierBoldOblique;
      else if (effectiveBold) standardFont = StandardFonts.CourierBold;
      else if (effectiveItalic) standardFont = StandardFonts.CourierOblique;
      else standardFont = StandardFonts.Courier;
    } else if (normalized.includes('times') || normalized.includes('serif')) {
      if (effectiveBold && effectiveItalic) standardFont = StandardFonts.TimesRomanBoldItalic;
      else if (effectiveBold) standardFont = StandardFonts.TimesRomanBold;
      else if (effectiveItalic) standardFont = StandardFonts.TimesRomanItalic;
      else standardFont = StandardFonts.TimesRoman;
    } else {
      // Default to Helvetica (matches Arial, Roboto, Inter, Sans-serif)
      if (effectiveBold && effectiveItalic) standardFont = StandardFonts.HelveticaBoldOblique;
      else if (effectiveBold) standardFont = StandardFonts.HelveticaBold;
      else if (effectiveItalic) standardFont = StandardFonts.HelveticaOblique;
      else standardFont = StandardFonts.Helvetica;
    }

    const font = await doc.embedFont(standardFont);
    docCache.set(key, font);
    return font;
  }
}
