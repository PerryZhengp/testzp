import { expect, test } from '@playwright/test';

test.describe('Impossible Geometry MVP flow', () => {
  test('launch -> finish level1 -> refresh keeps unlock progress', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '开始旅程' }).click();
    await page.getByRole('button', { name: /第一关·初见回廊/i }).click();

    await page.evaluate(() => {
      window.__IMPOSSIBLE_GEOMETRY_DEBUG__?.completeCurrent();
    });

    await expect(page.getByText('关卡完成')).toBeVisible();
    await page.locator('.complete-overlay').getByRole('button', { name: '返回选关' }).click();

    await page.reload();
    await page.getByRole('button', { name: '开始旅程' }).click();
    await expect(page.getByRole('button', { name: /第二关·旋塔分岔/i })).toBeEnabled();
  });

  test('reset recovers playable state from stalled attempts', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.__IMPOSSIBLE_GEOMETRY_DEBUG__?.startLevel('chapter1-level2');
    });

    await page.getByRole('button', { name: '重置本关' }).first().click();
    await expect(page.getByText('本关已重置')).toBeVisible();
  });

  test('reducedMotion setting persists and level remains completable', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '系统设置' }).click();
    await page.getByLabel('低动态效果').check();
    await page.getByRole('button', { name: '完成' }).click();

    await page.getByRole('button', { name: '开始旅程' }).click();
    await page.getByRole('button', { name: /第一关·初见回廊/i }).click();

    const save = await page.evaluate(() => {
      window.__IMPOSSIBLE_GEOMETRY_DEBUG__?.completeCurrent();
      return window.__IMPOSSIBLE_GEOMETRY_DEBUG__?.getSave();
    });

    expect(save?.settings.reducedMotion).toBe(true);
    await expect(page.getByText('关卡完成')).toBeVisible();
  });
});
