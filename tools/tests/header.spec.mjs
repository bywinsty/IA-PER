import { expect, test } from '@playwright/test';

const pages = [
  { file: 'index.html', type: 'home', assetPrefix: '' },
  { file: 'pages/thématiques/thematiques.html', type: 'breadcrumb', assetPrefix: '../../' },
  { file: 'pages/thématiques/environnement.html', type: 'breadcrumb', assetPrefix: '../../' },
  { file: 'pages/thématiques/professionnel.html', type: 'breadcrumb', assetPrefix: '../../' },
  { file: 'pages/thématiques/societe.html', type: 'breadcrumb', assetPrefix: '../../' },
  { file: 'pages/404.html', type: 'breadcrumb', assetPrefix: '../' },
  { file: 'pages/service-details.html', type: 'breadcrumb', assetPrefix: '../' },
  { file: 'pages/starter-page.html', type: 'breadcrumb', assetPrefix: '../' }
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
    await expect(page.locator(`link[href="${definition.assetPrefix}assets/css/header.css"]`)).toHaveCount(1);
    await expect(page.locator(`script[src="${definition.assetPrefix}assets/js/header.js"]`)).toHaveCount(1);
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

test('production pages keep local links and assets reachable', async ({ page, request }) => {
  for (const definition of pages) {
    await page.goto(`/${definition.file}`, { waitUntil: 'domcontentloaded' });
    const localUrls = await page.evaluate(() => {
      const urls = [...document.querySelectorAll('a[href], link[href], script[src], img[src]')]
        .map(element => element.href || element.src)
        .map(value => new URL(value, document.baseURI))
        .filter(url => url.origin === window.location.origin)
        .map(url => `${url.pathname}${url.search}`);
      return [...new Set(urls)];
    });

    for (const url of localUrls) {
      const response = await request.get(url);
      expect(response.ok(), `${definition.file} -> ${url} returned ${response.status()}`).toBe(true);
    }
  }
});

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

for (const width of [1440, 380]) {
  test(`homepage reading progress sits directly below the header at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/index.html', { waitUntil: 'load' });

    const positions = await page.evaluate(() => {
      const header = document.querySelector('#header');
      const progress = document.querySelector('#scroll-progress');
      return {
        headerBottom: header?.getBoundingClientRect().bottom ?? 0,
        progressTop: progress?.getBoundingClientRect().top ?? 0
      };
    });

    expect(Math.abs(positions.progressTop - positions.headerBottom)).toBeLessThanOrEqual(1);
  });
}

test('homepage reading progress tracks the document from start to finish', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/index.html', { waitUntil: 'load' });

  const progress = page.locator('#scroll-progress');
  await expect(progress).toHaveAttribute('role', 'progressbar');
  await expect(progress).toHaveAttribute('aria-valuenow', '0');

  const values = await page.evaluate(async () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const readProgress = () => new Promise(resolve => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve(
        document.querySelector('#scroll-progress')?.getAttribute('aria-valuenow')
      )));
    });

    window.scrollTo({ top: Math.round(maxScroll / 2), behavior: 'instant' });
    const middle = await readProgress();
    window.scrollTo({ top: maxScroll, behavior: 'instant' });
    const end = await readProgress();
    return { maxScroll, middle, end };
  });

  expect(values.maxScroll).toBeGreaterThan(0);
  expect(Number(values.middle)).toBeGreaterThan(40);
  expect(Number(values.middle)).toBeLessThan(60);
  expect(values.end).toBe('100');
});
