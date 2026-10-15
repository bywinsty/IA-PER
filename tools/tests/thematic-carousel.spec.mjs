import { expect, test } from '@playwright/test';

const topics = [
  {
    title: 'Environnement',
    description: 'Énergie, eau, ressources : regarder le coût invisible de chaque usage.',
    href: 'thématiques/environnement.html'
  },
  {
    title: 'Professionnel',
    description: 'Gagner du temps, faire évoluer les métiers et garder le contrôle humain.',
    href: 'thématiques/professionnel.html'
  },
  {
    title: 'Société',
    description: 'Information, vie privée et décisions : questionner nos usages quotidiens.',
    href: 'thématiques/societe.html'
  }
];

async function openCarousel(page, width = 1280, reducedMotion = 'no-preference') {
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ reducedMotion });
  await page.goto('/pages/thematiques.html#themes', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.thematic-carousel')).toBeVisible();
}

test('thematics carousel preserves topic order, copy, links, and starts on Professionnel', async ({ page }) => {
  await openCarousel(page, 1280, 'reduce');

  const cards = page.locator('.orbit-card');
  await expect(cards).toHaveCount(3);

  for (const [index, topic] of topics.entries()) {
    const card = cards.nth(index);
    await expect(card.getByRole('heading', { name: topic.title })).toBeVisible();
    await expect(card.locator('p')).toHaveText(topic.description);
    await expect(card.getByRole('link', { name: 'Découvrir la thématique' })).toHaveAttribute('href', topic.href);
  }

  await expect(cards.nth(1)).toHaveAttribute('aria-current', 'true');
  await expect(page.locator('.carousel-topics')).toHaveCount(0);
  await expect(page.locator('.survey-invitation')).toHaveCount(1);
  await expect(page.locator('#faq')).toHaveCount(1);
});

test('manual controls change the active topic and keep rotation paused until explicitly resumed', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await openCarousel(page);

  await page.getByRole('button', { name: 'Suivante' }).click();
  await expect(page.locator('.orbit-card[aria-current="true"] h3')).toHaveText('Société');
  await expect(page.getByRole('button', { name: 'Reprendre la rotation automatique' })).toBeVisible();

  await page.clock.runFor(10_500);
  await expect(page.locator('.orbit-card[aria-current="true"] h3')).toHaveText('Société');

  await page.getByRole('button', { name: 'Précédente' }).click();
  await expect(page.locator('.orbit-card[aria-current="true"] h3')).toHaveText('Professionnel');
  await expect(page.locator('#carousel-status')).toHaveAttribute('aria-live', 'polite');

  await page.getByRole('button', { name: 'Reprendre la rotation automatique' }).click();
  await expect(page.getByRole('button', { name: 'Mettre en pause la rotation automatique' })).toBeVisible();
  await page.clock.runFor(5_200);
  await expect(page.locator('.orbit-card[aria-current="true"] h3')).toHaveText('Société');
});

test('hover and keyboard focus pause rotation without automatically restarting it', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await openCarousel(page);

  await page.locator('.thematic-carousel').hover();
  await page.clock.runFor(5_200);
  await expect(page.locator('.orbit-card[aria-current="true"] h3')).toHaveText('Professionnel');

  await page.locator('.carousel-next').focus();
  await page.locator('body').hover({ position: { x: 1, y: 1 } });
  await page.clock.runFor(5_200);
  await expect(page.locator('.orbit-card[aria-current="true"] h3')).toHaveText('Professionnel');
  await expect(page.locator('#carousel-status')).toHaveAttribute('aria-live', 'polite');
});

test('reduced motion starts paused and changing the preference pauses an active carousel', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await openCarousel(page, 1280, 'reduce');

  await expect(page.getByRole('button', { name: 'Reprendre la rotation automatique' })).toBeVisible();
  await page.clock.runFor(10_500);
  await expect(page.locator('.orbit-card[aria-current="true"] h3')).toHaveText('Professionnel');

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.getByRole('button', { name: 'Reprendre la rotation automatique' }).click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.getByRole('button', { name: 'Reprendre la rotation automatique' })).toBeVisible();
  await page.clock.runFor(5_200);
  await expect(page.locator('.orbit-card[aria-current="true"] h3')).toHaveText('Professionnel');
});

for (const width of [320, 390, 768, 1280, 1440]) {
  test(`thematics carousel fits the viewport and exposes its controls at ${width}px`, async ({ page }) => {
    await openCarousel(page, width, 'reduce');

    const layout = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      activeCardWidth: document.querySelector('.orbit-card[aria-current="true"]')?.getBoundingClientRect().width ?? 0,
      inactiveDisplay: getComputedStyle(document.querySelector('.orbit-card:not([aria-current="true"])')).display,
      stageRect: document.querySelector('.orbit-stage').getBoundingClientRect().toJSON(),
      orbitArtTop: document.querySelector('.orbit-card[aria-current="true"] .orbit-art').getBoundingClientRect().top,
      orbitRingOffset: Number.parseFloat(getComputedStyle(document.querySelector('.orbit-art'), '::before').top),
      controlsTop: document.querySelector('.carousel-controls').getBoundingClientRect().top,
      previousCenter: document.querySelector('.carousel-previous').getBoundingClientRect().left
        + document.querySelector('.carousel-previous').getBoundingClientRect().width / 2,
      rotationCenter: document.querySelector('.carousel-rotation').getBoundingClientRect().left
        + document.querySelector('.carousel-rotation').getBoundingClientRect().width / 2,
      nextCenter: document.querySelector('.carousel-next').getBoundingClientRect().left
        + document.querySelector('.carousel-next').getBoundingClientRect().width / 2
    }));

    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.viewportWidth);
    expect(layout.activeCardWidth).toBeGreaterThan(0);
    // The ring and its outer glow must not be clipped by the stage's overflow.
    expect(layout.orbitArtTop + layout.orbitRingOffset - 36).toBeGreaterThanOrEqual(layout.stageRect.top - 1);
    await expect(page.getByRole('button', { name: 'Précédente' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Suivante' })).toBeVisible();
    expect(layout.controlsTop).toBeGreaterThanOrEqual(layout.stageRect.bottom);
    expect(layout.previousCenter).toBeLessThan(layout.rotationCenter);
    expect(layout.rotationCenter).toBeLessThan(layout.nextCenter);
    await expect(page.locator('.carousel-topics')).toHaveCount(0);

    if (width < 768) expect(layout.inactiveDisplay).toBe('none');
    else expect(layout.inactiveDisplay).not.toBe('none');
  });
}
