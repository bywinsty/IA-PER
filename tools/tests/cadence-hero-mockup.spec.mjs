import { expect, test } from '@playwright/test';

test('Cadence hero mockup condenses its header after scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const response = await page.goto('/pages/mockups/04-cadence-hero.html', { waitUntil: 'load' });

  expect(response?.ok()).toBe(true);
  await expect(page.locator('main > section.hero')).toHaveCount(1);
  await expect(page.locator('main > section')).toHaveCount(1);
  await expect(page.locator('.site-header')).not.toHaveClass(/is-scrolled/);
  await expect(page.locator('.brand-mark img')).toHaveAttribute('src', '../../assets/img/ia-per.svg');
  expect(await page.locator('.brand-mark img').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
  await expect(page.locator('body')).toHaveCSS('font-family', /Geist/);
  await expect(page.locator('h1')).toHaveCSS('font-size', '96px');
  await expect(page.locator('h1')).toHaveCSS('font-weight', '600');
  await expect(page.locator('.nav-cta .button')).toHaveCSS('height', '38px');
  await expect(page.locator('.cta')).toHaveCSS('height', '52px');
  expect(await page.evaluate(async () => {
    await document.fonts.ready;
    return document.fonts.check('16px Geist');
  })).toBe(true);
  expect(await page.locator('.nav-links a').evaluateAll(links => links.every((link, index, items) =>
    index === 0 || link.getBoundingClientRect().left - items[index - 1].getBoundingClientRect().right >= 2
  ))).toBe(true);

  await page.evaluate(() => window.scrollTo({ top: 80, behavior: 'instant' }));
  await expect(page.locator('.site-header')).toHaveClass(/is-scrolled/);
  await expect(page.locator('.nav-bg')).toHaveCSS('backdrop-filter', /blur/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
