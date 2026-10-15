import { expect, test } from '@playwright/test';

const surveyPage = '/pages/sondage.html';

test('combined survey page presents results before the questionnaire', async ({ page }) => {
  await page.goto(surveyPage, { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ce que vos réponses nous apprennent');
  await expect(page.locator('.result-chart')).toHaveCount(21);
  await expect(page.locator('#sondage')).toContainText('Le sondage continue');
  await expect(page.locator('.results-method .results-survey-link')).toHaveAttribute('href', '#sondage');
  await expect(page.locator('#sondage iframe')).toHaveAttribute('title', 'Formulaire IA-PER — Sondage');
  await expect(page.locator('#sondage a[href*="docs.google.com/forms"]')).toHaveCount(1);

  const order = await page.evaluate(() => {
    const main = document.querySelector('main');
    return ['.results-intro', '.results-actions', '#resultats', '#sondage']
      .map(selector => [...main.querySelectorAll(selector)][0]?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY);
  });
  expect(order[0]).toBeLessThan(order[1]);
  expect(order[1]).toBeLessThan(order[2]);
  expect(order[2]).toBeLessThan(order[3]);
});

test('intro has no navigation buttons and remaining survey link reaches the form below the fixed header', async ({ page }) => {
  await page.goto(surveyPage, { waitUntil: 'domcontentloaded' });

  await expect(page.locator('.results-intro .survey-page-nav')).toHaveCount(0);

  const surveyLink = page.locator('.results-method').getByRole('link', { name: /Répondre au sondage/ });
  await surveyLink.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#sondage$/);
  const position = await page.evaluate(() => ({
    top: document.querySelector('#sondage').getBoundingClientRect().top,
    headerBottom: document.querySelector('#header').getBoundingClientRect().bottom
  }));
  expect(position.top).toBeGreaterThanOrEqual(position.headerBottom);
});

test('results data failure still leaves the questionnaire reachable', async ({ page }) => {
  await page.route('**/assets/data/survey-results.json', route => route.abort());
  await page.goto(surveyPage, { waitUntil: 'domcontentloaded' });

  await expect(page.locator('.results-error')).toBeVisible();
  await expect(page.locator('#sondage iframe')).toHaveAttribute('title', 'Formulaire IA-PER — Sondage');
  await expect(page.locator('#sondage a[href*="docs.google.com/forms"]')).toBeVisible();
});

test('combined page and thematic links reflow on a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(surveyPage, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#sondage iframe')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  await page.goto('/pages/thematiques.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.survey-invitation__actions a')).toHaveCount(1);
  await expect(page.getByRole('link', { name: /Découvrir le sondage/ })).toHaveAttribute('href', 'sondage.html');
  await expect(page.locator('.survey-invitation')).toContainText('Consultez les résultats');
  await expect(page.locator('.survey-invitation')).toContainText('partagez votre regard');
});
