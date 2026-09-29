import { expect, test } from '@playwright/test';

const pages = [
  { file: 'index.html', type: 'home' },
  { file: 'thematiques.html', type: 'breadcrumb' },
  { file: 'environnement.html', type: 'breadcrumb' },
  { file: 'professionnel.html', type: 'breadcrumb' },
  { file: 'societe.html', type: 'breadcrumb' },
  { file: '404.html', type: 'breadcrumb' },
  { file: 'service-details.html', type: 'breadcrumb' },
  { file: 'starter-page.html', type: 'breadcrumb' }
];

async function expectNoHorizontalOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

async function expectHeaderMetrics(page) {
  const metrics = await page.evaluate(() => {
    const header = document.querySelector('#header');
    return {
      height: Math.ceil(header?.getBoundingClientRect().height || 0),
      variable: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height'), 10)
    };
  });
  expect(metrics.height).toBeGreaterThan(0);
  expect(metrics.variable).toBe(metrics.height);
}

async function waitForAnchorAlignment(page, selector) {
  await expect.poll(async () => page.evaluate((targetSelector) => {
    const target = document.querySelector(targetSelector);
    const header = document.querySelector('#header');
    if (!target || !header) return Number.POSITIVE_INFINITY;
    return Math.abs(target.getBoundingClientRect().top - header.getBoundingClientRect().bottom);
  }, selector), { timeout: 8_000 }).toBeLessThanOrEqual(2);
}

for (const definition of pages) {
  test(`${definition.file} renders one generated ${definition.type} header`, async ({ page }) => {
    const pageErrors = [];
    const consoleErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    const response = await page.goto(`/${definition.file}`, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);

    const header = page.locator('#header');
    await expect(header).toHaveCount(1);
    await expect(header.locator('.site-logo')).toHaveCount(1);
    await expect(header.locator('.site-logo')).toHaveAttribute('alt', 'IA-PER — Progrès, Enjeux et Responsabilités');
    await expect(page.locator('link[href="assets/css/header.css"]')).toHaveCount(1);
    await expect(page.locator('script[src="assets/js/header.js"]')).toHaveCount(1);
    await expectHeaderMetrics(page);
    await expectNoHorizontalOverflow(page);

    if (definition.type === 'home') {
      await expect(header.locator('.header-page-nav')).toHaveCount(1);
      await expect(header.locator('.header-section-links a')).toHaveCount(3);
      await expect(header.locator('.header-breadcrumbs')).toHaveCount(0);
    } else {
      const breadcrumbs = header.locator('.header-breadcrumbs');
      await expect(breadcrumbs).toHaveCount(1);
      await expect(breadcrumbs.locator('a[aria-current="page"]')).toHaveCount(1);
      await expect(breadcrumbs.locator('ol')).toHaveCSS('list-style-type', 'none');
      await expect(header.locator('.header-page-nav')).toHaveCount(0);
    }

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
}

for (const width of [1440, 640, 380, 300, 280]) {
  test(`homepage header stays within ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    await expectHeaderMetrics(page);
    await expectNoHorizontalOverflow(page);
  });
}

for (const definition of pages.filter(page => page.type === 'breadcrumb')) {
  test(`${definition.file} breadcrumb stays within 280px`, async ({ page }) => {
    await page.setViewportSize({ width: 280, height: 900 });
    await page.goto(`/${definition.file}`, { waitUntil: 'domcontentloaded' });
    await expectHeaderMetrics(page);
    await expectNoHorizontalOverflow(page);
  });
}

test('homepage anchors remain below the fixed header and activate their link', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

  for (const id of ['about', 'team', 'partners']) {
    const link = page.locator(`.header-section-links a[href="#${id}"]`);
    await link.click();
    await waitForAnchorAlignment(page, `#${id}`);
    await expect(link).toHaveAttribute('aria-current', 'location');
  }
});

test('direct hash navigation respects the header in reduced-motion mode', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/index.html#team', { waitUntil: 'load' });
  await waitForAnchorAlignment(page, '#team');
  await expect(page.locator('.header-section-links a[href="#team"]')).toHaveAttribute('aria-current', 'location');
});

test('skip link is first in the keyboard order and becomes visible on focus', async ({ page }) => {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  const skipLink = page.locator('.skip-link');
  await page.keyboard.press('Tab');
  await expect(skipLink).toBeFocused();
  await expect.poll(() => skipLink.evaluate(element => element.getBoundingClientRect().top >= 0)).toBe(true);
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
});

test('scrolling changes the header to its scrolled state', async ({ page }) => {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => window.scrollTo({ top: 200, behavior: 'instant' }));
  await expect(page.locator('body')).toHaveClass(/scrolled/);
});
