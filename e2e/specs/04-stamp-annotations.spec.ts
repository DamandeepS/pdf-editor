import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EditorPage } from '../helpers/editor-page';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.resolve(__dirname, '../fixtures');

test.describe('Stamp & Signature Overlay Tool', () => {
  let editor: EditorPage;

  test.beforeEach(async ({ page }) => {
    editor = new EditorPage(page);
    await editor.goto();
  });

  test('activates stamp tool and renders preset stamp dock', async ({ page }) => {
    await editor.selectTool('image');
    const stampToolBtn = page.locator('.tool-pill:has-text("Stamp (I)"), button:has-text("Stamp (I)")').first();
    await expect(stampToolBtn).toHaveClass(/active/);

    // Verify stamp dock is visible with preset options
    const dock = page.locator('.stamp-picker-dock');
    await expect(dock).toBeVisible();
    await expect(dock.locator('button:has-text("PAID")')).toBeVisible();
    await expect(dock.locator('button:has-text("VOID")')).toBeVisible();
    await expect(dock.locator('button:has-text("APPROVED")')).toBeVisible();
    await expect(dock.locator('button:has-text("CONFIDENTIAL")')).toBeVisible();
    await expect(dock.locator('button:has-text("Custom Stamp")')).toBeVisible();
  });

  test('places PAID preset stamp on canvas and verifies rendering', async ({ page }) => {
    await expect(editor.stampContainers).toHaveCount(0);

    // Place PAID stamp
    await editor.placePresetStamp('PAID');

    // Verify stamp container created
    await expect(editor.stampContainers).toHaveCount(1);
    const stamp = editor.stampContainers.first();
    await expect(stamp).toBeVisible();

    // Verify stamp has an image with SVG/PNG data URL
    const stampImg = stamp.locator('img');
    await expect(stampImg).toBeVisible();
    const src = await stampImg.getAttribute('src');
    expect(src).toContain('data:image');

    // Status bar should register modification
    const statusBar = page.locator('.status-bar, footer');
    await expect(statusBar).toContainText('1 vector modification');
  });

  test('places and adjusts stamp opacity via floating format toolbar', async ({ page }) => {
    await editor.placePresetStamp('APPROVED');
    const stamp = editor.stampContainers.first();
    await stamp.click();

    const toolbar = page.locator('.floating-toolbar');
    await expect(toolbar).toBeVisible();
    await expect(toolbar).toContainText('Opacity:');

    // Click decrease opacity
    const decreaseBtn = toolbar.locator('button[title*="Decrease Opacity"]').first();
    await decreaseBtn.click();
    await expect(toolbar).toContainText('Opacity: 75%');

    // Delete stamp
    const deleteBtn = toolbar.locator('button[title*="Delete"]').first();
    await deleteBtn.click();
    await expect(editor.stampContainers).toHaveCount(0);
  });

  test('uploads custom signature image stamp onto canvas', async ({ page }) => {
    await editor.selectTool('image');
    const signaturePath = path.join(fixturesDir, 'sample-signature.png');

    // Attach file to custom stamp file input inside overlay
    const stampFileInput = page.locator('.stamp-picker-dock input[type="file"]');
    await stampFileInput.setInputFiles(signaturePath);

    await page.waitForTimeout(500);

    // Stamp should be placed on canvas
    await expect(editor.stampContainers).toHaveCount(1);
    const customStamp = editor.stampContainers.first();
    await expect(customStamp).toBeVisible();
  });
});
