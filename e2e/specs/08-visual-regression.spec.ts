import { test, expect } from '@playwright/test';
import { EditorPage } from '../helpers/editor-page';

test.describe('Visual Regression Snapshot Testing', () => {
  let editor: EditorPage;

  test.beforeEach(async ({ page }) => {
    editor = new EditorPage(page);
    await editor.goto();
  });

  test('visual baseline: Inq Web Editor - Light Mode', async ({ page }) => {
    await page.waitForTimeout(600);
    await expect(page).toHaveScreenshot('web-editor-light-mode.png', {
      fullPage: false,
    });
  });

  test('visual baseline: Inq Web Editor - Dark Mode', async ({ page }) => {
    await editor.goto('dark');
    await page.waitForTimeout(600);
    await expect(page).toHaveScreenshot('web-editor-dark-mode.png', {
      fullPage: false,
    });
  });

  test('visual baseline: Canvas with Active Vector Modifications', async ({ page }) => {
    // 1. Draw a whiteout block
    await editor.drawWhiteout(50, 50, 160, 100);

    // 2. Place a PAID preset stamp
    await editor.placePresetStamp('PAID');

    // 3. Edit invoice number
    await editor.selectTool('text');
    const invoiceBlock = editor.locateText('INV-2026-0891');
    await invoiceBlock.click();
    const input = invoiceBlock.locator('input.inline-edit-input');
    await input.fill('INV-VISUAL-VERIFIED');
    await editor.canvasViewport.click({ position: { x: 20, y: 20 } });
    await page.waitForTimeout(500);

    // Capture the canvas container viewport
    await expect(editor.canvasViewport).toHaveScreenshot('canvas-viewport-with-modifications.png');
  });

  test('visual baseline: Shortcuts Modal dialog', async ({ page }) => {
    const shortcutsBtn = page.locator('.status-shortcut-btn, .brand-wrapper').first();
    await shortcutsBtn.click();

    const dialog = page.locator('[role="dialog"], .inq-modal-dialog');
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(400);

    await expect(dialog).toHaveScreenshot('shortcuts-modal-dialog.png');
  });

  test('visual baseline: Living Design System Workbench', async ({ page }) => {
    await page.goto('http://localhost:3001/design-system/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(600);

    await expect(page).toHaveScreenshot('design-system-workbench.png', {
      fullPage: false,
    });
  });
});
