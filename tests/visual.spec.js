const { test, expect } = require('@playwright/test');

const pages = ['/', '/recommendations', '/watchlist', '/title/1', '/donate', '/subscription-detail'];

for (const p of pages) {
  test(`visual: ${p}`, async ({ page }) => {
    await page.goto(p);
    await page.waitForLoadState('networkidle');
    const name = (p === '/' ? 'home' : p.replace(/\//g,'').replace(/[^a-z0-9\-]/gi,''))
    expect(await page.screenshot({ fullPage: true })).toMatchSnapshot(`${name}.png`);
  });
}
