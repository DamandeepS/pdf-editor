import { PDFDocument, PDFPage } from 'pdf-lib';
import { ImageStamp } from '@inq/types';

/**
 * Embeds and draws an image stamp (PNG/JPEG base64 data URL) onto a PDF page.
 */
export async function embedImageStamp(
  doc: PDFDocument,
  page: PDFPage,
  stamp: ImageStamp
): Promise<void> {
  const { bbox, dataUrl, mimeType, opacity = 1 } = stamp;
  if (!dataUrl) return;

  // Extract base64 payload
  const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
  const imageBytes = Uint8Array.from(Buffer.from(base64Data, 'base64'));

  let image;
  if (mimeType === 'image/png' || dataUrl.startsWith('data:image/png')) {
    image = await doc.embedPng(imageBytes);
  } else {
    image = await doc.embedJpg(imageBytes);
  }

  page.drawImage(image, {
    x: bbox.x,
    y: bbox.y,
    width: bbox.width,
    height: bbox.height,
    opacity,
  });
}
