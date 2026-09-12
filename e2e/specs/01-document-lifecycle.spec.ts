import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EditorPage } from '../helpers/editor-page';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.resolve(__dirname, '../fixtures');

test.describe('Document Lifecycle & Custom PDF Fixtures', () => {
  let editor: EditorPage;

  test.beforeEach(async ({ page }) => {
    editor = new EditorPage(page);
    await editor.goto();
  });

  test('loads initial default SaaS Invoice template successfully', async () => {
    await expect(editor.titleInput).toHaveValue('Cloud Tech SaaS Invoice');
    await expect(editor.canvas).toBeVisible();
    await expect(editor.textItems.first()).toBeVisible();

    // Verify key text elements from SaaS invoice are present
    const invoiceText = editor.locateText('INVOICE');
    await expect(invoiceText).toBeVisible();

    const platformText = editor.locateText('Cloud Platform');
    await expect(platformText).toBeVisible();
  });

  test('switches between built-in sample templates seamlessly', async () => {
    // 1. Switch to Electric Utility Bill
    await editor.selectSampleTemplate('electric-utility');
    await expect(editor.titleInput).toHaveValue('City Electric Utility Bill');
    const utilityText = editor.locateText('ELECTRIC');
    await expect(utilityText).toBeVisible();

    // 2. Switch to Artisan Cafe & Bistro Receipt
    await editor.selectSampleTemplate('retail-receipt');
    await expect(editor.titleInput).toHaveValue('Artisan Cafe & Bistro Receipt');
    const receiptText = editor.locateText('COFFEE');
    await expect(receiptText).toBeVisible();
  });

  test('uploads custom multi-page contract and navigates pages via PageRail', async () => {
    const contractPath = path.join(fixturesDir, 'multipage-contract.pdf');
    await editor.uploadCustomPdf(contractPath);

    // Title should be updated to file basename
    await expect(editor.titleInput).toHaveValue('multipage-contract');

    // Should detect 3 pages and render 3 thumbnails in PageRail
    await expect(editor.pageThumbnails).toHaveCount(3);

    // Verify Page 1 text
    const page1Header = editor.locateText('MASTER SERVICES AGREEMENT');
    await expect(page1Header).toBeVisible();

    // Click on Page 2 thumbnail
    await editor.pageThumbnails.nth(1).click();
    await editor.page.waitForTimeout(600);
    const page2Text = editor.locateText('COMPENSATION & INVOICING TERMS');
    await expect(page2Text).toBeVisible();

    // Click on Page 3 thumbnail
    await editor.pageThumbnails.nth(2).click();
    await editor.page.waitForTimeout(600);
    const page3Text = editor.locateText('SIGNATURE & EXECUTION');
    await expect(page3Text).toBeVisible();
  });

  test('uploads custom dense medical bill with tiny fonts & currency figures', async () => {
    const medicalPath = path.join(fixturesDir, 'dense-medical-bill.pdf');
    await editor.uploadCustomPdf(medicalPath);

    await expect(editor.titleInput).toHaveValue('dense-medical-bill');
    const medicalHeader = editor.locateText('METROPOLITAN HEALTHCARE');
    await expect(medicalHeader).toBeVisible();

    // Verify small clinical code items are detected as clickable text spans
    const cptCode = editor.locateText('99214');
    await expect(cptCode).toBeVisible();

    const dueAmount = editor.locateText('$330.00');
    await expect(dueAmount).toBeVisible();
  });

  test('uploads custom landscape financial ledger statement', async () => {
    const landscapePath = path.join(fixturesDir, 'landscape-statement.pdf');
    await editor.uploadCustomPdf(landscapePath);

    await expect(editor.titleInput).toHaveValue('landscape-statement');
    const ledgerHeader = editor.locateText('EXECUTIVE FINANCIAL LEDGER');
    await expect(ledgerHeader).toBeVisible();

    // Verify landscape aspect ratio by checking canvas width vs height
    const canvasBox = await editor.canvas.boundingBox();
    expect(canvasBox).not.toBeNull();
    if (canvasBox) {
      expect(canvasBox.width).toBeGreaterThan(canvasBox.height);
    }
  });

  test('renames document title in top navbar and persists value', async () => {
    const customTitle = 'Custom Q3 Enterprise Audit Statement';
    await editor.setDocumentTitle(customTitle);
    await expect(editor.titleInput).toHaveValue(customTitle);
  });
});
