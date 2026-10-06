import { expect, test } from '@playwright/test';

test('404 page gives a clear heading, useful recovery links, and a non-empty description', async ({ page }) => {
  await page.goto('/pages/404.html', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('main h1')).toHaveCount(1);
  await expect(page.locator('main h1')).toHaveText(/page introuvable/i);
  await expect(page.locator('meta[name="description"]')).not.toHaveAttribute('content', '');
  await expect(page.getByRole('link', { name: 'Retour à l’accueil' })).toHaveAttribute('href', '../index.html');
  await expect(page.getByRole('link', { name: 'Parcourir les thématiques' })).toHaveAttribute('href', 'thématiques/thematiques.html#themes');
  await expect(page.locator('.search-form')).toHaveCount(0);

  const headingLevels = await page.locator('h1, h2, h3, h4, h5, h6').evaluateAll((headings) =>
    headings.map((heading) => Number(heading.tagName.slice(1)))
  );
  expect(headingLevels).toEqual([1, 2, 2]);
});

test('thematics index does not publish the removed sources placeholder', async ({ page }) => {
  await page.goto('/pages/thématiques/thematiques.html', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('#sources')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText('Sources et références');
});

for (const path of [
  '/pages/thématiques/environnement.html',
  '/pages/thématiques/professionnel.html',
  '/pages/thématiques/societe.html'
]) {
  test(`${path} does not publish template testimonial content`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('#testimonials')).toHaveCount(0);
    await expect(page.locator('link[href*="swiper"], script[src*="swiper"]')).toHaveCount(0);
    await expect(page.getByText(/Saul Goodman|Sara Wilsson|Jena Karlis|Matt Brandon|John Larson/)).toHaveCount(0);
    await expect(page.getByText(/Reprendre les phrases pertinents/i)).toHaveCount(0);
  });
}
