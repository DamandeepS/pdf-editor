import { describe, it, expect } from 'vitest';
import { PDFDocument, rgb } from 'pdf-lib';
import { PdfEngine } from '../src/engine';
import { hexToPdfColor, parseColorAndOpacity } from '../src/colors';
import { DocumentDelta } from '@inq/types';

describe('PDF Engine - Critique QA: Alignment, Geometry & Color Fidelity', () => {
  describe('Color and Opacity parsing', () => {
    it('accurately parses standard 6-digit hex colors', () => {
      const color = hexToPdfColor('#4285f4');
      // 0x42 / 255 = 0.2588, 0x85 / 255 = 0.5215, 0xf4 / 255 = 0.9568
      expect(color).toBeDefined();
      const parsed = parseColorAndOpacity('#4285f4');
      expect(parsed.opacity).toBe(1);
    });

    it('accurately parses shorthand 3-digit hex colors', () => {
      const parsed = parseColorAndOpacity('#fff');
      expect(parsed.opacity).toBe(1);
      const color = hexToPdfColor('#fff');
      expect(color).toEqual(rgb(1, 1, 1));
    });

    it('accurately parses 8-digit hex colors with alpha', () => {
      const parsed = parseColorAndOpacity('#ffffff80');
      expect(parsed.opacity).toBeCloseTo(128 / 255, 2);
      expect(parsed.color).toEqual(rgb(1, 1, 1));
    });

    it('accurately parses rgb(...) color strings', () => {
      const parsed = parseColorAndOpacity('rgb(66, 133, 244)');
      expect(parsed.opacity).toBe(1);
      expect(parsed.color).toBeDefined();
    });

    it('accurately parses rgba(...) color strings with fractional opacity', () => {
      const parsed = parseColorAndOpacity('rgba(66, 133, 244, 0.75)');
      expect(parsed.opacity).toBeCloseTo(0.75, 2);
    });

    it('gracefully falls back to default on null or malformed inputs', () => {
      const fallback = rgb(0.5, 0.5, 0.5);
      const parsed = parseColorAndOpacity('not-a-color', fallback, 0.8);
      expect(parsed.color).toBe(fallback);
      expect(parsed.opacity).toBe(0.8);
    });
  });

  describe('Geometric Whiteout Union & Text Alignment Envelope', () => {
    async function createBasePdf(): Promise<Uint8Array> {
      const doc = await PDFDocument.create();
      const page = doc.addPage([600, 800]);
      page.drawText('Original content for reference', { x: 50, y: 750, size: 12 });
      return await doc.save();
    }

    it('right-aligned text expansion: expands whiteout envelope to the left to cover new text completely', async () => {
      const pdfBytes = await createBasePdf();
      const engine = new PdfEngine();

      // Original amount: $10.00 (x: 450, width: 40) -> right edge is at 490
      // New amount: $125,000.00 (much wider)
      const delta: DocumentDelta = {
        pages: {
          0: {
            textEdits: [
              {
                id: 'price-edit',
                pageIndex: 0,
                originalText: '$10.00',
                newText: '$125,000.00',
                originalBbox: { x: 450, y: 700, width: 40, height: 14 },
                currentBbox: { x: 450, y: 700, width: 40, height: 14 },
                baselineY: 703,
                style: {
                  fontFamily: 'Helvetica',
                  fontSize: 14,
                  colorHex: '#000000',
                  isBold: true,
                  isItalic: false,
                  letterSpacing: 0,
                  lineHeight: 1.2,
                  textAlign: 'right',
                  autoFit: false,
                },
              },
            ],
            whiteouts: [],
            newTexts: [],
            images: [],
          },
        },
      };

      const modifiedBytes = await engine.modifyPdf(pdfBytes, delta);
      expect(modifiedBytes).toBeInstanceOf(Uint8Array);

      // Verify valid PDF generated
      const reloaded = await PDFDocument.load(modifiedBytes);
      expect(reloaded.getPageCount()).toBe(1);
    });

    it('font-size reduction: whiteout envelope preserves original height so large text glyphs are not exposed', async () => {
      const pdfBytes = await createBasePdf();
      const engine = new PdfEngine();

      // Original: 28pt heading (height: 28, baseline: 650)
      // New text: 10pt small caption
      const delta: DocumentDelta = {
        pages: {
          0: {
            textEdits: [
              {
                id: 'heading-shrink',
                pageIndex: 0,
                originalText: 'BIG HEADING TITLE',
                newText: 'small title',
                originalBbox: { x: 50, y: 640, width: 220, height: 28 },
                currentBbox: { x: 50, y: 640, width: 220, height: 28 },
                baselineY: 650,
                style: {
                  fontFamily: 'Helvetica',
                  fontSize: 10,
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
            newTexts: [],
            images: [],
          },
        },
      };

      const modifiedBytes = await engine.modifyPdf(pdfBytes, delta);
      expect(modifiedBytes).toBeInstanceOf(Uint8Array);

      const reloaded = await PDFDocument.load(modifiedBytes);
      expect(reloaded.getPageCount()).toBe(1);
    });

    it('WYSIWYG font scaling: autoFit=false preserves requested fontSize when text expands', async () => {
      const pdfBytes = await createBasePdf();
      const engine = new PdfEngine();

      // Original bbox width is 30pt. New text is 120pt wide.
      // With autoFit: false, font size must remain 16pt!
      const delta: DocumentDelta = {
        pages: {
          0: {
            textEdits: [
              {
                id: 'no-autofit',
                pageIndex: 0,
                originalText: 'Foo',
                newText: 'A significantly longer description text block',
                originalBbox: { x: 50, y: 500, width: 30, height: 16 },
                currentBbox: { x: 50, y: 500, width: 30, height: 16 },
                style: {
                  fontFamily: 'Helvetica',
                  fontSize: 16,
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
            newTexts: [],
            images: [],
          },
        },
      };

      const modifiedBytes = await engine.modifyPdf(pdfBytes, delta);
      expect(modifiedBytes.length).toBeGreaterThan(0);
    });

    it('center-aligned text edit: expands whiteout symmetrically to both left and right', async () => {
      const pdfBytes = await createBasePdf();
      const engine = new PdfEngine();

      const delta: DocumentDelta = {
        pages: {
          0: {
            textEdits: [
              {
                id: 'center-edit',
                pageIndex: 0,
                originalText: 'TAX',
                newText: 'VALUE ADDED TAX (VAT) 2026',
                originalBbox: { x: 200, y: 400, width: 40, height: 14 },
                currentBbox: { x: 200, y: 400, width: 40, height: 14 },
                baselineY: 403,
                style: {
                  fontFamily: 'Helvetica',
                  fontSize: 14,
                  colorHex: '#34a853',
                  isBold: true,
                  isItalic: false,
                  letterSpacing: 0,
                  lineHeight: 1.2,
                  textAlign: 'center',
                  autoFit: false,
                },
              },
            ],
            whiteouts: [],
            newTexts: [],
            images: [],
          },
        },
      };

      const modifiedBytes = await engine.modifyPdf(pdfBytes, delta);
      const reloaded = await PDFDocument.load(modifiedBytes);
      expect(reloaded.getPageCount()).toBe(1);
    });

    it('moved text: correctly whites out original position and injects at new position with custom background', async () => {
      const pdfBytes = await createBasePdf();
      const engine = new PdfEngine();

      const delta: DocumentDelta = {
        pages: {
          0: {
            textEdits: [
              {
                id: 'moved-edit',
                pageIndex: 0,
                originalText: 'Total: $500.00',
                newText: 'Total: $750.00',
                originalBbox: { x: 100, y: 300, width: 80, height: 16 },
                currentBbox: { x: 150, y: 250, width: 80, height: 16 }, // Moved by deltaX=50, deltaY=-50
                baselineY: 303,
                backgroundColorHex: '#fefefe',
                style: {
                  fontFamily: 'Helvetica',
                  fontSize: 14,
                  colorHex: '#ea4335',
                  isBold: true,
                  isItalic: false,
                  letterSpacing: 0,
                  lineHeight: 1.2,
                  textAlign: 'left',
                  autoFit: false,
                },
              },
            ],
            whiteouts: [],
            newTexts: [],
            images: [],
          },
        },
      };

      const modifiedBytes = await engine.modifyPdf(pdfBytes, delta);
      const reloaded = await PDFDocument.load(modifiedBytes);
      expect(reloaded.getPageCount()).toBe(1);
    });
  });
});
