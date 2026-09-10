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
      let pageIndex = typeof pageMods.pageIndex === 'number' ? pageMods.pageIndex : Number(pageIndexStr);
      // If 1-indexed key was passed and out of bounds, adjust to 0-indexed
      if (pageIndex >= pages.length && Number(pageIndexStr) > 0 && Number(pageIndexStr) <= pages.length) {
        pageIndex = Number(pageIndexStr) - 1;
      }
      if (pageIndex < 0 || pageIndex >= pages.length) continue;

      const page = pages[pageIndex];

      // 1. Apply Standalone Whiteouts / Redactions
      for (const whiteout of pageMods.whiteouts || []) {
        applyWhiteout(page, whiteout);
      }

      // 2. Process Text Block Edits (Auto-Whiteout old text + Inject new text)
      for (const edit of pageMods.textEdits || []) {
        const fontSize = edit.style?.fontSize || 12;
        // In PDF typography, descent extends below baseline by ~0.25 to 0.3 * fontSize
        // We add protective padding so descenders, commas, and anti-aliased subpixels are 100% blanketed
        const descent = fontSize * 0.28;
        const padY = Math.max(1.5, fontSize * 0.1);
        const padX = Math.max(2, fontSize * 0.1);

        // Determine effective baseline
        const baselineY = edit.baselineY !== undefined ? edit.baselineY : edit.originalBbox.y;

        // Calculate robust whiteout bbox that covers from below descenders to above ascenders
        const originalWidth = edit.originalBbox.width || 40;
        const currentWidth = edit.currentBbox?.width || originalWidth;
        const whiteoutWidth = Math.max(originalWidth, currentWidth) + 2 * padX;
        const whiteoutHeight =
          edit.baselineY !== undefined
            ? fontSize * 1.25 + 2 * padY
            : edit.originalBbox.height + 2 * padY;
        const whiteoutY =
          edit.baselineY !== undefined
            ? baselineY - descent - padY
            : edit.originalBbox.y - padY;

        const textWhiteout: WhiteoutBlock = {
          id: `whiteout-${edit.id}`,
          pageIndex,
          bbox: {
            x: edit.originalBbox.x - padX,
            y: whiteoutY,
            width: whiteoutWidth,
            height: whiteoutHeight,
          },
          fillColorHex: edit.backgroundColorHex || '#ffffff',
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

        // Inject new vector text at the exact baseline
        injectVectorText(page, font, {
          text: edit.newText,
          bbox: edit.currentBbox,
          style: edit.style,
          baselineY: edit.baselineY,
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
