import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fixturesDir = path.resolve(__dirname, '../e2e/fixtures');
if (!fs.existsSync(fixturesDir)) {
  fs.mkdirSync(fixturesDir, { recursive: true });
}

/**
 * 1. Multi-Page Corporate Agreement (3 Pages)
 */
async function generateMultipageContract() {
  const doc = await PDFDocument.create();
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);

  const primaryBlue = rgb(66 / 255, 133 / 255, 244 / 255);
  const textDark = rgb(31 / 255, 31 / 255, 31 / 255);
  const textMuted = rgb(116 / 255, 119 / 255, 117 / 255);
  const lineSubtle = rgb(224 / 255, 226 / 255, 230 / 255);

  // --- PAGE 1 ---
  const page1 = doc.addPage([612, 792]);
  page1.drawRectangle({ x: 48, y: 720, width: 20, height: 20, color: primaryBlue });
  page1.drawText('Acme Global Services', { x: 76, y: 724, size: 16, font: fontBold, color: primaryBlue });
  page1.drawText('MASTER SERVICES AGREEMENT', { x: 48, y: 670, size: 20, font: fontBold, color: textDark });
  page1.drawText('Contract Reference: MSA-2026-9941', { x: 48, y: 645, size: 10, font: fontRegular, color: textMuted });
  page1.drawText('Effective Date: October 1, 2026', { x: 380, y: 645, size: 10, font: fontBold, color: textDark });

  page1.drawLine({ start: { x: 48, y: 630 }, end: { x: 564, y: 630 }, thickness: 1, color: lineSubtle });

  page1.drawText('1. PARTIES & RECITALS', { x: 48, y: 600, size: 12, font: fontBold, color: primaryBlue });
  page1.drawText('This Master Services Agreement ("Agreement") is made between Acme Global Services ("Provider")', { x: 48, y: 575, size: 10, font: fontRegular, color: textDark });
  page1.drawText('and TechCorp Enterprises Inc. ("Client"), collectively referred to as the "Parties".', { x: 48, y: 558, size: 10, font: fontRegular, color: textDark });

  page1.drawText('2. SCOPE OF SERVICES', { x: 48, y: 520, size: 12, font: fontBold, color: primaryBlue });
  page1.drawText('Provider agrees to deliver enterprise vector PDF rendering, document transformation pipelines,', { x: 48, y: 495, size: 10, font: fontRegular, color: textDark });
  page1.drawText('and automated verification tools pursuant to active Statements of Work issued under this Agreement.', { x: 48, y: 478, size: 10, font: fontRegular, color: textDark });

  page1.drawText('Page 1 of 3', { x: 280, y: 36, size: 9, font: fontRegular, color: textMuted });

  // --- PAGE 2 ---
  const page2 = doc.addPage([612, 792]);
  page2.drawText('Acme Global Services — MSA-2026-9941', { x: 48, y: 735, size: 9, font: fontRegular, color: textMuted });
  page2.drawLine({ start: { x: 48, y: 725 }, end: { x: 564, y: 725 }, thickness: 0.75, color: lineSubtle });

  page2.drawText('3. COMPENSATION & INVOICING TERMS', { x: 48, y: 690, size: 12, font: fontBold, color: primaryBlue });
  page2.drawText('Client agrees to pay Provider according to the schedule set forth below:', { x: 48, y: 665, size: 10, font: fontRegular, color: textDark });

  page2.drawRectangle({ x: 48, y: 580, width: 516, height: 70, color: rgb(248 / 255, 249 / 255, 250 / 255), borderColor: lineSubtle, borderWidth: 1 });
  page2.drawText('Rate Item', { x: 64, y: 630, size: 10, font: fontBold, color: textDark });
  page2.drawText('Billing Rate', { x: 260, y: 630, size: 10, font: fontBold, color: textDark });
  page2.drawText('Frequency', { x: 430, y: 630, size: 10, font: fontBold, color: textDark });

  page2.drawText('Senior Principal Architect', { x: 64, y: 608, size: 10, font: fontRegular, color: textDark });
  page2.drawText('$225.00 / hr', { x: 260, y: 608, size: 10, font: fontBold, color: textDark });
  page2.drawText('Monthly Arrears', { x: 430, y: 608, size: 10, font: fontRegular, color: textMuted });

  page2.drawText('Staff Verification Engineer', { x: 64, y: 590, size: 10, font: fontRegular, color: textDark });
  page2.drawText('$185.00 / hr', { x: 260, y: 590, size: 10, font: fontBold, color: textDark });
  page2.drawText('Monthly Arrears', { x: 430, y: 590, size: 10, font: fontRegular, color: textMuted });

  page2.drawText('4. CONFIDENTIALITY & DATA PROTECTION', { x: 48, y: 530, size: 12, font: fontBold, color: primaryBlue });
  page2.drawText('All documents, proprietary trade secrets, vector data streams, and customer billing records', { x: 48, y: 505, size: 10, font: fontRegular, color: textDark });
  page2.drawText('shall remain strictly confidential and subject to complete client-side air-gapped isolation.', { x: 48, y: 488, size: 10, font: fontRegular, color: textDark });

  page2.drawText('Page 2 of 3', { x: 280, y: 36, size: 9, font: fontRegular, color: textMuted });

  // --- PAGE 3 ---
  const page3 = doc.addPage([612, 792]);
  page3.drawText('Acme Global Services — MSA-2026-9941', { x: 48, y: 735, size: 9, font: fontRegular, color: textMuted });
  page3.drawLine({ start: { x: 48, y: 725 }, end: { x: 564, y: 725 }, thickness: 0.75, color: lineSubtle });

  page3.drawText('5. SIGNATURE & EXECUTION', { x: 48, y: 690, size: 12, font: fontBold, color: primaryBlue });
  page3.drawText('IN WITNESS WHEREOF, the Parties have executed this Master Services Agreement as of the Effective Date.', { x: 48, y: 665, size: 10, font: fontRegular, color: textDark });

  // Signature Block Provider
  page3.drawText('PROVIDER: Acme Global Services', { x: 48, y: 590, size: 11, font: fontBold, color: textDark });
  page3.drawLine({ start: { x: 48, y: 530 }, end: { x: 260, y: 530 }, thickness: 1, color: textDark });
  page3.drawText('Authorized Signature: Eleanor Vance', { x: 48, y: 512, size: 9, font: fontRegular, color: textMuted });
  page3.drawText('Title: Chief Executive Officer', { x: 48, y: 496, size: 9, font: fontRegular, color: textMuted });

  // Signature Block Client
  page3.drawText('CLIENT: TechCorp Enterprises Inc.', { x: 320, y: 590, size: 11, font: fontBold, color: textDark });
  page3.drawLine({ start: { x: 320, y: 530 }, end: { x: 532, y: 530 }, thickness: 1, color: textDark });
  page3.drawText('Authorized Signature: Marcus Thorne', { x: 320, y: 512, size: 9, font: fontRegular, color: textMuted });
  page3.drawText('Title: VP Engineering', { x: 320, y: 496, size: 9, font: fontRegular, color: textMuted });

  page3.drawText('Page 3 of 3', { x: 280, y: 36, size: 9, font: fontRegular, color: textMuted });

  const pdfBytes = await doc.save();
  fs.writeFileSync(path.join(fixturesDir, 'multipage-contract.pdf'), pdfBytes);
  console.log('✔ multipage-contract.pdf (3 pages)');
}

/**
 * 2. Landscape Financial Ledger (792 x 612)
 */
async function generateLandscapeStatement() {
  const doc = await PDFDocument.create();
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);

  const primaryEmerald = rgb(52 / 255, 168 / 255, 83 / 255);
  const textDark = rgb(31 / 255, 31 / 255, 31 / 255);
  const textMuted = rgb(116 / 255, 119 / 255, 117 / 255);
  const lineSubtle = rgb(224 / 255, 226 / 255, 230 / 255);

  const page = doc.addPage([792, 612]); // Landscape Letter

  // Header
  page.drawRectangle({ x: 48, y: 540, width: 24, height: 24, color: primaryEmerald });
  page.drawText('GLOBAL LOGISTICS CAPITAL', { x: 80, y: 546, size: 18, font: fontBold, color: primaryEmerald });
  page.drawText('EXECUTIVE FINANCIAL LEDGER — Q3 2026', { x: 48, y: 505, size: 14, font: fontBold, color: textDark });
  page.drawText('Reporting Period: July 1 - September 30, 2026 | Currency: USD ($)', { x: 48, y: 488, size: 10, font: fontRegular, color: textMuted });

  page.drawLine({ start: { x: 48, y: 475 }, end: { x: 744, y: 475 }, thickness: 1, color: lineSubtle });

  // Table Header
  const startY = 440;
  page.drawRectangle({ x: 48, y: startY, width: 696, height: 26, color: rgb(241 / 255, 243 / 255, 244 / 255) });
  page.drawText('Division Name', { x: 60, y: startY + 8, size: 10, font: fontBold, color: textDark });
  page.drawText('Cost Center', { x: 230, y: startY + 8, size: 10, font: fontBold, color: textDark });
  page.drawText('Q3 Allocated', { x: 360, y: startY + 8, size: 10, font: fontBold, color: textDark });
  page.drawText('Q3 Expensed', { x: 490, y: startY + 8, size: 10, font: fontBold, color: textDark });
  page.drawText('Variance', { x: 620, y: startY + 8, size: 10, font: fontBold, color: textDark });

  const rows = [
    { division: 'Cloud Infrastructure & Compute', code: 'CC-901', alloc: '$148,500.00', exp: '$142,320.00', var: '+ $6,180.00' },
    { division: 'Security Operations & Compliance', code: 'CC-405', alloc: '$85,000.00', exp: '$84,150.00', var: '+ $850.00' },
    { division: 'Frontend Engineering & Design System', code: 'CC-220', alloc: '$96,000.00', exp: '$95,800.00', var: '+ $200.00' },
    { division: 'Automated QA & Reliability Testing', code: 'CC-310', alloc: '$54,000.00', exp: '$51,400.00', var: '+ $2,600.00' },
  ];

  let currentY = startY - 24;
  for (const r of rows) {
    page.drawText(r.division, { x: 60, y: currentY + 5, size: 10, font: fontRegular, color: textDark });
    page.drawText(r.code, { x: 230, y: currentY + 5, size: 10, font: fontRegular, color: textMuted });
    page.drawText(r.alloc, { x: 360, y: currentY + 5, size: 10, font: fontRegular, color: textDark });
    page.drawText(r.exp, { x: 490, y: currentY + 5, size: 10, font: fontRegular, color: textDark });
    page.drawText(r.var, { x: 620, y: currentY + 5, size: 10, font: fontBold, color: primaryEmerald });

    page.drawLine({ start: { x: 48, y: currentY }, end: { x: 744, y: currentY }, thickness: 0.5, color: lineSubtle });
    currentY -= 26;
  }

  // Summary Total Row
  page.drawText('TOTAL CONSOLIDATED EXPENDITURE:', { x: 180, y: currentY - 10, size: 11, font: fontBold, color: textDark });
  page.drawText('$383,500.00', { x: 360, y: currentY - 10, size: 11, font: fontBold, color: textDark });
  page.drawText('$373,670.00', { x: 490, y: currentY - 10, size: 11, font: fontBold, color: textDark });
  page.drawText('+ $9,830.00', { x: 620, y: currentY - 10, size: 11, font: fontBold, color: primaryEmerald });

  const pdfBytes = await doc.save();
  fs.writeFileSync(path.join(fixturesDir, 'landscape-statement.pdf'), pdfBytes);
  console.log('✔ landscape-statement.pdf (landscape 792x612)');
}

/**
 * 3. Dense Medical Bill with tiny text, fine print, and right-aligned amounts
 */
async function generateDenseMedicalBill() {
  const doc = await PDFDocument.create();
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);

  const primaryCoral = rgb(234 / 255, 67 / 255, 53 / 255);
  const textDark = rgb(31 / 255, 31 / 255, 31 / 255);
  const textMuted = rgb(116 / 255, 119 / 255, 117 / 255);
  const lineSubtle = rgb(224 / 255, 226 / 255, 230 / 255);

  const page = doc.addPage([612, 792]);

  // Header
  page.drawRectangle({ x: 48, y: 720, width: 24, height: 24, color: primaryCoral });
  page.drawText('METROPOLITAN HEALTHCARE SYSTEM', { x: 80, y: 726, size: 15, font: fontBold, color: primaryCoral });
  page.drawText('ITEMIZED PATIENT BILLING STATEMENT', { x: 48, y: 680, size: 14, font: fontBold, color: textDark });

  // Patient Info Block
  page.drawText('Patient Name: Alexander Wright', { x: 48, y: 650, size: 9, font: fontBold, color: textDark });
  page.drawText('Account #: MED-88410-B', { x: 48, y: 636, size: 9, font: fontRegular, color: textMuted });
  page.drawText('Service Date: 09/04/2026', { x: 48, y: 622, size: 9, font: fontRegular, color: textMuted });

  page.drawText('Statement Date: 09/11/2026', { x: 380, y: 650, size: 9, font: fontRegular, color: textMuted });
  page.drawText('Due Date: 10/05/2026', { x: 380, y: 636, size: 9, font: fontBold, color: primaryCoral });
  page.drawText('Payment Status: PENDING INSURANCE', { x: 380, y: 622, size: 9, font: fontBold, color: textDark });

  page.drawLine({ start: { x: 48, y: 610 }, end: { x: 564, y: 610 }, thickness: 1, color: lineSubtle });

  // Itemized Services
  const startY = 580;
  page.drawRectangle({ x: 48, y: startY, width: 516, height: 20, color: rgb(248 / 255, 249 / 255, 250 / 255) });
  page.drawText('Code', { x: 56, y: startY + 6, size: 8, font: fontBold, color: textDark });
  page.drawText('Clinical Description', { x: 120, y: startY + 6, size: 8, font: fontBold, color: textDark });
  page.drawText('Charge', { x: 350, y: startY + 6, size: 8, font: fontBold, color: textDark });
  page.drawText('Ins. Adj.', { x: 420, y: startY + 6, size: 8, font: fontBold, color: textDark });
  page.drawText('Patient Due', { x: 490, y: startY + 6, size: 8, font: fontBold, color: textDark });

  const lineItems = [
    { code: '99214', desc: 'Outpatient Comprehensive Consultation', charge: '$345.00', adj: '-$210.00', due: '$135.00' },
    { code: '80053', desc: 'Comprehensive Metabolic Serum Panel', charge: '$180.00', adj: '-$125.00', due: '$55.00' },
    { code: '71046', desc: 'Chest Radiologic Examination (2 Views)', charge: '$290.00', adj: '-$195.00', due: '$95.00' },
    { code: '36415', desc: 'Routine Venipuncture Capillary Specimen', charge: '$45.00', adj: '-$30.00', due: '$15.00' },
    { code: '96372', desc: 'Therapeutic Subcutaneous Injection', charge: '$85.00', adj: '-$55.00', due: '$30.00' },
  ];

  let curY = startY - 20;
  for (const item of lineItems) {
    page.drawText(item.code, { x: 56, y: curY + 4, size: 8, font: fontRegular, color: textMuted });
    page.drawText(item.desc, { x: 120, y: curY + 4, size: 8, font: fontRegular, color: textDark });
    page.drawText(item.charge, { x: 350, y: curY + 4, size: 8, font: fontRegular, color: textDark });
    page.drawText(item.adj, { x: 420, y: curY + 4, size: 8, font: fontRegular, color: primaryCoral });
    page.drawText(item.due, { x: 490, y: curY + 4, size: 8, font: fontBold, color: textDark });

    page.drawLine({ start: { x: 48, y: curY }, end: { x: 564, y: curY }, thickness: 0.5, color: lineSubtle });
    curY -= 20;
  }

  // Summary box
  page.drawRectangle({ x: 340, y: curY - 50, width: 224, height: 40, color: rgb(254 / 255, 247 / 255, 247 / 255), borderColor: primaryCoral, borderWidth: 1 });
  page.drawText('Total Amount Due:', { x: 350, y: curY - 30, size: 10, font: fontBold, color: textDark });
  page.drawText('$330.00', { x: 490, y: curY - 30, size: 12, font: fontBold, color: primaryCoral });

  // Fine print disclaimer
  page.drawText('IMPORTANT LEGAL NOTICE: This statement is an itemized estimation of healthcare services rendered.', { x: 48, y: 80, size: 7, font: fontRegular, color: textMuted });
  page.drawText('Under the No Surprises Act (45 CFR § 149), you have the right to receive a Good Faith Estimate upon request.', { x: 48, y: 68, size: 7, font: fontRegular, color: textMuted });
  page.drawText('For billing disputes or financial hardship assistance, contact Patient Accounts at (800) 555-0199.', { x: 48, y: 56, size: 7, font: fontRegular, color: textMuted });

  const pdfBytes = await doc.save();
  fs.writeFileSync(path.join(fixturesDir, 'dense-medical-bill.pdf'), pdfBytes);
  console.log('✔ dense-medical-bill.pdf (dense invoice)');
}

/**
 * 4. Sample Signature PNG
 */
function generateSignaturePng() {
  const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAEAAAAAgCAYAAACinX6EAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAKUlEQVR42u3BAQEAMAyAMPePboY2gG7VBgAAAAAAAAAAAAAAAAAAgJsBs2QAAYKq2bEAAAAASUVORK5CYII=';
  const buffer = Buffer.from(base64Png, 'base64');
  fs.writeFileSync(path.join(fixturesDir, 'sample-signature.png'), buffer);
  console.log('✔ sample-signature.png (stamp image)');
}

async function main() {
  console.log('Generating custom PDF and image fixtures...');
  await generateMultipageContract();
  await generateLandscapeStatement();
  await generateDenseMedicalBill();
  generateSignaturePng();
  console.log('✅ All test fixtures successfully generated in e2e/fixtures/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
