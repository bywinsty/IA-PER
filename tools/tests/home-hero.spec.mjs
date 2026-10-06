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
    'pages/thématiques/thematiques.html#themes'
  );
  await expect(hero.locator('.hero-cadence__cta')).toHaveCount(1);
  await expect(hero.locator('.hero-cadence__faces img')).toHaveCount(5);
  expect(await hero.locator('.hero-cadence__faces img').evaluateAll(images => images.every(image => image.alt === ''))).toBe(true);
  await expect(hero.locator('.hero-cadence__device-wrap, .hero-cadence__device')).toHaveCount(0);
  await expect(page.locator('#hero .site-header')).toHaveCount(0);
});

test('homepage hero and workflow use one fixed background across the scroll boundary', async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/index.html', { waitUntil: 'load' });

    const backgrounds = await page.evaluate(() => {
      const hero = document.querySelector('#hero');
      const workflow = document.querySelector('.workflow-cadence');
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
        workflow: readBackground(workflow),
        ambientDisplay: getComputedStyle(document.querySelector('.hero-cadence__ambient')).display,
        workflowTop: workflow.offsetTop
      };
    });

    expect(backgrounds.hero).toEqual(backgrounds.workflow);
    expect(backgrounds.hero.attachment.split(',').map(value => value.trim())).toEqual(['fixed', 'fixed', 'fixed']);
    expect(backgrounds.ambientDisplay).toBe('none');

    await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), backgrounds.workflowTop);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    await expect(page.locator('.workflow-cadence')).toHaveCSS('background-attachment', 'fixed, fixed, fixed');
  }
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
