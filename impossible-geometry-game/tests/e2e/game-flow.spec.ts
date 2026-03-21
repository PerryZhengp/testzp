import { expect, test } from '@playwright/test';

test.describe('Impossible Geometry MVP flow', () => {
  test('launch -> finish level1 -> refresh keeps unlock progress', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Start Journey' }).click();
    await page.getByRole('button', { name: /L1 · First Steps/i }).click();

    await page.evaluate(() => {
      window.__IMPOSSIBLE_GEOMETRY_DEBUG__?.completeCurrent();
    });

    await expect(page.getByText('Level Completed')).toBeVisible();
    await page.getByRole('button', { name: 'Level Select' }).click();

    await page.reload();
    await page.getByRole('button', { name: 'Start Journey' }).click();
    await expect(page.getByRole('button', { name: /L2 · Turning Tower/i })).toBeEnabled();
  });

  test('reset recovers playable state from stalled attempts', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.__IMPOSSIBLE_GEOMETRY_DEBUG__?.startLevel('chapter1-level2');
    });

    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(page.getByText('Level reset')).toBeVisible();
  });

  test('reducedMotion setting persists and level remains completable', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Settings' }).click();
    await page.getByLabel('Reduced Motion').check();
    await page.getByRole('button', { name: 'Close' }).click();

    await page.getByRole('button', { name: 'Start Journey' }).click();
    await page.getByRole('button', { name: /L1 · First Steps/i }).click();

    const save = await page.evaluate(() => {
      window.__IMPOSSIBLE_GEOMETRY_DEBUG__?.completeCurrent();
      return window.__IMPOSSIBLE_GEOMETRY_DEBUG__?.getSave();
    });

    expect(save?.settings.reducedMotion).toBe(true);
    await expect(page.getByText('Level Completed')).toBeVisible();
  });
});
