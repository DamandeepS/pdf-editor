import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { SampleBillMeta } from '@inq/types';

export const SAMPLE_BILLS_META: SampleBillMeta[] = [
  {
    id: 'saas-invoice',
    title: 'Cloud Tech SaaS Invoice',
    category: 'invoice',
    description: 'Itemized cloud computing & AI infrastructure statement with tax calculation and invoice table.',
    filename: 'cloud-tech-invoice.pdf',
    badgeColor: '#4285f4',
  },
  {
    id: 'electric-utility',
    title: 'City Electric Utility Bill',
    category: 'utility',
    description: 'Municipal power statement with meter readings, energy breakdown, and payment stub barcode.',
    filename: 'electric-utility-bill.pdf',
    badgeColor: '#34a853',
  },
  {
    id: 'retail-receipt',
    title: 'Artisan Cafe & Bistro Receipt',
    category: 'receipt',
    description: 'Thermal-style dining receipt with timestamp, itemized order, tip breakdown, and payment card auth.',
    filename: 'cafe-bistro-receipt.pdf',
    badgeColor: '#fbbc05',
  },
];

/**
 * Generates the Cloud Tech SaaS Invoice PDF
 */
export async function generateSaasInvoicePdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]); // Letter size
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);

  const primaryBlue = rgb(66 / 255, 133 / 255, 244 / 255);
  const textDark = rgb(31 / 255, 31 / 255, 31 / 255);
  const textMuted = rgb(116 / 255, 119 / 255, 117 / 255);
  const lineSubtle = rgb(224 / 255, 226 / 255, 230 / 255);

  // Brand Header
  page.drawRectangle({
    x: 48,
    y: 710,
    width: 24,
    height: 24,
    color: primaryBlue,
  });
  page.drawText('Inq Cloud Platform', { x: 80, y: 715, size: 20, font: fontBold, color: primaryBlue });
  page.drawText('INVOICE', { x: 470, y: 715, size: 20, font: fontBold, color: textDark });

  // Invoice Details
  page.drawText('Invoice Number: INV-2026-0891', { x: 420, y: 690, size: 10, font: fontRegular, color: textMuted });
  page.drawText('Issue Date: September 10, 2026', { x: 420, y: 676, size: 10, font: fontRegular, color: textMuted });
  page.drawText('Due Date: September 24, 2026', { x: 420, y: 662, size: 10, font: fontBold, color: textDark });

  // Bill To
  page.drawText('BILLED TO:', { x: 48, y: 660, size: 10, font: fontBold, color: textMuted });
  page.drawText('Acme Corporation, Inc.', { x: 48, y: 644, size: 12, font: fontBold, color: textDark });
  page.drawText('100 Innovation Way, Suite 400', { x: 48, y: 630, size: 10, font: fontRegular, color: textMuted });
  page.drawText('San Francisco, CA 94105', { x: 48, y: 616, size: 10, font: fontRegular, color: textMuted });
  page.drawText('billing@acme.com', { x: 48, y: 602, size: 10, font: fontRegular, color: primaryBlue });

  // Table Header
  const tableTop = 550;
  page.drawRectangle({ x: 48, y: tableTop, width: 516, height: 26, color: rgb(248 / 255, 250 / 255, 253 / 255) });
  page.drawText('DESCRIPTION', { x: 60, y: tableTop + 8, size: 10, font: fontBold, color: textDark });
  page.drawText('QTY', { x: 340, y: tableTop + 8, size: 10, font: fontBold, color: textDark });
  page.drawText('UNIT PRICE', { x: 400, y: tableTop + 8, size: 10, font: fontBold, color: textDark });
  page.drawText('AMOUNT', { x: 490, y: tableTop + 8, size: 10, font: fontBold, color: textDark });

  // Table Rows
  const items = [
    { desc: 'Cloud Compute Clusters (4x 64GB Node)', qty: '1 mo', price: '$640.00', amount: '$640.00' },
    { desc: 'Vector Database Storage (1.2 TB High-IOPS)', qty: '1.2 TB', price: '$150.00', amount: '$180.00' },
    { desc: 'Enterprise AI API Units (2,500,000 Tokens)', qty: '2.5M', price: '$168.00', amount: '$420.00' },
    { desc: 'Automated Snapshot & Offsite Backup', qty: '1 mo', price: '$80.00', amount: '$80.00' },
  ];

  let currentY = tableTop - 30;
  for (const item of items) {
    page.drawText(item.desc, { x: 60, y: currentY, size: 10, font: fontRegular, color: textDark });
    page.drawText(item.qty, { x: 340, y: currentY, size: 10, font: fontRegular, color: textMuted });
    page.drawText(item.price, { x: 400, y: currentY, size: 10, font: fontRegular, color: textMuted });
    page.drawText(item.amount, { x: 490, y: currentY, size: 10, font: fontBold, color: textDark });

    // Row divider line
    page.drawLine({
      start: { x: 48, y: currentY - 10 },
      end: { x: 564, y: currentY - 10 },
      thickness: 0.5,
      color: lineSubtle,
    });
    currentY -= 32;
  }

  // Totals Section
  const totalsX = 400;
  page.drawText('Subtotal:', { x: totalsX, y: currentY - 20, size: 10, font: fontRegular, color: textMuted });
  page.drawText('$1,320.00', { x: 490, y: currentY - 20, size: 10, font: fontRegular, color: textDark });

  page.drawText('VAT (10%):', { x: totalsX, y: currentY - 40, size: 10, font: fontRegular, color: textMuted });
  page.drawText('$132.00', { x: 490, y: currentY - 40, size: 10, font: fontRegular, color: textDark });

  // Total Due Highlight Box
  page.drawRectangle({
    x: totalsX - 10,
    y: currentY - 78,
    width: 174,
    height: 32,
    color: rgb(232 / 255, 240 / 255, 254 / 255),
  });
  page.drawText('Total Due:', { x: totalsX, y: currentY - 67, size: 12, font: fontBold, color: primaryBlue });
  page.drawText('$1,452.00', { x: 480, y: currentY - 67, size: 14, font: fontBold, color: primaryBlue });

  // Footer Note
  page.drawText('Thank you for your business. Please remit payment within 14 days of invoice date.', {
    x: 48,
    y: 80,
    size: 9,
    font: fontRegular,
    color: textMuted,
  });

  return await doc.save();
}

/**
 * Generates the City Electric Utility Bill PDF
 */
export async function generateUtilityBillPdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontMono = await doc.embedFont(StandardFonts.Courier);

  const green = rgb(52 / 255, 168 / 255, 83 / 255);
  const textDark = rgb(31 / 255, 31 / 255, 31 / 255);
  const textMuted = rgb(116 / 255, 119 / 255, 117 / 255);
  const lineSubtle = rgb(224 / 255, 226 / 255, 230 / 255);

  // Header Banner
  page.drawRectangle({ x: 0, y: 740, width: 612, height: 52, color: green });
  page.drawText('METRO POWER & LIGHT', { x: 48, y: 758, size: 18, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText('ELECTRIC SERVICE STATEMENT', { x: 380, y: 758, size: 11, font: fontBold, color: rgb(1, 1, 1) });

  // Account Box
  page.drawRectangle({ x: 48, y: 640, width: 516, height: 75, color: rgb(248 / 255, 250 / 255, 253 / 255) });
  page.drawText('Account Number: 9421-8802-14', { x: 64, y: 690, size: 12, font: fontBold, color: textDark });
  page.drawText('Service Address: 742 Evergreen Terrace, Springfield', { x: 64, y: 672, size: 10, font: fontRegular, color: textMuted });
  page.drawText('Billing Period: Aug 01, 2026 - Aug 31, 2026', { x: 64, y: 654, size: 10, font: fontRegular, color: textMuted });

  page.drawText('Due Date: Oct 05, 2026', { x: 380, y: 690, size: 11, font: fontBold, color: rgb(234 / 255, 67 / 255, 53 / 255) });
  page.drawText('Amount Due: $231.00', { x: 380, y: 668, size: 14, font: fontBold, color: textDark });

  // Meter Reading Table
  page.drawText('METER USAGE SUMMARY', { x: 48, y: 590, size: 12, font: fontBold, color: textDark });
  page.drawRectangle({ x: 48, y: 540, width: 516, height: 35, color: lineSubtle });
  page.drawText('Previous Reading', { x: 64, y: 552, size: 10, font: fontBold, color: textDark });
  page.drawText('Current Reading', { x: 200, y: 552, size: 10, font: fontBold, color: textDark });
  page.drawText('Multiplier', { x: 340, y: 552, size: 10, font: fontBold, color: textDark });
  page.drawText('Total kWh Used', { x: 450, y: 552, size: 10, font: fontBold, color: textDark });

  page.drawText('42,100 kWh', { x: 64, y: 518, size: 10, font: fontRegular, color: textDark });
  page.drawText('43,450 kWh', { x: 200, y: 518, size: 10, font: fontRegular, color: textDark });
  page.drawText('1.0', { x: 340, y: 518, size: 10, font: fontRegular, color: textDark });
  page.drawText('1,350 kWh', { x: 450, y: 518, size: 11, font: fontBold, color: green });

  // Breakdown of Charges
  page.drawText('CHARGES BREAKDOWN', { x: 48, y: 460, size: 12, font: fontBold, color: textDark });
  const charges = [
    { name: 'Standard Customer Service Charge', amount: '$24.50' },
    { name: 'Energy Consumption (1,350 kWh @ $0.115/kWh)', amount: '$155.25' },
    { name: 'Distribution & Grid Reliability Fee', amount: '$42.80' },
    { name: 'Clean Energy & Environmental Surcharge', amount: '$8.45' },
  ];

  let y = 430;
  for (const c of charges) {
    page.drawText(c.name, { x: 48, y, size: 10, font: fontRegular, color: textDark });
    page.drawText(c.amount, { x: 490, y, size: 10, font: fontRegular, color: textDark });
    page.drawLine({ start: { x: 48, y: y - 8 }, end: { x: 564, y: y - 8 }, thickness: 0.5, color: lineSubtle });
    y -= 28;
  }

  // Total
  page.drawText('TOTAL CURRENT CHARGES:', { x: 300, y: y - 10, size: 11, font: fontBold, color: textDark });
  page.drawText('$231.00', { x: 480, y: y - 10, size: 14, font: fontBold, color: green });

  // Barcode stub at bottom
  page.drawText('*94218802140023100*', { x: 200, y: 80, size: 14, font: fontMono, color: textDark });
  page.drawRectangle({ x: 180, y: 100, width: 250, height: 30, color: rgb(0, 0, 0) });

  return await doc.save();
}

/**
 * Generates the Coffee & Bistro Retail Receipt PDF
 */
export async function generateRetailReceiptPdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  // Compact receipt format: 288 pt wide x 504 pt tall (4x7 inches)
  const page = doc.addPage([288, 504]);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontMono = await doc.embedFont(StandardFonts.Courier);

  const textDark = rgb(20 / 255, 20 / 255, 20 / 255);
  const textMuted = rgb(100 / 255, 100 / 255, 100 / 255);
  const line = rgb(200 / 255, 200 / 255, 200 / 255);

  // Receipt Header
  page.drawText('ARTISAN COFFEE & ROASTERY', { x: 40, y: 465, size: 13, font: fontBold, color: textDark });
  page.drawText('Downtown Plaza - Store #42', { x: 70, y: 450, size: 9, font: fontRegular, color: textMuted });
  page.drawText('Tel: (555) 234-8900', { x: 100, y: 437, size: 8, font: fontRegular, color: textMuted });

  page.drawLine({ start: { x: 20, y: 425 }, end: { x: 268, y: 425 }, thickness: 1, color: line });

  page.drawText('Order #184', { x: 20, y: 405, size: 10, font: fontBold, color: textDark });
  page.drawText('Table: 7', { x: 130, y: 405, size: 10, font: fontRegular, color: textMuted });
  page.drawText('2026-09-10 09:42 AM', { x: 175, y: 405, size: 8, font: fontRegular, color: textMuted });

  page.drawLine({ start: { x: 20, y: 395 }, end: { x: 268, y: 395 }, thickness: 1, color: line });

  // Order Items
  const items = [
    { qty: '2', name: 'Espresso Macchiato', price: '$7.50' },
    { qty: '1', name: 'Almond Croissant', price: '$4.50' },
    { qty: '1', name: 'Nitro Cold Brew (Large)', price: '$5.75' },
    { qty: '1', name: 'Avocado Sourdough Toast', price: '$11.00' },
  ];

  let y = 370;
  for (const item of items) {
    page.drawText(`${item.qty}x`, { x: 20, y, size: 9, font: fontBold, color: textDark });
    page.drawText(item.name, { x: 45, y, size: 9, font: fontRegular, color: textDark });
    page.drawText(item.price, { x: 225, y, size: 9, font: fontBold, color: textDark });
    y -= 22;
  }

  page.drawLine({ start: { x: 20, y: y }, end: { x: 268, y: y }, thickness: 1, color: line });

  // Subtotals
  y -= 20;
  page.drawText('Subtotal:', { x: 120, y, size: 9, font: fontRegular, color: textMuted });
  page.drawText('$28.75', { x: 225, y, size: 9, font: fontRegular, color: textDark });

  y -= 16;
  page.drawText('Sales Tax (8%):', { x: 120, y, size: 9, font: fontRegular, color: textMuted });
  page.drawText('$2.30', { x: 225, y, size: 9, font: fontRegular, color: textDark });

  y -= 16;
  page.drawText('Tip (18%):', { x: 120, y, size: 9, font: fontRegular, color: textMuted });
  page.drawText('$5.18', { x: 225, y, size: 9, font: fontRegular, color: textDark });

  y -= 20;
  page.drawLine({ start: { x: 100, y: y + 8 }, end: { x: 268, y: y + 8 }, thickness: 1, color: line });
  page.drawText('TOTAL:', { x: 120, y, size: 12, font: fontBold, color: textDark });
  page.drawText('$36.23', { x: 215, y, size: 14, font: fontBold, color: textDark });

  // Card details & Barcode
  y -= 40;
  page.drawText('Payment: VISA **** 4242', { x: 60, y, size: 9, font: fontMono, color: textMuted });
  page.drawText('Auth Code: 891024', { x: 80, y: y - 14, size: 9, font: fontMono, color: textMuted });

  page.drawRectangle({ x: 44, y: y - 60, width: 200, height: 26, color: rgb(0, 0, 0) });
  page.drawText('THANK YOU FOR VISITING!', { x: 65, y: y - 80, size: 9, font: fontBold, color: textDark });

  return await doc.save();
}

/**
 * Returns raw PDF buffer for a requested sample bill ID
 */
export async function getSamplePdfBytes(sampleId: string): Promise<Uint8Array | null> {
  switch (sampleId) {
    case 'saas-invoice':
      return await generateSaasInvoicePdf();
    case 'electric-utility':
      return await generateUtilityBillPdf();
    case 'retail-receipt':
      return await generateRetailReceiptPdf();
    default:
      return null;
  }
}
