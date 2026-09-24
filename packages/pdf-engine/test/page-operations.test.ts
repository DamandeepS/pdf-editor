import { describe, it, expect } from 'vitest';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import {
  deletePage,
  reorderPages,
  rotatePage,
  duplicatePage,
  addBlankPage,
  mergePdfs,
  extractPage,
} from '../src/index';

async function createMultiPageTestPdf(numPages = 3): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 1; i <= numPages; i++) {
    const page = doc.addPage([612, 792]);
    page.drawText(`Page ${i}`, { x: 50, y: 700, size: 24, font });
  }
  return await doc.save();
}

describe('PDF Engine Page Operations', () => {
  it('deletes a page and decreases page count', async () => {
    const originalBytes = await createMultiPageTestPdf(3);
    const modifiedBytes = await deletePage(originalBytes, 1); // Delete middle page (index 1)

    const doc = await PDFDocument.load(modifiedBytes);
    expect(doc.getPageCount()).toBe(2);
  });

  it('prevents deleting the only remaining page in a document', async () => {
    const singlePageBytes = await createMultiPageTestPdf(1);
    await expect(deletePage(singlePageBytes, 0)).rejects.toThrow(
      /must retain at least one page/
    );
  });

  it('reorders pages correctly', async () => {
    const originalBytes = await createMultiPageTestPdf(3);
    // Move first page (index 0) to last (index 2)
    const reorderedBytes = await reorderPages(originalBytes, 0, 2);

    const doc = await PDFDocument.load(reorderedBytes);
    expect(doc.getPageCount()).toBe(3);
  });

  it('rotates a page by 90 degrees', async () => {
    const originalBytes = await createMultiPageTestPdf(2);
    const rotatedBytes = await rotatePage(originalBytes, 0, 90);

    const doc = await PDFDocument.load(rotatedBytes);
    expect(doc.getPage(0).getRotation().angle).toBe(90);

    // Rotate again by 90
    const rotated180Bytes = await rotatePage(rotatedBytes, 0, 90);
    const doc180 = await PDFDocument.load(rotated180Bytes);
    expect(doc180.getPage(0).getRotation().angle).toBe(180);
  });

  it('duplicates an existing page', async () => {
    const originalBytes = await createMultiPageTestPdf(2);
    const duplicatedBytes = await duplicatePage(originalBytes, 0);

    const doc = await PDFDocument.load(duplicatedBytes);
    expect(doc.getPageCount()).toBe(3);
  });

  it('adds a blank page to the document', async () => {
    const originalBytes = await createMultiPageTestPdf(2);
    const withBlankBytes = await addBlankPage(originalBytes);

    const doc = await PDFDocument.load(withBlankBytes);
    expect(doc.getPageCount()).toBe(3);
  });

  it('merges two PDF documents together', async () => {
    const targetBytes = await createMultiPageTestPdf(2);
    const sourceBytes = await createMultiPageTestPdf(1);

    const mergedBytes = await mergePdfs(targetBytes, sourceBytes);
    const doc = await PDFDocument.load(mergedBytes);
    expect(doc.getPageCount()).toBe(3);
  });

  it('extracts a single page into an independent 1-page PDF', async () => {
    const originalBytes = await createMultiPageTestPdf(4);
    const extractedBytes = await extractPage(originalBytes, 2);

    const doc = await PDFDocument.load(extractedBytes);
    expect(doc.getPageCount()).toBe(1);
  });
});
