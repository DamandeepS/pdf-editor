import { PDFDocument } from 'pdf-lib';
import { ModificationDelta, WhiteoutBlock } from '@inq/types';
import { StandardFontResolver } from './fonts';
import { applyWhiteout } from './whiteout';
import { injectVectorText } from './text';
import { embedImageStamp } from './images';

export interface PdfEngineOptions {
  customFontBuffers?: Map<string, Uint8Array>;
}

export class PdfEngine {
  private fontResolver = new StandardFontResolver();

  /**
   * Applies all modifications (text edits, whiteouts, images, new texts) to an existing PDF
   * and returns the assembled, native vector PDF bytes.
   */
  async modifyPdf(
    originalPdfBytes: Uint8Array,
    delta: ModificationDelta,
    options?: PdfEngineOptions
  ): Promise<Uint8Array> {
    const doc = await PDFDocument.load(originalPdfBytes);
    const pages = doc.getPages();

    // Iterate through pages with modifications
    for (const [pageIndexStr, pageMods] of Object.entries(delta.pages)) {
      const pageIndex = Number(pageIndexStr);
      if (pageIndex < 0 || pageIndex >= pages.length) continue;

      const page = pages[pageIndex];

      // 1. Apply Standalone Whiteouts / Redactions
      for (const whiteout of pageMods.whiteouts || []) {
        applyWhiteout(page, whiteout);
      }

      // 2. Process Text Block Edits (Auto-Whiteout old text + Inject new text)
      for (const edit of pageMods.textEdits || []) {
        // Redact original text area cleanly
        const textWhiteout: WhiteoutBlock = {
          id: `whiteout-${edit.id}`,
          pageIndex,
          bbox: edit.originalBbox,
          fillColorHex: '#ffffff',
        };
        applyWhiteout(page, textWhiteout);

        // Resolve font
        const font = await this.fontResolver.resolveFont(
          doc,
          edit.style.fontFamily,
          edit.style.isBold,
          edit.style.isItalic,
          options?.customFontBuffers
        );

        // Inject new vector text
        injectVectorText(page, font, {
          text: edit.newText,
          bbox: edit.currentBbox,
          style: edit.style,
        });
      }

      // 3. Process Newly Added Text Blocks
      for (const newText of pageMods.newTexts || []) {
        const font = await this.fontResolver.resolveFont(
          doc,
          newText.style.fontFamily,
          newText.style.isBold,
          newText.style.isItalic,
          options?.customFontBuffers
        );

        injectVectorText(page, font, {
          text: newText.text,
          bbox: newText.bbox,
          style: newText.style,
        });
      }

      // 4. Process Image Stamps
      for (const stamp of pageMods.images || []) {
        await embedImageStamp(doc, page, stamp);
      }
    }

    return await doc.save();
  }
}
