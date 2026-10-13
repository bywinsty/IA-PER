import { expect, test } from '@playwright/test';

const pages = [
  { file: 'index.html', type: 'home', assetPrefix: '' },
  { file: 'pages/thematiques.html', type: 'thematics', assetPrefix: '../' },
  { file: 'pages/thématiques/environnement.html', type: 'breadcrumb', assetPrefix: '../../' },
  { file: 'pages/thématiques/professionnel.html', type: 'breadcrumb', assetPrefix: '../../' },
  { file: 'pages/thématiques/societe.html', type: 'breadcrumb', assetPrefix: '../../' },
  { file: '404.html', type: 'brand-only', assetPrefix: '' }
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
      await expect(header.locator('#scroll-progress')).toHaveCount(1);
    } else if (definition.type === 'thematics') {
      await expect(header.locator('.header-page-nav')).toHaveCount(1);
      await expect(header.locator('.header-page-nav')).toHaveAttribute('aria-label', 'Navigation des thématiques');
      await expect(header.locator('.header-current-link')).toHaveText('Thématiques');
      await expect(header.locator('.header-current-link')).toHaveAttribute('href', 'thematiques.html');
      await expect(header.locator('.header-current-link')).toHaveAttribute('aria-current', 'page');
      await expect(header.locator('.header-section-links a')).toHaveCount(3);
      await expect(header.locator('.header-section-links a')).toHaveText(['Environnement', 'Professionnel', 'Société']);
      await expect.poll(() => header.locator('.header-section-links a').evaluateAll(links => links.map(link => link.getAttribute('href'))))
        .toEqual(['thématiques/environnement.html', 'thématiques/professionnel.html', 'thématiques/societe.html']);
      await expect(header.locator('.header-breadcrumbs')).toHaveCount(0);
      await expect(header.locator('#scroll-progress')).toHaveCount(1);
      await expect(page.locator('#sources')).toHaveCount(0);
      await expect(page.locator('main')).not.toContainText('Sources et références');
    } else if (definition.type === 'brand-only') {
      await expect(header.locator('.header-brand .logo')).toHaveCount(1);
      await expect(header.locator('.header-breadcrumbs, .header-page-nav, .header-theme-cta')).toHaveCount(0);
      await expect(header.locator('#scroll-progress')).toHaveCount(1);
      expect(await header.locator('#scroll-progress').evaluate(progress => progress.parentElement?.classList.contains('header-inner'))).toBe(true);
    } else {
      const breadcrumbs = header.locator('.header-breadcrumbs');
      await expect(breadcrumbs).toHaveCount(1);
      await expect(breadcrumbs.locator('a[aria-current="page"]')).toHaveCount(1);
      await expect(header.locator('.header-page-nav')).toHaveCount(0);
      await expect(header.locator('#scroll-progress')).toHaveCount(1);
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

test('theme CTA stays at the right edge and keeps the correct local route', async ({ page }) => {
  const cases = [
    { file: 'index.html', href: 'pages/thematiques.html#themes' },
    { file: 'pages/thematiques.html', href: 'thematiques.html#themes' },
    { file: 'pages/thématiques/environnement.html', href: '../thematiques.html#themes' },
    { file: 'pages/thématiques/professionnel.html', href: '../thematiques.html#themes' },
    { file: 'pages/thématiques/societe.html', href: '../thematiques.html#themes' },
  ];

  for (const definition of cases) {
    await page.goto(`/${definition.file}`, { waitUntil: 'domcontentloaded' });
    const cta = page.locator('.header-theme-cta');
    await expect(cta).toHaveText('Découvrir les thématiques →');
    await expect(cta).toHaveAttribute('href', definition.href);

    const edgeGap = await page.evaluate(() => {
      const button = document.querySelector('.header-theme-cta')?.getBoundingClientRect();
      const panel = document.querySelector('.header-inner')?.getBoundingClientRect();
      return panel && button ? panel.right - button.right : Number.POSITIVE_INFINITY;
    });
    expect(edgeGap).toBeGreaterThanOrEqual(0);
    expect(edgeGap).toBeLessThanOrEqual(20);
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

test('homepage keeps only the page link current while the hero is visible', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('.header-current-link')).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.header-section-links a[aria-current="location"]')).toHaveCount(0);
  await expect(page.locator('.header-section-links a.is-active')).toHaveCount(0);
});

test('thematics page keeps a page-local current link without breadcrumbs', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/pages/thematiques.html', { waitUntil: 'domcontentloaded' });

  const themesLink = page.locator('.header-current-link');
  await expect(themesLink).toHaveAttribute('aria-current', 'page');
  await expect(themesLink).toHaveAttribute('href', 'thematiques.html');
  await expect(page.locator('.header-breadcrumbs')).toHaveCount(0);
  await themesLink.click();
  const currentUrl = new URL(page.url());
  expect(decodeURIComponent(currentUrl.pathname)).toBe('/pages/thematiques.html');
  expect(currentUrl.hash).toBe('');
  await expect(themesLink).toHaveAttribute('aria-current', 'page');
});

test('thematics page direct hash navigation respects the dynamic header', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });

  for (const id of ['themes', 'faq']) {
    await page.goto(`/pages/thematiques.html#${id}`, { waitUntil: 'load' });
    await waitForAnchorAlignment(page, `#${id}`);
    if (id === 'themes') {
      await expect(page.locator('.header-current-link')).toHaveAttribute('href', 'thematiques.html');
    }
  }
});

for (const width of [1440, 640, 380, 300, 280]) {
  test(`thematics page header stays within ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/pages/thematiques.html', { waitUntil: 'domcontentloaded' });
    await expectHeaderMetrics(page);
    await expectNoHorizontalOverflow(page);
  });
}

test('direct hash navigation respects the header in reduced-motion mode', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/index.html#team', { waitUntil: 'load' });
  await waitForAnchorAlignment(page, '#team');
  await expect(page.locator('.header-section-links a[href="#team"]')).toHaveAttribute('aria-current', 'location');
});

test('homepage header spreads at the top and condenses around the centered navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/index.html', { waitUntil: 'load' });

  const topState = await page.evaluate(() => {
    const header = document.querySelector('#header');
    const inner = document.querySelector('.header-inner');
    const logo = document.querySelector('.site-logo');
    const siteName = document.querySelector('.site-name');
    const nav = document.querySelector('.header-page-nav');
    const current = document.querySelector('.header-current-link');
    const sectionList = document.querySelector('.header-section-links');
    const cta = document.querySelector('.header-theme-cta');
    const progress = document.querySelector('#scroll-progress');
    const rect = element => {
      const bounds = element.getBoundingClientRect();
      return {
        left: bounds.left,
        right: bounds.right,
        top: bounds.top,
        bottom: bounds.bottom,
        width: bounds.width,
        center: bounds.left + bounds.width / 2
      };
    };
    return {
      header: rect(header),
      inner: rect(inner),
      logo: rect(logo),
      siteName: rect(siteName),
      nav: rect(nav),
      current: rect(current),
      sectionList: rect(sectionList),
      cta: rect(cta),
      progress: rect(progress),
      progressParentIsInner: progress?.parentElement === inner,
      siteNameText: siteName?.textContent.trim()
    };
  });

  expect(topState.inner.width).toBeGreaterThan(1200);
  expect(topState.inner.top).toBeLessThanOrEqual(1);
  expect(topState.progressParentIsInner).toBe(true);
  expect(Math.abs(topState.progress.left - topState.inner.left)).toBeLessThanOrEqual(1);
  expect(Math.abs(topState.progress.right - topState.inner.right)).toBeLessThanOrEqual(1);
  expect(Math.abs(topState.progress.bottom - topState.inner.bottom)).toBeLessThanOrEqual(1);
  expect(topState.siteName.width).toBeGreaterThan(0);
  expect(topState.siteNameText).toBe('IA-PER');
  expect(topState.logo.left).toBeLessThan(80);
  expect(topState.cta.right).toBeGreaterThan(1360);
  expect(Math.abs((topState.current.left + topState.current.width / 2) - (topState.nav.left + topState.nav.width / 2))).toBeLessThanOrEqual(2);
  expect(Math.abs(topState.nav.center - topState.inner.center)).toBeLessThanOrEqual(2);
  expect(Math.abs(topState.sectionList.center - topState.current.center)).toBeLessThanOrEqual(2);

  await page.evaluate(() => window.scrollTo({ top: 200, behavior: 'instant' }));
  await expect(page.locator('body')).toHaveClass(/scrolled/);
  await expect.poll(
    () => page.evaluate(() => document.querySelector('.header-inner')?.getBoundingClientRect().width ?? 0),
    { timeout: 2_000 }
  ).toBeLessThan(topState.inner.width - 200);

  const scrolledState = await page.evaluate(() => {
    const inner = document.querySelector('.header-inner');
    const logo = document.querySelector('.site-logo');
    const cta = document.querySelector('.header-theme-cta');
    const current = document.querySelector('.header-current-link');
    const sectionList = document.querySelector('.header-section-links');
    const progress = document.querySelector('#scroll-progress');
    const rect = element => {
      const bounds = element.getBoundingClientRect();
      return {
        left: bounds.left,
        right: bounds.right,
        top: bounds.top,
        bottom: bounds.bottom,
        width: bounds.width,
        center: bounds.left + bounds.width / 2
      };
    };
    return {
      inner: rect(inner),
      logo: rect(logo),
      cta: rect(cta),
      current: rect(current),
      sectionList: rect(sectionList),
      progress: rect(progress)
    };
  });

  expect(scrolledState.inner.width).toBeLessThan(topState.inner.width - 200);
  expect(scrolledState.inner.top).toBeLessThanOrEqual(1);
  expect(Math.abs(scrolledState.progress.left - scrolledState.inner.left)).toBeLessThanOrEqual(1);
  expect(Math.abs(scrolledState.progress.right - scrolledState.inner.right)).toBeLessThanOrEqual(1);
  expect(Math.abs(scrolledState.progress.bottom - scrolledState.inner.bottom)).toBeLessThanOrEqual(1);
  expect(Math.abs(scrolledState.sectionList.center - scrolledState.current.center)).toBeLessThanOrEqual(2);
  expect(scrolledState.logo.left).toBeGreaterThan(topState.logo.left + 80);
  expect(scrolledState.cta.right).toBeLessThan(topState.cta.right - 80);
});

test('homepage mobile header keeps the brand, navigation, and CTA separated', async ({ page }) => {
  await page.setViewportSize({ width: 380, height: 900 });
  await page.goto('/index.html', { waitUntil: 'load' });

  const layout = await page.evaluate(() => {
    const rect = selector => {
      const bounds = document.querySelector(selector).getBoundingClientRect();
      return {
        left: bounds.left,
        right: bounds.right,
        top: bounds.top,
        bottom: bounds.bottom,
        center: bounds.left + bounds.width / 2
      };
    };
    return {
      logo: rect('.site-logo'),
      siteName: rect('.site-name'),
      nav: rect('.header-page-nav'),
      current: rect('.header-current-link'),
      sections: rect('.header-section-links'),
      cta: rect('.header-theme-cta'),
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth
    };
  });

  expect(layout.siteName.left).toBeGreaterThanOrEqual(layout.logo.right - 1);
  expect(layout.nav.top).toBeGreaterThanOrEqual(layout.logo.bottom - 1);
  expect(layout.cta.top).toBeGreaterThanOrEqual(layout.sections.bottom - 1);
  expect(Math.abs(layout.sections.center - layout.current.center)).toBeLessThanOrEqual(2);
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.viewportWidth);
});

for (const width of [380]) {
  test(`homepage reading progress is part of the header at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/index.html', { waitUntil: 'load' });

    const positions = await page.evaluate(() => {
      const inner = document.querySelector('.header-inner');
      const progress = document.querySelector('#scroll-progress');
      const innerRect = inner?.getBoundingClientRect();
      const progressRect = progress?.getBoundingClientRect();
      return {
        parentIsInner: progress?.parentElement === inner,
        innerBottom: innerRect?.bottom ?? 0,
        progressBottom: progressRect?.bottom ?? 0
      };
    });

    expect(positions.parentIsInner).toBe(true);
    expect(Math.abs(positions.progressBottom - positions.innerBottom)).toBeLessThanOrEqual(1);
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

test('thematics page reading progress tracks the document from start to finish', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/pages/thematiques.html', { waitUntil: 'load' });

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
