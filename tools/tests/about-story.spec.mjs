import { expect, test } from '@playwright/test';

test.describe('homepage about story', () => {
  test('replaces the former workflow and legacy about section with one project story', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

    const about = page.locator('#about.about-story');
    await expect(about).toHaveCount(1);
    await expect(page.locator('#workflow')).toHaveCount(0);
    await expect(about.getByRole('heading', { level: 2 })).toHaveText('À propos');
    await expect(about.locator('.about-story__chapter')).toHaveCount(4);
    await expect(about.locator('.about-story__screen')).toHaveCount(4);
    await expect(about).toContainText('Aventure Digitale');
    await expect(about).toContainText('CF2M');
    await expect(about.getByRole('link', { name: 'Découvrir les thématiques' })).toHaveCount(0);
    await expect(about).toContainText('Environnement');
    await expect(about).toContainText('Professionnel');
    await expect(about).toContainText('Société');
    await expect(about.evaluate((node) => node.compareDocumentPosition(document.querySelector('#team')) & Node.DOCUMENT_POSITION_FOLLOWING)).resolves.toBeTruthy();
  });

  test('uses accessible mobile tabs with keyboard navigation', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

    const about = page.locator('#about');
    const tabs = about.getByRole('tab');
    await expect(tabs).toHaveCount(4);
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
    await expect(about.getByRole('tabpanel')).toHaveCount(1);

    await tabs.first().focus();
    await page.keyboard.press('End');
    await expect(tabs.last()).toBeFocused();
    await expect(tabs.last()).toHaveAttribute('aria-selected', 'true');
    await expect(about.getByRole('tabpanel')).toContainText('Comprendre avant de choisir');

    await page.keyboard.press('Home');
    await expect(tabs.first()).toBeFocused();
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
  });

  test('keeps all chapters readable when JavaScript is unavailable', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 900 } });
    const page = await context.newPage();
    await page.route('**/assets/js/about-story.js', (route) => route.abort());
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

    const chapters = page.locator('#about .about-story__chapter');
    await expect(chapters).toHaveCount(4);
    await expect(chapters.filter({ hasText: 'Qui nous sommes' })).toBeVisible();
    await expect(chapters.filter({ hasText: 'Pourquoi ce projet' })).toBeVisible();
    await expect(chapters.filter({ hasText: 'Trois regards sur l’IA' })).toBeVisible();
    await expect(chapters.filter({ hasText: 'Ce que nous voulons transmettre' })).toBeVisible();
    await context.close();
  });

  for (const width of [320, 390, 768, 960, 1440]) {
    test(`fits the about story within the viewport at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/index.html#about', { waitUntil: 'load' });

      const layout = await page.locator('#about').evaluate((about) => ({
        viewportWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        sectionWidth: about.getBoundingClientRect().width,
        chapterCount: about.querySelectorAll('.about-story__chapter').length
      }));

      expect(layout.scrollWidth).toBeLessThanOrEqual(layout.viewportWidth);
      expect(layout.sectionWidth).toBeGreaterThan(0);
      expect(layout.chapterCount).toBe(4);
    });
  }
});
