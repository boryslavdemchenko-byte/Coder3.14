const { test, expect } = require('@playwright/test')

test('privacy policy has toc anchors and pdf download', async ({ page, request }) => {
  await page.goto('/privacy')
  await expect(page.locator('h1', { hasText: 'Privacy Policy' })).toBeVisible()

  const tocLink = page.locator('a[href="#information-we-collect"]').first()
  await expect(tocLink).toBeVisible()
  await tocLink.click()
  await expect(page).toHaveURL(/#information-we-collect$/)
  await expect(page.locator('#information-we-collect')).toBeVisible()

  const pdf = await request.get('/api/policy-pdf?doc=privacy')
  expect(pdf.ok()).toBeTruthy()
  expect(pdf.headers()['content-type']).toContain('application/pdf')
})

test('cookie policy opens cookie preferences modal', async ({ page }) => {
  await page.goto('/cookies')
  await expect(page.locator('h1', { hasText: 'Cookie Policy' })).toBeVisible()
  await page.getByRole('button', { name: 'Open cookie settings' }).click()
  await expect(page.getByText('Cookie Preferences')).toBeVisible()
})
