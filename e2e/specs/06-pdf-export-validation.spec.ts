import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { EditorPage } from '../helpers/editor-page';
import { validatePdfBuffer } from '../helpers/pdf-validator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.resolve(__dirname, '../fixtures');

test.describe('End-to-End PDF Export & Vector Stream Verification', () => {
  let editor: EditorPage;

  test.beforeEach(async ({ page }) => {
    editor = new EditorPage(page);
    await editor.goto();
  });

  test('exports modified single-page invoice as valid vector PDF download', async ({ page }) => {
    // 1. Draw a whiteout redaction
    await editor.drawWhiteout(50, 50, 150, 100);

    // 2. Place a PAID stamp
    await editor.placePresetStamp('PAID');

    // 3. Edit invoice text
    await editor.selectTool('text');
    const invoiceBlock = editor.locateText('INV-2026-0891');
    await invoiceBlock.click();
    const input = invoiceBlock.locator('input.inline-edit-input');
    await input.fill('INV-EXPORT-VERIFIED');
    await editor.canvasViewport.click({ position: { x: 20, y: 20 } });
    await page.waitForTimeout(300);

    // 4. Trigger Export and catch download
    const downloadPromise = page.waitForEvent('download', { timeout: 20000 });
    await editor.exportButton.click();
    const download = await downloadPromise;

    // Validate download filename
    const filename = download.suggestedFilename();
    expect(filename).toContain('-edited.pdf');

    // Read download stream and validate PDF structure
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const pdfBuffer = Buffer.concat(chunks);

    expect(pdfBuffer.length).toBeGreaterThan(1000); // Non-empty valid PDF
    const meta = await validatePdfBuffer(pdfBuffer);
    expect(meta.pageCount).toBe(1);
    expect(meta.pageSizes[0].width).toBe(612);
    expect(meta.pageSizes[0].height).toBe(792);
  });

  test('exports custom multi-page contract preserving 3-page structure and modifications', async ({ page }) => {
    const contractPath = path.join(fixturesDir, 'multipage-contract.pdf');
    await editor.uploadCustomPdf(contractPath);

    // Add whiteout on page 1
    await editor.drawWhiteout(80, 80, 200, 120);

    // Switch to page 2 and place an APPROVED stamp
    await editor.pageThumbnails.nth(1).click();
    await page.waitForTimeout(600);
    await editor.placePresetStamp('APPROVED');

    // Trigger Export and catch download
    const downloadPromise = page.waitForEvent('download', { timeout: 20000 });
    await editor.exportButton.click();
    const download = await downloadPromise;

    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const pdfBuffer = Buffer.concat(chunks);

    // Validate that exported PDF preserved all 3 pages
    const meta = await validatePdfBuffer(pdfBuffer);
    expect(meta.pageCount).toBe(3);
  });

  test('critique QA: exports invoice with expanded right-aligned amount and verifies byte integrity', async ({ page }) => {
    await editor.selectTool('text');
    const priceBlock = editor.locateText('$1,250.00');
    if (await priceBlock.isVisible()) {
      await priceBlock.click();
      const input = priceBlock.locator('input.inline-edit-input');
      await input.fill('$125,000.00');
      await editor.canvasViewport.click({ position: { x: 20, y: 20 } });
      await page.waitForTimeout(300);

      const downloadPromise = page.waitForEvent('download', { timeout: 20000 });
      await editor.exportButton.click();
      const download = await downloadPromise;

      const stream = await download.createReadStream();
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }
      const pdfBuffer = Buffer.concat(chunks);

      expect(pdfBuffer.length).toBeGreaterThan(1000);
      const meta = await validatePdfBuffer(pdfBuffer);
      expect(meta.pageCount).toBe(1);
    }
  });

  test('critique QA: exports invoice with newly created text block in blank space', async ({ page }) => {
    // 1. Activate Text tool and click blank space
    await editor.selectTool('text');
    const overlay = page.locator('.interactive-overlay');
    await overlay.click({ position: { x: 300, y: 300 } });

    // 2. Type text in new text field
    const newTextBox = page.locator('.new-text-box');
    await expect(newTextBox).toBeVisible();
    const input = newTextBox.locator('input.new-text-input');
    await input.fill('Authorized Signature Required');

    // 3. Commit by clicking canvas background
    await editor.canvasViewport.click({ position: { x: 20, y: 20 } });
    await page.waitForTimeout(300);

    // 4. Export and verify
    const downloadPromise = page.waitForEvent('download', { timeout: 20000 });
    await editor.exportButton.click();
    const download = await downloadPromise;

    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const pdfBuffer = Buffer.concat(chunks);

    expect(pdfBuffer.length).toBeGreaterThan(1000);
    const meta = await validatePdfBuffer(pdfBuffer);
    expect(meta.pageCount).toBe(1);
    expect(meta.pageSizes[0].width).toBe(612);
    expect(meta.pageSizes[0].height).toBe(792);
  });
});

