import { PDFDocument, PDFPage } from 'pdf-lib';
import { ImageStamp } from '@inq/types';

function decodeBase64(dataUrl: string): Uint8Array {
  const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
  if (typeof Buffer !== 'undefined') {
    return Uint8Array.from(Buffer.from(base64Data, 'base64'));
  }
  const binary = atob(base64Data);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

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

  const imageBytes = decodeBase64(dataUrl);

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
