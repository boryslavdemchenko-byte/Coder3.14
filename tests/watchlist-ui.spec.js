const { test, expect } = require('@playwright/test');
const { createTestUser, signInTestUser, deleteTestUserById } = require('./helpers/supabaseTestUtils')
const prisma = require('../../lib/prisma').default || require('../../lib/prisma')

// UI test: sign in, add item via API, visit /watchlist, verify item visible, remove it, verify empty state.

test.describe('Watchlist UI', ()=>{
  let testEmail, createdUser

  test.beforeEach(async ()=>{
    const id = Date.now()
    testEmail = `test+watchlistui+${id}@example.com`
    createdUser = await createTestUser(testEmail)
  })

  test.afterEach(async ()=>{
    if (createdUser?.id) await deleteTestUserById(createdUser.id)
    try{ await prisma.watchlistItem.deleteMany({ where: { user: { email: testEmail } } }) }catch(e){}
    try{ await prisma.title.deleteMany({ where: { title: { contains: 'UI Test' } } }) }catch(e){}
  })

  test('add via API and remove via UI', async ({ page, request }) => {
    // Sign in to get a session
    const { data } = await signInTestUser(testEmail)
    const accessToken = data.session.access_token

    // Add an item via API
    const tmdbId = Math.floor(Math.random()*1000000)+9000
    const addRes = await request.post('/api/watchlist', { headers: { Authorization: `Bearer ${accessToken}` }, data: { title: { tmdbId, title: 'UI Test Title', poster: '/assets/poster-placeholder.svg' } } })
    expect(addRes.ok()).toBeTruthy()

    // Prepare browser with session in localStorage so client recognizes auth
    await page.addInitScript(({ session }) => {
      // Write supabase session into localStorage so the client sees it
      localStorage.setItem('supabase.auth.token', JSON.stringify({ currentSession: session }));
    }, { session: data.session })

    // Visit watchlist page
    await page.goto('/watchlist')
    await page.waitForSelector('text=Your Watchlist')

    // Verify item visible
    await expect(page.locator('text=UI Test Title')).toBeVisible()

    // Remove via clicking the Added button
    const addedButton = page.locator('button:has-text("Added")')
    await expect(addedButton).toHaveCount(1)
    await addedButton.click()

    // Verify empty state
    await expect(page.locator('text=Your watchlist is empty.')).toBeVisible()
  })
})
