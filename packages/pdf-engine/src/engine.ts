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
    if (!originalPdfBytes || originalPdfBytes.byteLength === 0 || originalPdfBytes.buffer?.byteLength === 0) {
      throw new Error(
        'Cannot modify PDF: The provided PDF byte buffer is empty or detached.'
      );
    }

    // Work on a safe slice so callers' buffers are never altered or locked
    const safeBytes = originalPdfBytes.slice();
    const doc = await PDFDocument.load(safeBytes);
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
        // Resolve font first to get exact metrics before whiteout computation
        const font = await this.fontResolver.resolveFont(
          doc,
          edit.style?.fontFamily,
          edit.style?.isBold,
          edit.style?.isItalic,
          options?.customFontBuffers
        );

        let fontSize = edit.style?.fontSize || 12;
        const autoFit = edit.style?.autoFit ?? false;

        // Auto-fit calculation: If explicitly requested and text overflows the bounding box, scale down
        if (autoFit && edit.originalBbox.width > 0) {
          const rawWidth = font.widthOfTextAtSize(edit.newText, fontSize);
          if (rawWidth > edit.originalBbox.width) {
            const scaleFactor = edit.originalBbox.width / rawWidth;
            fontSize = Math.max(5, Math.floor(fontSize * scaleFactor * 10) / 10);
          }
        }

        const textWidth = font.widthOfTextAtSize(edit.newText, fontSize);
        const textHeight = font.heightAtSize(fontSize);

        // In PDF typography, descent extends below baseline by ~0.25 to 0.3 * fontSize
        // We add protective padding so descenders, commas, and anti-aliased subpixels are 100% blanketed
        const origHeight = edit.originalBbox.height || fontSize;
        const effectiveHeight = Math.max(origHeight, fontSize * 1.25);
        const effectiveDescent = Math.max(origHeight * 0.25, fontSize * 0.28);
        const padY = Math.max(1.5, Math.max(origHeight, fontSize) * 0.1);
        const padX = Math.max(2, fontSize * 0.1);

        // Determine position delta in PDF coordinate space
        const deltaX = edit.currentBbox ? edit.currentBbox.x - edit.originalBbox.x : 0;
        const deltaY = edit.currentBbox ? edit.currentBbox.y - edit.originalBbox.y : 0;
        const isMoved = Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1;

        // Determine effective baseline accounting for vertical shift
        const baseBaselineY = edit.baselineY !== undefined ? edit.baselineY : edit.originalBbox.y;
        const effectiveBaselineY = baseBaselineY + deltaY;

        // Calculate horizontal position of new text based on alignment
        const targetX = edit.currentBbox ? edit.currentBbox.x : edit.originalBbox.x;
        const anchorWidth = edit.originalBbox.width || textWidth;

        let newStartX = targetX;
        if (edit.style.textAlign === 'right') {
          newStartX = (targetX + anchorWidth) - textWidth;
        } else if (edit.style.textAlign === 'center') {
          newStartX = targetX + (anchorWidth - textWidth) / 2;
        }
        const newEndX = newStartX + textWidth;

        const origStartX = edit.originalBbox.x;
        const origEndX = edit.originalBbox.x + (edit.originalBbox.width || 0);

        if (!isMoved) {
          // In-place replacement: Whiteout covers the full union envelope of both original and new text
          const unionMinX = Math.min(origStartX, newStartX);
          const unionMaxX = Math.max(origEndX, newEndX);
          const whiteoutX = unionMinX - padX;
          const whiteoutWidth = (unionMaxX - unionMinX) + 2 * padX;

          const whiteoutY =
            edit.baselineY !== undefined
              ? baseBaselineY - effectiveDescent - padY
              : Math.min(edit.originalBbox.y, edit.currentBbox ? edit.currentBbox.y : edit.originalBbox.y) - padY;
          const whiteoutHeight = effectiveHeight + 2 * padY;

          const textWhiteout: WhiteoutBlock = {
            id: `whiteout-${edit.id}`,
            pageIndex,
            bbox: {
              x: whiteoutX,
              y: whiteoutY,
              width: whiteoutWidth,
              height: whiteoutHeight,
            },
            fillColorHex: edit.backgroundColorHex || '#ffffff',
          };
          applyWhiteout(page, textWhiteout);
        } else {
          // Moved: 1. Erase original text at original location
          const origWhiteoutY =
            edit.baselineY !== undefined
              ? baseBaselineY - (origHeight * 0.25) - padY
              : edit.originalBbox.y - padY;
          const origWhiteoutHeight = origHeight + 2 * padY;

          const origWhiteout: WhiteoutBlock = {
            id: `whiteout-orig-${edit.id}`,
            pageIndex,
            bbox: {
              x: origStartX - padX,
              y: origWhiteoutY,
              width: (edit.originalBbox.width || 40) + 2 * padX,
              height: origWhiteoutHeight,
            },
            fillColorHex: edit.backgroundColorHex || '#ffffff',
          };
          applyWhiteout(page, origWhiteout);

          // 2. If background color specified, whiteout moved destination
          if (edit.backgroundColorHex) {
            const movedWhiteout: WhiteoutBlock = {
              id: `whiteout-moved-${edit.id}`,
              pageIndex,
              bbox: {
                x: newStartX - padX,
                y: effectiveBaselineY - (fontSize * 0.28) - padY,
                width: textWidth + 2 * padX,
                height: (fontSize * 1.25) + 2 * padY,
              },
              fillColorHex: edit.backgroundColorHex,
            };
            applyWhiteout(page, movedWhiteout);
          }
        }

        // Inject new vector text at the exact baseline and position
        injectVectorText(page, font, {
          text: edit.newText,
          bbox: {
            x: targetX,
            y: edit.currentBbox ? edit.currentBbox.y : edit.originalBbox.y,
            width: anchorWidth,
            height: edit.currentBbox?.height || textHeight,
          },
          style: {
            ...edit.style,
            fontSize,
            autoFit: false,
          },
          baselineY: effectiveBaselineY,
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
