import { expect, test } from '@playwright/test';

const viewports = [1440, 768, 390, 320];

test('homepage Cadence hero keeps its content semantic without the device preview', async ({ page }) => {
  await page.goto('/index.html', { waitUntil: 'load' });

  const hero = page.locator('#hero.hero--cadence');
  await expect(hero).toHaveCount(1);
  await expect(hero.getByRole('heading', { level: 1 })).toHaveText('Comprendre l’IA pour mieux choisir');
  await expect(hero.locator('.hero-cadence__lede')).toHaveText(/Des repères clairs sur l’intelligence artificielle/i);
  await expect(hero.getByRole('link', { name: /Découvrir les thématiques/i })).toHaveAttribute(
    'href',
    'pages/thematiques.html#themes'
  );
  await expect(hero.locator('.hero-cadence__cta')).toHaveCount(1);
  await expect(hero.locator('.hero-cadence__faces img')).toHaveCount(5);
  expect(await hero.locator('.hero-cadence__faces img').evaluateAll(images => images.every(image => image.alt === ''))).toBe(true);
  await expect(hero.locator('.hero-cadence__device-wrap, .hero-cadence__device')).toHaveCount(0);
  await expect(page.locator('#hero .site-header')).toHaveCount(0);
});

test('homepage sections from hero through partners use one fixed background', async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/index.html', { waitUntil: 'load' });

    const backgrounds = await page.evaluate(() => {
      const hero = document.querySelector('#hero');
      const aboutStory = document.querySelector('.about-story');
      const team = document.querySelector('#team');
      const partners = document.querySelector('#partners');
      const readBackground = element => {
        const styles = getComputedStyle(element);
        return {
          image: styles.backgroundImage,
          color: styles.backgroundColor,
          attachment: styles.backgroundAttachment
        };
      };

      return {
        hero: readBackground(hero),
        aboutStory: readBackground(aboutStory),
        team: readBackground(team),
        partners: readBackground(partners),
        ambientDisplay: getComputedStyle(document.querySelector('.hero-cadence__ambient')).display,
        aboutStoryTop: aboutStory.offsetTop
      };
    });

    expect(backgrounds.hero).toEqual(backgrounds.aboutStory);
    expect(backgrounds.team).toEqual(backgrounds.aboutStory);
    expect(backgrounds.partners).toEqual(backgrounds.aboutStory);
    expect(backgrounds.hero.attachment.split(',').map(value => value.trim())).toEqual(['fixed', 'fixed', 'fixed']);
    expect(backgrounds.ambientDisplay).toBe('none');

    await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), backgrounds.aboutStoryTop);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    await expect(page.locator('.about-story')).toHaveCSS('background-attachment', 'fixed, fixed, fixed');
  }
});

test('team and partner panels extend the About visual language', async ({ page }) => {
  await page.goto('/index.html', { waitUntil: 'load' });

  const styles = await page.evaluate(() => {
    const read = selector => {
      const computed = getComputedStyle(document.querySelector(selector));
      return {
        backgroundImage: computed.backgroundImage,
        borderRadius: computed.borderRadius,
        color: computed.color
      };
    };

    return {
      teamTitle: read('#team-title'),
      teamCard: read('#team .team-member'),
      teamCardTitle: read('#team .team-member h3'),
      teamCardText: read('#team .team-member p'),
      partnerHeading: read('#partners .partner-group h3'),
      partnerBanner: read('#partners .partner-logo-card')
    };
  });

  expect(styles.teamTitle.color).toBe('rgba(0, 0, 0, 0)');
  expect(styles.teamTitle.backgroundImage).toContain('linear-gradient');
  expect(styles.teamCard.backgroundImage).toContain('linear-gradient');
  expect(styles.teamCard.borderRadius).toBe('22px');
  expect(styles.teamCardTitle.color).toBe('rgb(243, 247, 250)');
  expect(styles.teamCardText.color).toBe('rgb(201, 213, 221)');
  expect(styles.partnerHeading.color).toBe('rgb(243, 247, 250)');
  expect(styles.partnerBanner.backgroundImage).toContain('linear-gradient');
  expect(styles.partnerBanner.borderRadius).toBe('16px');
});

test('touch devices use a scrolling cadence background instead of fixed attachment', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();

  await page.goto('/index.html', { waitUntil: 'load' });

  expect(await page.evaluate(() => matchMedia('(hover: none) and (pointer: coarse)').matches)).toBe(true);
  await expect(page.locator('#team')).toHaveCSS('background-attachment', 'scroll, scroll, scroll');
  await expect(page.locator('#partners')).toHaveCSS('background-attachment', 'scroll, scroll, scroll');

  await context.close();
});

test('partner-card motion is disabled when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/index.html', { waitUntil: 'load' });

  await expect(page.locator('#partners .partner-logo-card').first()).toHaveCSS('transition-duration', '0s');
});
for (const width of viewports) {
  test(`homepage Cadence hero fits below the header at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/index.html', { waitUntil: 'load' });

    const layout = await page.evaluate(() => {
      const header = document.querySelector('#header');
      const title = document.querySelector('.hero-cadence__title');
      const cta = document.querySelector('.hero-cadence__cta');
      const headerBottom = header?.getBoundingClientRect().bottom ?? 0;
      const ctaBox = cta?.getBoundingClientRect();

      return {
        titleTop: title?.getBoundingClientRect().top ?? 0,
        headerBottom,
        ctaVisible: Boolean(ctaBox && ctaBox.top >= 0 && ctaBox.bottom <= window.innerHeight),
        heroHeight: document.querySelector('#hero')?.getBoundingClientRect().height ?? 0,
        viewportHeight: window.innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        ctaTransition: getComputedStyle(cta).transitionDuration
      };
    });

    expect(layout.titleTop).toBeGreaterThanOrEqual(layout.headerBottom + 16);
    expect(layout.ctaVisible).toBe(true);
    expect(layout.heroHeight).toBeGreaterThanOrEqual(layout.viewportHeight);
    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.viewportWidth);
    expect(layout.ctaTransition).toBe('0s');
  });
}
