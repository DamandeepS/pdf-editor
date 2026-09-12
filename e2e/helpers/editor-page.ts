import { type Page, type Locator, expect } from '@playwright/test';

export class EditorPage {
  readonly page: Page;
  readonly topNav: Locator;
  readonly titleInput: Locator;
  readonly sampleSelect: Locator;
  readonly fileInput: Locator;
  readonly canvas: Locator;
  readonly canvasViewport: Locator;
  readonly textItems: Locator;
  readonly whiteoutBoxes: Locator;
  readonly stampContainers: Locator;
  readonly pageThumbnails: Locator;
  readonly exportButton: Locator;
  readonly cookieAcceptButton: Locator;
  readonly shortcutsModal: Locator;
  readonly privacyModal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.topNav = page.locator('.top-nav');
    this.titleInput = page.locator('.doc-title-input');
    this.sampleSelect = page.locator('.sample-select').first();
    this.fileInput = page.locator('header.top-nav input[type="file"]');
    this.canvas = page.locator('.pdf-canvas');
    this.canvasViewport = page.locator('.canvas-viewport');
    this.textItems = page.locator('.text-span-box');
    this.whiteoutBoxes = page.locator('.whiteout-box');
    this.stampContainers = page.locator('.image-stamp-box');
    this.pageThumbnails = page.locator('.page-card');
    this.exportButton = page.locator('.top-nav button:has-text("Export")');
    this.cookieAcceptButton = page.locator('.cookie-consent-banner button:has-text("Accept Analytics"), .cookie-consent-banner button:has-text("Accept")');
    this.shortcutsModal = page.locator('.shortcuts-modal-card, .modal-backdrop');
    this.privacyModal = page.locator('.privacy-modal-card, .modal-backdrop');
  }

  async goto(theme: 'light' | 'dark' = 'light') {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');

    // Dismiss cookie banner if visible so it doesn't block clicks
    try {
      if (await this.cookieAcceptButton.isVisible()) {
        await this.cookieAcceptButton.click();
      }
    } catch {
      // safe ignore
    }

    if (theme === 'dark') {
      const currentTheme = await this.page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      if (currentTheme !== 'dark') {
        await this.toggleTheme();
      }
    }

    await this.waitForCanvasReady();
  }

  async waitForCanvasReady() {
    await expect(this.canvas).toBeVisible({ timeout: 15000 });
    await expect(this.textItems.first()).toBeVisible({ timeout: 15000 });
  }

  async selectTool(tool: 'select' | 'text' | 'whiteout' | 'image') {
    const toolMap: Record<string, string> = {
      select: 'Select (V)',
      text: 'Edit Text (T)',
      whiteout: 'Whiteout (W)',
      image: 'Stamp (I)',
    };
    await this.page.locator(`.tool-pill:has-text("${toolMap[tool]}"), button:has-text("${toolMap[tool]}")`).first().click();
  }

  async selectSampleTemplate(sampleId: string) {
    await this.sampleSelect.selectOption(sampleId);
    await this.page.waitForTimeout(600);
    await this.waitForCanvasReady();
  }

  async uploadCustomPdf(absoluteFilePath: string) {
    await this.fileInput.setInputFiles(absoluteFilePath);
    await this.page.waitForTimeout(800);
    await this.waitForCanvasReady();
  }

  async setDocumentTitle(title: string) {
    await this.titleInput.fill(title);
    await this.titleInput.press('Enter');
  }

  async getDocumentTitle(): Promise<string> {
    return await this.titleInput.inputValue();
  }

  async toggleTheme() {
    const themeBtn = this.page.locator('.nav-right button').first();
    await themeBtn.click();
    await this.page.waitForTimeout(200);
  }

  async zoomIn() {
    await this.page.locator('button[title*="Zoom In"]').click();
  }

  async zoomOut() {
    await this.page.locator('button[title*="Zoom Out"]').click();
  }

  async resetZoom() {
    await this.page.locator('button[title*="Reset Zoom"]').click();
  }

  async undo() {
    await this.page.locator('button[title*="Undo"]').click();
  }

  async redo() {
    await this.page.locator('button[title*="Redo"]').click();
  }

  locateText(textSubstring: string): Locator {
    return this.page.locator(`.text-span-box[data-text*="${textSubstring}"]`).first();
  }

  async clickTextItem(textSubstring: string) {
    const item = this.locateText(textSubstring);
    await expect(item).toBeVisible();
    await item.click();
    return item;
  }

  async editTextItem(textSubstring: string, newText: string) {
    await this.selectTool('text');
    const item = await this.clickTextItem(textSubstring);
    const input = item.locator('input.inline-edit-input');
    await expect(input).toBeVisible();
    await input.fill(newText);
    await this.canvasViewport.click({ position: { x: 10, y: 10 } });
  }

  async drawWhiteout(startX: number, startY: number, endX: number, endY: number) {
    await this.selectTool('whiteout');
    const canvasBox = await this.canvas.boundingBox();
    if (!canvasBox) throw new Error('Canvas bounding box not found');

    const absStartX = canvasBox.x + startX;
    const absStartY = canvasBox.y + startY;
    const absEndX = canvasBox.x + endX;
    const absEndY = canvasBox.y + endY;

    await this.page.mouse.move(absStartX, absStartY);
    await this.page.mouse.down();
    await this.page.mouse.move(absEndX, absEndY, { steps: 5 });
    await this.page.mouse.up();
    await this.page.waitForTimeout(300);
  }

  async placePresetStamp(presetText: 'PAID' | 'VOID' | 'APPROVED' | 'CONFIDENTIAL') {
    await this.selectTool('image');
    const stampOption = this.page.locator(`.stamp-btn:has-text("${presetText}"), button:has-text("${presetText}")`).first();
    await expect(stampOption).toBeVisible({ timeout: 5000 });
    await stampOption.click();
    await this.page.waitForTimeout(300);
  }
}
