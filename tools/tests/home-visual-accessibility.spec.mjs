import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

for (const width of [320, 375, 768]) {
  test(`about chapters remain discoverable and separate with text spacing at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/index.html');
    await page.addStyleTag({ content: '* { line-height:1.5!important; letter-spacing:.12em!important; word-spacing:.16em!important } p { margin-bottom:2em!important }' });
    for (let i = 0; i < 4; i++) {
      const tab = page.locator(`[data-about-tab="${i}"]`);
      const tabBox = await tab.boundingBox();
      expect(tabBox.x).toBeGreaterThanOrEqual(0);
      expect(tabBox.x + tabBox.width).toBeLessThanOrEqual(width);
      await tab.click();
      const layout = await page.evaluate(() => {
        const box = selector => document.querySelector(selector).getBoundingClientRect().toJSON();
        return { tabs: box('.about-story__tabs'), panel: box('[data-about-panel]:not([hidden])'), stage: box('.about-story__stage'), frame: box('.about-story__screen.is-active .about-story__frame') };
      });
      expect(layout.panel.top).toBeGreaterThanOrEqual(layout.tabs.bottom);
      expect(layout.stage.top).toBeGreaterThanOrEqual(layout.panel.bottom);
      expect(layout.frame.top).toBeGreaterThanOrEqual(layout.stage.top - 1);
      expect(layout.frame.bottom).toBeLessThanOrEqual(layout.stage.bottom + 1);
    }
  });
}

for (const width of [320, 375]) {
  test(`team and active illustration contain doubled text at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/index.html');
    await page.evaluate(() => {
      const elements = [...document.querySelectorAll('main *')];
      const sizes = elements.map(e => parseFloat(getComputedStyle(e).fontSize) * 2);
      elements.forEach((e, i) => e.style.setProperty('font-size', `${sizes[i]}px`, 'important'));
    });
    for (let i = 0; i < 4; i++) {
      await page.locator(`[data-about-tab="${i}"]`).click();
      const overflow = await page.locator('.about-story__screen.is-active .about-story__frame').evaluate(e => e.scrollWidth - e.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
    }
    const clippedText = await page.locator('#team .team-member').evaluateAll(cards => cards.flatMap(card => {
      const bounds = card.getBoundingClientRect();
      return [...card.querySelectorAll('h3, .team-role, p')].flatMap(element => {
        const range = document.createRange();
        range.selectNodeContents(element);
        return [...range.getClientRects()].filter(r => r.left < bounds.left || r.right > bounds.right).map(() => element.textContent);
      });
    }));
    expect(clippedText).toEqual([]);
  });
}

test('single partner logos stay centred on tablets', async ({ page }) => {
  for (const width of [576, 768, 960, 991]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/index.html');
    const offsets = await page.locator('.partner-logo-grid--funding').evaluateAll(grids => grids.map(grid => {
      const parent = grid.getBoundingClientRect();
      const card = grid.firstElementChild.getBoundingClientRect();
      return Math.abs(card.x + card.width / 2 - parent.x - parent.width / 2);
    }));
    offsets.forEach(offset => expect(offset).toBeLessThanOrEqual(1));
  }
  await page.setViewportSize({ width: 375, height: 900 });
  const narrowCards = await page.locator('.partner-logo-card').evaluateAll(cards => cards.map(card => ({
    width: card.getBoundingClientRect().width,
    available: card.parentElement.getBoundingClientRect().width
  })));
  narrowCards.forEach(card => expect(Math.abs(card.width - card.available)).toBeLessThanOrEqual(1));
});
