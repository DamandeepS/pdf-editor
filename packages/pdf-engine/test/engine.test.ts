import { describe, it, expect } from 'vitest';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'node:fs';
import path from 'node:path';
import {
  PdfEngine,
  viewportToPdfCoordinates,
  pdfToViewportCoordinates,
  hexToPdfColor,
  sanitizeTextForFont,
} from '../src/index';
import { ModificationDelta } from '@inq/types';

describe('PDF Engine Coordinate Transformations', () => {
  it('correctly inverts Y axis from viewport to PDF points', () => {
    const pageHeightPt = 792; // Standard Letter height
    const screenBox = { x: 50, y: 100, width: 200, height: 40 };

    const pdfBox = viewportToPdfCoordinates(screenBox, pageHeightPt, 1);
    expect(pdfBox.x).toBe(50);
    expect(pdfBox.width).toBe(200);
    expect(pdfBox.height).toBe(40);
    // Y in PDF = 792 - (100 + 40) = 652
    expect(pdfBox.y).toBe(652);
  });

  it('roundtrips coordinates between viewport and PDF space', () => {
    const pageHeightPt = 842; // A4 height
    const original = { x: 72, y: 144, width: 150, height: 30 };

    const pdfCoords = viewportToPdfCoordinates(original, pageHeightPt, 1);
    const backToViewport = pdfToViewportCoordinates(pdfCoords, pageHeightPt, 1);

    expect(backToViewport.x).toBeCloseTo(original.x);
    expect(backToViewport.y).toBeCloseTo(original.y);
    expect(backToViewport.width).toBeCloseTo(original.width);
    expect(backToViewport.height).toBeCloseTo(original.height);
  });
});

describe('Color Conversions', () => {
  it('parses standard 6-digit hex to PDF Color', () => {
    const color = hexToPdfColor('#4285f4');
    expect(color).toBeDefined();
  });

  it('handles invalid or empty hex gracefully', () => {
    const color = hexToPdfColor('');
    expect(color).toBeDefined();
  });
});

describe('Vector PDF Modification Pipeline', () => {
  it('applies text edits, whiteouts, and new blocks and outputs valid vector PDF', async () => {
    // 1. Create a synthetic test PDF
    const baseDoc = await PDFDocument.create();
    const basePage = baseDoc.addPage([612, 792]);
    const font = await baseDoc.embedFont(StandardFonts.Helvetica);
    basePage.drawText('Original Amount: $100.00', {
      x: 50,
      y: 700,
      size: 14,
      font,
      color: rgb(0, 0, 0),
    });
    const originalPdfBytes = await baseDoc.save();

    // 2. Define modifications
    const delta: ModificationDelta = {
      pages: {
        0: {
          pageIndex: 0,
          textEdits: [
            {
              id: 'edit-amount',
              pageIndex: 0,
              originalText: '$100.00',
              newText: '$4,500.00',
              originalBbox: { x: 150, y: 695, width: 60, height: 20 },
              currentBbox: { x: 150, y: 695, width: 80, height: 20 },
              style: {
                fontFamily: 'Helvetica',
                fontSize: 14,
                colorHex: '#4285f4',
                isBold: true,
                isItalic: false,
                letterSpacing: 0,
                lineHeight: 1.2,
                textAlign: 'left',
                autoFit: true,
              },
            },
          ],
          whiteouts: [
            {
              id: 'wo-1',
              pageIndex: 0,
              bbox: { x: 50, y: 600, width: 200, height: 30 },
              fillColorHex: '#ffffff',
            },
          ],
          newTexts: [
            {
              id: 'new-status',
              pageIndex: 0,
              text: 'STATUS: PAID',
              bbox: { x: 50, y: 550, width: 120, height: 18 },
              style: {
                fontFamily: 'Helvetica',
                fontSize: 12,
                colorHex: '#34a853',
                isBold: true,
                isItalic: false,
                letterSpacing: 0,
                lineHeight: 1.2,
                textAlign: 'left',
                autoFit: false,
              },
            },
          ],
          images: [],
        },
      },
    };

    // 3. Process via PdfEngine
    const engine = new PdfEngine();
    const modifiedBytes = await engine.modifyPdf(originalPdfBytes, delta);

    expect(modifiedBytes).toBeInstanceOf(Uint8Array);
    expect(modifiedBytes.length).toBeGreaterThan(0);

    // Verify PDF header %PDF-
    const header = String.fromCharCode(...modifiedBytes.slice(0, 5));
    expect(header).toBe('%PDF-');

    // 4. Verify modified PDF can be reloaded without corruption
    const reloadedDoc = await PDFDocument.load(modifiedBytes);
    expect(reloadedDoc.getPageCount()).toBe(1);
  });

  it('correctly applies custom backgroundColorHex and baselineY for text on tinted containers', async () => {
    // 1. Create document with a tinted highlight box
    const baseDoc = await PDFDocument.create();
    const basePage = baseDoc.addPage([612, 792]);
    const fontBold = await baseDoc.embedFont(StandardFonts.HelveticaBold);

    // Draw light blue container box (#e8f0fe)
    basePage.drawRectangle({
      x: 390,
      y: 310,
      width: 180,
      height: 32,
      color: rgb(232 / 255, 240 / 255, 254 / 255),
    });
    // Draw original text at baseline 325
    basePage.drawText('$1,452.00', {
      x: 480,
      y: 325,
      size: 14,
      font: fontBold,
      color: rgb(66 / 255, 133 / 255, 244 / 255),
    });
    const originalPdfBytes = await baseDoc.save();

    // 2. Define modification with background color matching container and pinned baselineY
    const delta: ModificationDelta = {
      pages: {
        0: {
          pageIndex: 0,
          textEdits: [
            {
              id: 'edit-total-due',
              pageIndex: 0,
              originalText: '$1,452.00',
              newText: '$1,422.00',
              originalBbox: { x: 480, y: 325, width: 62.27, height: 14 },
              currentBbox: { x: 480, y: 325, width: 62.27, height: 14 },
              baselineY: 325,
              backgroundColorHex: '#e8f0fe',
              style: {
                fontFamily: 'Helvetica',
                fontSize: 14,
                colorHex: '#4285f4',
                isBold: true,
                isItalic: false,
                letterSpacing: 0,
                lineHeight: 1.2,
                textAlign: 'left',
                autoFit: true,
              },
            },
          ],
          whiteouts: [],
          images: [],
          newTexts: [],
        },
      },
    };

    // 3. Process via PdfEngine
    const engine = new PdfEngine();
    const modifiedBytes = await engine.modifyPdf(originalPdfBytes, delta);
    expect(modifiedBytes.length).toBeGreaterThan(0);

    const reloadedDoc = await PDFDocument.load(modifiedBytes);
    expect(reloadedDoc.getPageCount()).toBe(1);
  });

  it('rejects empty or detached byte buffers with a clear error', async () => {
    const engine = new PdfEngine();
    const emptyBytes = new Uint8Array(0);
    await expect(engine.modifyPdf(emptyBytes, { pages: {} })).rejects.toThrow(
      'Cannot modify PDF: The provided PDF byte buffer is empty or detached.'
    );
  });

  it('preserves caller input buffer without modifying or detaching it', async () => {
    const doc = await PDFDocument.create();
    doc.addPage([200, 200]);
    const inputBytes = await doc.save();
    const originalLength = inputBytes.length;

    const engine = new PdfEngine();
    const result = await engine.modifyPdf(inputBytes, { pages: {} });

    expect(result).toBeInstanceOf(Uint8Array);
    expect(inputBytes.length).toBe(originalLength);
    expect(inputBytes.buffer.byteLength).toBeGreaterThan(0);
  });

  it('correctly handles moved and right-aligned edited fields', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([612, 792]);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    page.drawText('$0', { x: 500, y: 300, size: 12, font });
    const originalPdfBytes = await doc.save();

    const delta: ModificationDelta = {
      pages: {
        0: {
          pageIndex: 0,
          textEdits: [
            {
              id: 'edit-shifted-amount',
              pageIndex: 0,
              originalText: '$0',
              newText: '$1,422.00',
              originalBbox: { x: 500, y: 300, width: 14, height: 12 },
              currentBbox: { x: 480, y: 310, width: 60, height: 12 }, // Shifted left 20pt, up 10pt
              baselineY: 300,
              style: {
                fontFamily: 'Helvetica',
                fontSize: 12,
                colorHex: '#4285f4',
                isBold: true,
                isItalic: false,
                letterSpacing: 0,
                lineHeight: 1.2,
                textAlign: 'right',
                autoFit: true,
              },
            },
          ],
          whiteouts: [],
          images: [],
          newTexts: [],
        },
      },
    };

    const engine = new PdfEngine();
    const modifiedBytes = await engine.modifyPdf(originalPdfBytes, delta);
    expect(modifiedBytes.length).toBeGreaterThan(0);

    const reloaded = await PDFDocument.load(modifiedBytes);
    expect(reloaded.getPageCount()).toBe(1);
  });
});

describe('Unicode & Currency Handling in Vector Engine', () => {
  it('safely handles Rupee symbol (₹) with StandardFonts without throwing WinAnsi error', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([612, 792]);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    page.drawText('Original Amount: $100.00', { x: 50, y: 700, size: 14, font });
    const originalPdfBytes = await doc.save();

    const delta: ModificationDelta = {
      pages: {
        0: {
          pageIndex: 0,
          textEdits: [
            {
              id: 'edit-rupee',
              pageIndex: 0,
              originalText: '$100.00',
              newText: '₹1,452.00',
              originalBbox: { x: 50, y: 700, width: 80, height: 16 },
              currentBbox: { x: 50, y: 700, width: 100, height: 16 },
              baselineY: 700,
              style: {
                fontFamily: 'Helvetica',
                fontSize: 14,
                colorHex: '#1f1f1f',
                isBold: false,
                isItalic: false,
                letterSpacing: 0,
                lineHeight: 1.2,
                textAlign: 'left',
                autoFit: true,
              },
            },
          ],
          whiteouts: [],
          images: [],
          newTexts: [],
        },
      },
    };

    const engine = new PdfEngine();
    const modifiedBytes = await engine.modifyPdf(originalPdfBytes, delta);
    expect(modifiedBytes.length).toBeGreaterThan(0);

    const reloaded = await PDFDocument.load(modifiedBytes);
    expect(reloaded.getPageCount()).toBe(1);
  });

  it('safely handles non-WinAnsi symbols (₹, ₽, quotes, dashes, ellipsis)', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([612, 792]);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    page.drawText('Header', { x: 50, y: 700, size: 14, font });
    const originalPdfBytes = await doc.save();

    const delta: ModificationDelta = {
      pages: {
        0: {
          pageIndex: 0,
          textEdits: [],
          whiteouts: [],
          images: [],
          newTexts: [
            {
              id: 'new-unicode-block',
              pageIndex: 0,
              text: 'Price: ₹500 / ₽200 – "Special Offer"…',
              bbox: { x: 50, y: 650, width: 250, height: 20 },
              style: {
                fontFamily: 'Helvetica',
                fontSize: 12,
                colorHex: '#34a853',
                isBold: true,
                isItalic: false,
                letterSpacing: 0,
                lineHeight: 1.2,
                textAlign: 'left',
                autoFit: false,
              },
            },
          ],
        },
      },
    };

    const engine = new PdfEngine();
    const modifiedBytes = await engine.modifyPdf(originalPdfBytes, delta);
    expect(modifiedBytes.length).toBeGreaterThan(0);

    const reloaded = await PDFDocument.load(modifiedBytes);
    expect(reloaded.getPageCount()).toBe(1);
  });

  it('natively encodes Rupee symbol (₹) when custom TrueType font buffer is provided', async () => {
    const fontPath = path.resolve('../../node_modules/pdfjs-dist/standard_fonts/LiberationSans-Regular.ttf');
    if (!fs.existsSync(fontPath)) return;

    const fontBytes = fs.readFileSync(fontPath);
    const customFontBuffers = new Map<string, Uint8Array>([
      ['default', fontBytes],
      ['Helvetica', fontBytes],
    ]);

    const doc = await PDFDocument.create();
    const page = doc.addPage([612, 792]);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    page.drawText('Original: $50', { x: 50, y: 700, size: 14, font });
    const originalPdfBytes = await doc.save();

    const delta: ModificationDelta = {
      pages: {
        0: {
          pageIndex: 0,
          textEdits: [
            {
              id: 'edit-native-rupee',
              pageIndex: 0,
              originalText: '$50',
              newText: '₹2,500.00',
              originalBbox: { x: 50, y: 700, width: 80, height: 16 },
              currentBbox: { x: 50, y: 700, width: 100, height: 16 },
              baselineY: 700,
              style: {
                fontFamily: 'Helvetica',
                fontSize: 14,
                colorHex: '#1f1f1f',
                isBold: false,
                isItalic: false,
                letterSpacing: 0,
                lineHeight: 1.2,
                textAlign: 'left',
                autoFit: false,
              },
            },
          ],
          whiteouts: [],
          images: [],
          newTexts: [],
        },
      },
    };

    const engine = new PdfEngine();
    const modifiedBytes = await engine.modifyPdf(originalPdfBytes, delta, { customFontBuffers });
    expect(modifiedBytes.length).toBeGreaterThan(0);

    const reloaded = await PDFDocument.load(modifiedBytes);
    expect(reloaded.getPageCount()).toBe(1);
  });

  it('directly sanitizes text for standard fonts via sanitizeTextForFont', async () => {
    const doc = await PDFDocument.create();
    const helvetica = await doc.embedFont(StandardFonts.Helvetica);

    // Standard ASCII remains untouched
    expect(sanitizeTextForFont('Invoice #101 - $50.00', helvetica)).toBe('Invoice #101 - $50.00');

    // Rupee symbol transliterates to Rs.
    expect(sanitizeTextForFont('Total: ₹1,452.00', helvetica)).toBe('Total: Rs. 1,452.00');
    expect(sanitizeTextForFont('1452 ₹', helvetica)).toBe('1452 Rs.');

    // WinAnsi natively supports typographer quotes, en-dash, ellipsis, so they remain intact
    expect(sanitizeTextForFont('“Smart Quotes” and – en-dash…', helvetica)).toBe('“Smart Quotes” and – en-dash…');
  });

  describe('Font Resolver & Bold Variant Selection', () => {
    it('correctly maps Helvetica with bold to HelveticaBold standard font when no custom buffer provided', async () => {
      const doc = await PDFDocument.create();
      const resolver = new (await import('../src/fonts')).StandardFontResolver();
      const boldFont = await resolver.resolveFont(doc, 'Helvetica', true, false);
      expect(boldFont.name).toBe('Helvetica-Bold');

      const boldDetectedFont = await resolver.resolveFont(doc, 'Helvetica (Detected)', true, false);
      expect(boldDetectedFont.name).toBe('Helvetica-Bold');
    });

    it('prioritizes bold custom font buffers over regular custom font buffers when bold is requested', async () => {
      const fontDir = path.resolve(__dirname, '../../../apps/server/src/fonts');
      if (!fs.existsSync(fontDir)) return;

      const regularBytes = new Uint8Array(fs.readFileSync(path.join(fontDir, 'LiberationSans-Regular.ttf')));
      const boldBytes = new Uint8Array(fs.readFileSync(path.join(fontDir, 'LiberationSans-Bold.ttf')));

      const customFontBuffers = new Map<string, Uint8Array>([
        ['Roboto', regularBytes],
        ['Roboto-bold', boldBytes],
        ['Helvetica', regularBytes],
        ['Helvetica-bold', boldBytes],
        ['default', regularBytes],
        ['default-bold', boldBytes],
      ]);

      const doc = await PDFDocument.create();
      const resolver = new (await import('../src/fonts')).StandardFontResolver();

      // Bold Roboto
      const robotoBold = await resolver.resolveFont(doc, 'Roboto', true, false, customFontBuffers);
      expect(robotoBold.name).toMatch(/Bold/i);

      // Bold Helvetica with custom buffers
      const helveticaBold = await resolver.resolveFont(doc, 'Helvetica', true, false, customFontBuffers);
      expect(helveticaBold.name).toMatch(/Bold/i);

      // Bold Helvetica (Detected) with custom buffers
      const detectedBold = await resolver.resolveFont(doc, 'Helvetica (Detected)', true, false, customFontBuffers);
      expect(detectedBold.name).toMatch(/Bold/i);

      // Regular Roboto
      const robotoRegular = await resolver.resolveFont(doc, 'Roboto', false, false, customFontBuffers);
      expect(robotoRegular.name).not.toMatch(/Bold/i);
    });
  });
});


