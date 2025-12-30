const { test, expect } = require('@playwright/test')
const { injectAxe, checkA11y } = require('./helpers/a11y')
const { createTestUser, signInTestUser, deleteTestUserById } = require('./helpers/supabaseTestUtils')

const fs = require('fs')
const path = require('path')
const outDir = path.join(process.cwd(), 'scripts', 'output')
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

let createdUser

test.describe('@title-a11y Title page accessibility', ()=>{
  test.beforeEach(async ({ page, context }) => {
    const id = Date.now()
    const testEmail = `test+title-a11y+${id}@example.com`
    createdUser = await createTestUser(testEmail)
    // sign in
    const { data } = await signInTestUser(testEmail)
    const accessToken = data.session.access_token
    await context.addCookies([{ name: 'sb:token', value: accessToken, domain: 'localhost' , path: '/' }])
  })

  test('has no detectable a11y violations on /title/1', async ({ page }) => {
    await page.goto('http://localhost:3000/title/1')
    await injectAxe(page)
    const results = await checkA11y(page)

    // write out results for debugging in CI
    fs.writeFileSync(path.join(outDir,'title-axe.json'), JSON.stringify(results, null, 2))

    expect(results.violations.length, `See scripts/output/title-axe.json for full report`).toBe(0)
  })

  test.afterEach(async ()=>{
    if (createdUser?.id) await deleteTestUserById(createdUser.id)
  })
})
