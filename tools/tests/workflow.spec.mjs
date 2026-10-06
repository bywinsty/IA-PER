import { expect, test } from '@playwright/test';

test.describe('homepage workflow story', () => {
  test('renders before À propos with four accessible steps and matching screens', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

    const workflow = page.locator('#workflow');
    await expect(workflow).toHaveCount(1);
    await expect(workflow.locator('h2')).toHaveText('One loop, from first message to shipped fix');
    await expect(workflow.evaluate((node) => node.compareDocumentPosition(document.querySelector('#about')) & Node.DOCUMENT_POSITION_FOLLOWING)).resolves.toBeTruthy();
    await expect(workflow.locator('.workflow-step')).toHaveCount(4);
    await expect(workflow.locator('.workflow-screen')).toHaveCount(4);
    await expect(workflow.locator('[role="tab"]')).toHaveCount(4);
  });

  test('switches the workflow stage from tabs and keeps ARIA state in sync', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

    const workflow = page.locator('#workflow');
    await expect(workflow.locator('[role="tab"][aria-selected="true"]')).toHaveText('Capture');
    await expect(workflow.locator('.workflow-screen.is-active')).toHaveAttribute('data-screen', '0');

    await workflow.getByRole('tab', { name: 'Prioritize' }).click();

    await expect(workflow.locator('[role="tab"][aria-selected="true"]')).toHaveText('Prioritize');
    await expect(workflow.locator('.workflow-step.is-active')).toHaveAttribute('data-step', '2');
    await expect(workflow.locator('.workflow-screen.is-active')).toHaveAttribute('data-screen', '2');
  });

  for (const width of [390, 768, 1440]) {
    test(`fits within the viewport at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/index.html', { waitUntil: 'load' });

      const layout = await page.locator('#workflow').evaluate((workflow) => ({
        viewportWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        workflowWidth: workflow.getBoundingClientRect().width,
        tabCount: workflow.querySelectorAll('[role="tab"]').length
      }));

      expect(layout.scrollWidth).toBeLessThanOrEqual(layout.viewportWidth);
      expect(layout.workflowWidth).toBeGreaterThan(0);
      expect(layout.tabCount).toBe(4);
    });
  }
});
