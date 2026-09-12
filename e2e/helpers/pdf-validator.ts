import { PDFDocument } from 'pdf-lib';

export interface ValidatedPdfMeta {
  pageCount: number;
  pageSizes: Array<{ width: number; height: number }>;
}

export async function validatePdfBuffer(buffer: Buffer | Uint8Array): Promise<ValidatedPdfMeta> {
  const doc = await PDFDocument.load(buffer);
  const pageCount = doc.getPageCount();
  const pageSizes = doc.getPages().map((p) => {
    const size = p.getSize();
    return { width: Math.round(size.width), height: Math.round(size.height) };
  });

  return {
    pageCount,
    pageSizes,
  };
}
