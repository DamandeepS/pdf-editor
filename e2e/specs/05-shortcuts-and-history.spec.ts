import { test, expect } from '@playwright/test';
import { EditorPage } from '../helpers/editor-page';

test.describe('Keyboard Shortcuts, Undo/Redo & Dialogs', () => {
  let editor: EditorPage;

  test.beforeEach(async ({ page }) => {
    editor = new EditorPage(page);
    await editor.goto();
  });

  test('switches tools via single-key shortcuts V, T, W, I', async ({ page }) => {
    const selectBtn = page.locator('.tool-pill:has-text("Select (V)"), button:has-text("Select (V)")').first();
    const textBtn = page.locator('.tool-pill:has-text("Edit Text (T)"), button:has-text("Edit Text (T)")').first();
    const whiteoutBtn = page.locator('.tool-pill:has-text("Whiteout (W)"), button:has-text("Whiteout (W)")').first();
    const stampBtn = page.locator('.tool-pill:has-text("Stamp (I)"), button:has-text("Stamp (I)")').first();

    // Default is select
    await expect(selectBtn).toHaveClass(/active/);

    // Press T
    await page.keyboard.press('t');
    await expect(textBtn).toHaveClass(/active/);

    // Press W
    await page.keyboard.press('w');
    await expect(whiteoutBtn).toHaveClass(/active/);

    // Press I
    await page.keyboard.press('i');
    await expect(stampBtn).toHaveClass(/active/);

    // Press V
    await page.keyboard.press('v');
    await expect(selectBtn).toHaveClass(/active/);
  });

  test('adjusts zoom level via hotkeys and resets zoom', async ({ page }) => {
    const zoomDisplay = page.locator('.top-nav button[title*="Reset Zoom"], .top-nav button.sample-select').first();
    const initialText = await zoomDisplay.innerText();

    // Zoom in (+)
    await page.keyboard.press('+');
    await page.waitForTimeout(200);
    const zoomedInText = await zoomDisplay.innerText();
    expect(zoomedInText).not.toBe(initialText);

    // Zoom reset ('0')
    await page.keyboard.press('0');
    await page.waitForTimeout(200);
    await expect(zoomDisplay).toHaveText('100%');
  });

  test('undo and redo modifications using Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z', async ({ page }) => {
    await expect(editor.whiteoutBoxes).toHaveCount(0);

    // 1. Draw a whiteout
    await editor.drawWhiteout(60, 60, 180, 120);
    await expect(editor.whiteoutBoxes).toHaveCount(1);

    // 2. Undo via Ctrl/Cmd+Z
    const isMac = process.platform === 'darwin';
    const modifier = isMac ? 'Meta' : 'Control';
    await page.keyboard.press(`${modifier}+z`);
    await page.waitForTimeout(300);
    await expect(editor.whiteoutBoxes).toHaveCount(0);

    // 3. Redo via Ctrl/Cmd+Shift+Z
    await page.keyboard.press(`${modifier}+Shift+z`);
    await page.waitForTimeout(300);
    await expect(editor.whiteoutBoxes).toHaveCount(1);
  });

  test('opens and dismisses shortcuts modal via brand click and Escape', async ({ page }) => {
    // Click brand wrapper or shortcuts button in status bar
    const shortcutsBtn = page.locator('.status-shortcut-btn, .brand-wrapper').first();
    await shortcutsBtn.click();

    // Modal should be open
    const modal = page.locator('[role="dialog"], .inq-modal-dialog');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Keyboard Shortcuts');

    // Press Escape to dismiss
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });

  test('opens and dismisses privacy policy modal', async ({ page }) => {
    // Click Privacy in status bar
    const privacyBtn = page.locator('.status-link-btn:has-text("Privacy"), button:has-text("Privacy")').first();
    await privacyBtn.click();

    const modal = page.locator('[role="dialog"], .inq-modal-dialog');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Privacy');

    // Close via close button or Escape
    const closeBtn = modal.locator('button[title*="Close"], button[aria-label="Close dialog"]').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await expect(modal).not.toBeVisible();
  });

  test('toggles dark and light mode themes across application', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    // Click theme toggle
    await editor.toggleTheme();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('body')).toHaveClass(/theme-dark/);

    // Click again to return to light
    await editor.toggleTheme();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.locator('body')).toHaveClass(/theme-light/);
  });
});
