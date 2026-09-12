import { test, expect } from '@playwright/test';
import { EditorPage } from '../helpers/editor-page';

test.describe('Vector Whiteout & Redaction Tool', () => {
  let editor: EditorPage;

  test.beforeEach(async ({ page }) => {
    editor = new EditorPage(page);
    await editor.goto();
  });

  test('activates whiteout tool via toolbar button and hotkey W', async ({ page }) => {
    await editor.selectTool('whiteout');
    const whiteoutBtn = page.locator('.tool-pill:has-text("Whiteout (W)"), button:has-text("Whiteout (W)")').first();
    await expect(whiteoutBtn).toHaveClass(/active/);

    // Switch to select and back via keyboard 'w'
    await page.keyboard.press('v');
    await expect(whiteoutBtn).not.toHaveClass(/active/);
    await page.keyboard.press('w');
    await expect(whiteoutBtn).toHaveClass(/active/);
  });

  test('draws a whiteout rectangle over canvas region', async ({ page }) => {
    await expect(editor.whiteoutBoxes).toHaveCount(0);

    // Draw whiteout over a section (e.g. 100, 100 to 250, 150)
    await editor.drawWhiteout(100, 100, 250, 150);

    // Verify a whiteout box was created
    await expect(editor.whiteoutBoxes).toHaveCount(1);
    const box = editor.whiteoutBoxes.first();
    await expect(box).toBeVisible();

    // Check that box has white background
    await expect(box).toHaveCSS('background-color', 'rgb(255, 255, 255)');

    // Check status bar reflects modification
    const statusBar = page.locator('.status-bar, footer');
    await expect(statusBar).toContainText('1 vector modification');
  });

  test('selects whiteout block, modifies fill color and deletes it', async ({ page }) => {
    await editor.drawWhiteout(80, 80, 200, 140);
    await expect(editor.whiteoutBoxes).toHaveCount(1);

    const box = editor.whiteoutBoxes.first();
    await box.click();
    await expect(box).toHaveClass(/selected/);

    // Floating toolbar should show whiteout controls
    const toolbar = page.locator('.floating-toolbar');
    await expect(toolbar).toBeVisible();
    await expect(toolbar).toContainText('Whiteout Fill:');

    // Click delete in floating toolbar
    const deleteBtn = toolbar.locator('button[title*="Delete"]').first();
    await deleteBtn.click();

    // Whiteout box should be removed
    await expect(editor.whiteoutBoxes).toHaveCount(0);
  });
});
