import { test, expect } from '@playwright/test';

test('hero credit links to the team and mirrors its member cards', async ({ page }) => {
  await page.goto('/index.html');

  const credit = page.locator('#hero .hero-cadence__proof-label');
  const members = page.locator('#team .team-member');
  const faces = page.locator('#hero .hero-cadence__faces img');

  await expect(credit).toHaveAttribute('href', '#team');
  await expect(faces).toHaveCount(await members.count());
  await expect.poll(() => faces.evaluateAll(images => images.map(image => image.getAttribute('src'))))
    .toEqual(await members.locator('.pic img').evaluateAll(images => images.map(image => image.getAttribute('src'))));

  await members.nth(1).evaluate(card => card.remove());

  await expect(faces).toHaveCount(await members.count());
  await expect.poll(() => faces.evaluateAll(images => images.map(image => image.getAttribute('src'))))
    .toEqual(await members.locator('.pic img').evaluateAll(images => images.map(image => image.getAttribute('src'))));
});
