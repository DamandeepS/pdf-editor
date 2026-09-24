import { PDFDocument, degrees } from 'pdf-lib';

/**
 * Validates that the provided PDF byte array is non-empty and accessible.
 */
function assertValidPdfBytes(bytes: Uint8Array, contextName = 'PDF'): Uint8Array {
  if (!bytes || bytes.byteLength === 0 || bytes.buffer?.byteLength === 0) {
    throw new Error(`Cannot perform ${contextName}: Provided PDF byte buffer is empty or detached.`);
  }
  return bytes.slice();
}

/**
 * Deletes a single page by 0-based page index.
 * Throws an error if the document has only 1 page.
 */
export async function deletePage(
  pdfBytes: Uint8Array,
  pageIndex: number
): Promise<Uint8Array> {
  const safeBytes = assertValidPdfBytes(pdfBytes, 'deletePage');
  const doc = await PDFDocument.load(safeBytes);
  const pageCount = doc.getPageCount();

  if (pageCount <= 1) {
    throw new Error('Cannot delete page: PDF document must retain at least one page.');
  }

  if (pageIndex < 0 || pageIndex >= pageCount) {
    throw new Error(`Cannot delete page: Page index ${pageIndex} is out of bounds [0, ${pageCount - 1}].`);
  }

  doc.removePage(pageIndex);
  return await doc.save();
}

/**
 * Reorders pages by moving a page from `fromIndex` to `toIndex`.
 */
export async function reorderPages(
  pdfBytes: Uint8Array,
  fromIndex: number,
  toIndex: number
): Promise<Uint8Array> {
  const safeBytes = assertValidPdfBytes(pdfBytes, 'reorderPages');
  if (fromIndex === toIndex) return safeBytes;

  const doc = await PDFDocument.load(safeBytes);
  const pageCount = doc.getPageCount();

  if (fromIndex < 0 || fromIndex >= pageCount) {
    throw new Error(`Cannot reorder pages: fromIndex ${fromIndex} is out of bounds [0, ${pageCount - 1}].`);
  }
  if (toIndex < 0 || toIndex >= pageCount) {
    throw new Error(`Cannot reorder pages: toIndex ${toIndex} is out of bounds [0, ${pageCount - 1}].`);
  }

  const indices = Array.from({ length: pageCount }, (_, i) => i);
  const [moved] = indices.splice(fromIndex, 1);
  indices.splice(toIndex, 0, moved);

  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(doc, indices);
  for (const page of copiedPages) {
    newDoc.addPage(page);
  }

  return await newDoc.save();
}

/**
 * Rotates a page by specified degrees (defaults to +90 degrees clockwise).
 */
export async function rotatePage(
  pdfBytes: Uint8Array,
  pageIndex: number,
  rotationDegrees: number = 90
): Promise<Uint8Array> {
  const safeBytes = assertValidPdfBytes(pdfBytes, 'rotatePage');
  const doc = await PDFDocument.load(safeBytes);
  const pageCount = doc.getPageCount();

  if (pageIndex < 0 || pageIndex >= pageCount) {
    throw new Error(`Cannot rotate page: Page index ${pageIndex} is out of bounds [0, ${pageCount - 1}].`);
  }

  const page = doc.getPage(pageIndex);
  const currentAngle = page.getRotation().angle;
  const targetAngle = ((currentAngle + rotationDegrees) % 360 + 360) % 360;

  page.setRotation(degrees(targetAngle));
  return await doc.save();
}

/**
 * Duplicates a page at `pageIndex` and inserts the clone immediately after it (`pageIndex + 1`).
 */
export async function duplicatePage(
  pdfBytes: Uint8Array,
  pageIndex: number
): Promise<Uint8Array> {
  const safeBytes = assertValidPdfBytes(pdfBytes, 'duplicatePage');
  const doc = await PDFDocument.load(safeBytes);
  const pageCount = doc.getPageCount();

  if (pageIndex < 0 || pageIndex >= pageCount) {
    throw new Error(`Cannot duplicate page: Page index ${pageIndex} is out of bounds [0, ${pageCount - 1}].`);
  }

  const [copiedPage] = await doc.copyPages(doc, [pageIndex]);
  doc.insertPage(pageIndex + 1, copiedPage);

  return await doc.save();
}

/**
 * Adds an empty blank page to the end of the document.
 * Inherits dimensions of the last page, or defaults to US Letter (612 x 792 pt).
 */
export async function addBlankPage(
  pdfBytes: Uint8Array,
  customWidth?: number,
  customHeight?: number
): Promise<Uint8Array> {
  const safeBytes = assertValidPdfBytes(pdfBytes, 'addBlankPage');
  const doc = await PDFDocument.load(safeBytes);

  let width = customWidth;
  let height = customHeight;

  if (!width || !height) {
    if (doc.getPageCount() > 0) {
      const lastPage = doc.getPage(doc.getPageCount() - 1);
      const size = lastPage.getSize();
      width = width || size.width;
      height = height || size.height;
    } else {
      width = 612;
      height = 792;
    }
  }

  doc.addPage([width, height]);
  return await doc.save();
}

/**
 * Merges source PDF pages into the target PDF document.
 * If `insertAtIndex` is specified, pages are inserted at that position;
 * otherwise, they are appended to the end.
 */
export async function mergePdfs(
  targetPdfBytes: Uint8Array,
  sourcePdfBytes: Uint8Array,
  insertAtIndex?: number
): Promise<Uint8Array> {
  const safeTargetBytes = assertValidPdfBytes(targetPdfBytes, 'mergePdfs target');
  const safeSourceBytes = assertValidPdfBytes(sourcePdfBytes, 'mergePdfs source');

  const targetDoc = await PDFDocument.load(safeTargetBytes);
  const sourceDoc = await PDFDocument.load(safeSourceBytes);

  const sourceIndices = sourceDoc.getPageIndices();
  if (sourceIndices.length === 0) return safeTargetBytes;

  const copiedPages = await targetDoc.copyPages(sourceDoc, sourceIndices);

  if (insertAtIndex !== undefined && insertAtIndex >= 0 && insertAtIndex <= targetDoc.getPageCount()) {
    let targetIdx = insertAtIndex;
    for (const page of copiedPages) {
      targetDoc.insertPage(targetIdx++, page);
    }
  } else {
    for (const page of copiedPages) {
      targetDoc.addPage(page);
    }
  }

  return await targetDoc.save();
}

/**
 * Extracts a single page from a PDF document and returns it as a standalone 1-page PDF.
 */
export async function extractPage(
  pdfBytes: Uint8Array,
  pageIndex: number
): Promise<Uint8Array> {
  const safeBytes = assertValidPdfBytes(pdfBytes, 'extractPage');
  const doc = await PDFDocument.load(safeBytes);
  const pageCount = doc.getPageCount();

  if (pageIndex < 0 || pageIndex >= pageCount) {
    throw new Error(`Cannot extract page: Page index ${pageIndex} is out of bounds [0, ${pageCount - 1}].`);
  }

  const singleDoc = await PDFDocument.create();
  const [copiedPage] = await singleDoc.copyPages(doc, [pageIndex]);
  singleDoc.addPage(copiedPage);

  return await singleDoc.save();
}
