import { expect, test } from '@playwright/test';

const thematicPages = ['environnement', 'professionnel', 'societe'];
const viewports = [1440, 390, 320];

for (const width of viewports) {
  test(`thematic introductions clear and align below the header at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });

    const titleTops = [];
    for (const slug of thematicPages) {
      await page.goto(`/pages/thématiques/${slug}.html`, { waitUntil: 'load' });

      const layout = await page.evaluate(() => {
        const header = document.querySelector('#header');
        const title = document.querySelector('#thematic-title');
        const image = document.querySelector('#thematic-content img');
        const headerBottom = header?.getBoundingClientRect().bottom ?? 0;
        return {
          headerHeight: Math.ceil(header?.getBoundingClientRect().height ?? 0),
          measuredHeaderHeight: Number.parseInt(
            getComputedStyle(document.documentElement).getPropertyValue('--header-height'),
            10
          ),
          titleTop: title?.getBoundingClientRect().top ?? 0,
          titleClearance: (title?.getBoundingClientRect().top ?? 0) - headerBottom,
          imageClearance: (image?.getBoundingClientRect().top ?? 0) - headerBottom,
          scrollWidth: document.documentElement.scrollWidth,
          viewportWidth: window.innerWidth
        };
      });

      expect(layout.measuredHeaderHeight).toBe(layout.headerHeight);
      expect(layout.titleClearance).toBeGreaterThanOrEqual(16);
      expect(layout.imageClearance).toBeGreaterThanOrEqual(16);
      expect(layout.scrollWidth).toBeLessThanOrEqual(layout.viewportWidth);
      titleTops.push(layout.titleTop);
    }

    expect(Math.max(...titleTops) - Math.min(...titleTops)).toBeLessThanOrEqual(2);
  });
}
