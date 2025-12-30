const { test, expect } = require('@playwright/test');
const { createTestUser, signInTestUser, deleteTestUserById } = require('./helpers/supabaseTestUtils')
const prisma = require('../../lib/prisma').default || require('../../lib/prisma')

// UI test: sign in, visit /title/1, add to watchlist, verify button and DB, remove and verify removal

test.describe('Title page watchlist UI', ()=>{
  let testEmail, createdUser

  test.beforeEach(async ()=>{
    const id = Date.now()
    testEmail = `test+titleui+${id}@example.com`
    createdUser = await createTestUser(testEmail)
  })

  test.afterEach(async ()=>{
    if (createdUser?.id) await deleteTestUserById(createdUser.id)
    try{ await prisma.watchlistItem.deleteMany({ where: { user: { email: testEmail } } }) }catch(e){}
    try{ await prisma.title.deleteMany({ where: { title: { contains: 'UI Test' } } }) }catch(e){}
  })

  test('add/remove from title page', async ({ page, request }) => {
    // Sign in
    const { data } = await signInTestUser(testEmail)
    const accessToken = data.session.access_token

    // Inject session into localStorage before navigating
    await page.addInitScript(({ session }) => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({ currentSession: session }));
    }, { session: data.session })

    // Visit title 1 (exists in mapping)
    await page.goto('/title/1')
    await page.waitForSelector('text=Add to Watchlist')

    // Click Add
    const addButton = page.locator('button:has-text("Add to Watchlist")')
    await addButton.click()
    await expect(page.locator('button:has-text("Added")')).toBeVisible()

    // Confirm DB entry
    const dbItem = await prisma.watchlistItem.findFirst({ where: { user: { id: createdUser.id }, title: { tmdbId: 1 } }, include: { title: true } })
    expect(dbItem).toBeTruthy()

    // Click to remove
    const addedBtn = page.locator('button:has-text("Added")')
    await addedBtn.click()
    await expect(page.locator('button:has-text("Add to Watchlist")')).toBeVisible()

    const dbItemAfter = await prisma.watchlistItem.findFirst({ where: { user: { id: createdUser.id }, title: { tmdbId: 1 } } })
    expect(dbItemAfter).toBeNull()
  })
})
