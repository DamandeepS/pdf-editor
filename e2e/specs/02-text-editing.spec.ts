import { test, expect } from '@playwright/test';
import { EditorPage } from '../helpers/editor-page';

test.describe('In-Place Text Editing & Floating Format Toolbar', () => {
  let editor: EditorPage;

  test.beforeEach(async ({ page }) => {
    editor = new EditorPage(page);
    await editor.goto();
  });

  test('activates text tool and selects text block on canvas', async ({ page }) => {
    await editor.selectTool('text');
    const textToolBtn = page.locator('.tool-pill:has-text("Edit Text (T)"), button:has-text("Edit Text (T)")').first();
    await expect(textToolBtn).toHaveClass(/active/);

    // Click on invoice number block
    const invoiceBlock = editor.locateText('INV-2026-0891');
    await invoiceBlock.click();

    // Text block should now be selected and contain an inline edit input
    await expect(invoiceBlock).toHaveClass(/selected/);
    const inlineInput = invoiceBlock.locator('input.inline-edit-input');
    await expect(inlineInput).toBeVisible();

    // Floating format toolbar should appear
    const toolbar = page.locator('.floating-toolbar');
    await expect(toolbar).toBeVisible();
    await expect(toolbar.locator('.font-select')).toBeVisible();
  });

  test('edits text in-place and marks field as modified', async ({ page }) => {
    await editor.selectTool('text');
    const targetBlock = editor.locateText('INV-2026-0891');
    await targetBlock.click();

    const input = targetBlock.locator('input.inline-edit-input');
    await input.fill('INV-QA-2026-FINAL');

    // Click canvas background to commit edit
    await editor.canvasViewport.click({ position: { x: 20, y: 20 } });
    await page.waitForTimeout(400);

    // The block should now be marked modified
    await expect(targetBlock).toHaveClass(/modified/);

    // StatusBar should reflect edits counter
    const statusBar = page.locator('.status-bar, footer');
    await expect(statusBar).toContainText('1 edit');
  });

  test('modifies typography styling via FloatingFormatToolbar', async ({ page }) => {
    await editor.selectTool('text');
    const targetBlock = editor.locateText('INVOICE');
    await targetBlock.click();

    const toolbar = page.locator('.floating-toolbar');
    await expect(toolbar).toBeVisible();

    // Change font family to Courier
    const fontSelect = toolbar.locator('.font-select');
    await fontSelect.selectOption('Courier');
    await expect(targetBlock).toHaveCSS('font-family', /Courier/i);

    // Toggle Bold
    const boldBtn = toolbar.locator('button[title*="Bold"], button:has(svg)').nth(2);
    if (await boldBtn.isVisible()) {
      await boldBtn.click();
    }

    // Increase Font Size
    const sizeInput = toolbar.locator('.size-number-input');
    await sizeInput.fill('24');
    await sizeInput.press('Enter');

    // Commit edit
    await editor.canvasViewport.click({ position: { x: 20, y: 20 } });
    await expect(targetBlock).toHaveClass(/modified/);
  });

  test('erases / reverts text modifications using toolbar action', async ({ page }) => {
    await editor.selectTool('text');
    const targetBlock = editor.locateText('Cloud Platform');
    await targetBlock.click();

    const input = targetBlock.locator('input.inline-edit-input');
    await input.fill('Temp Value');
    await editor.canvasViewport.click({ position: { x: 20, y: 20 } });
    await expect(targetBlock).toHaveClass(/modified/);

    // Re-select and click Whiteout / Erase in floating toolbar
    await targetBlock.click();
    const toolbar = page.locator('.floating-toolbar');
    const deleteBtn = toolbar.locator('button[title*="Whiteout / Erase Text"], button[title*="Delete"]').first();
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();

    await editor.canvasViewport.click({ position: { x: 20, y: 20 } });
    // An erasing whiteout or empty modification is registered
    const statusBar = page.locator('.status-bar, footer');
    await expect(statusBar).toContainText('edit');
  });
});
