import { test, expect } from '@playwright/test';

test.describe('Design System Living Component & Token Workbench', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/design-system/');
    await page.waitForLoadState('networkidle');
  });

  test('loads design system workbench with brand header and navigation items', async ({ page }) => {
    await expect(page).toHaveTitle(/Inq Design System/);
    const mainHeading = page.locator('h1, .story-title, .header-title').first();
    await expect(mainHeading).toBeVisible();

    // Verify presence of story items in navigation sidebar
    const navButtons = page.locator('nav button, .story-nav-item, button.nav-item');
    expect(await navButtons.count()).toBeGreaterThan(10);
  });

  test('navigates to interactive Checkbox story and toggles states', async ({ page }) => {
    const checkboxStoryBtn = page.locator('button:has-text("Checkbox")').first();
    await checkboxStoryBtn.click();

    // Main header should reflect Checkbox component
    await expect(page.locator('h1, h2').filter({ hasText: 'Checkbox' }).first()).toBeVisible();

    // Find and click an interactive checkbox in the preview pane
    const checkbox = page.locator('input[type="checkbox"]').first();
    await expect(checkbox).toBeVisible();
    const initialChecked = await checkbox.isChecked();
    await checkbox.click();
    expect(await checkbox.isChecked()).toBe(!initialChecked);
  });

  test('explores Design Tokens and verifies color palette tokens', async ({ page }) => {
    const tokensStoryBtn = page.locator('button:has-text("Design Tokens")').first();
    await tokensStoryBtn.click();

    // Verify token categories or token studio appear
    const tokenHeading = page.locator('.tokens-studio-title, h1').first();
    await expect(tokenHeading).toBeVisible();

    // Verify brand tokens or category pills exist in the workbench view
    const tokenItems = page.locator('.tokens-cat-pill, .brand-card, .semantic-card, .tokens-tr-row');
    expect(await tokenItems.count()).toBeGreaterThan(0);
  });

  test('explores Material Icons catalog', async ({ page }) => {
    const iconsStoryBtn = page.locator('button:has-text("Material Icons")').first();
    await iconsStoryBtn.click();

    // Verify icon preview items
    const iconCards = page.locator('.icon-grid-item');
    expect(await iconCards.count()).toBeGreaterThan(10);
  });

  test('toggles dark and light mode in design system workbench', async ({ page }) => {
    const themeBtn = page.locator('button[title*="theme"], button:has-text("Dark"), button:has-text("Light"), button:has(svg)').first();
    if (await themeBtn.isVisible()) {
      const initialTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme') || 'light');
      await themeBtn.click();
      await page.waitForTimeout(200);
      const newTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      expect(newTheme).not.toBe(initialTheme);
    }
  });
});
