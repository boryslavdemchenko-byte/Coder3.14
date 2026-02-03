const { test, expect } = require('@playwright/test');
const axeCore = require('axe-core');
const fs = require('fs');
const path = require('path');
const { createTestUser, signInTestUser, deleteTestUserById } = require('./helpers/supabaseTestUtils')
const prisma = require('../lib/prisma').default || require('../lib/prisma')

// Accessibility test for /watchlist page
// - creates a test user
// - signs in and injects session into browser
// - navigates to /watchlist and runs axe
// - asserts zero critical or serious violations

const outDir = path.join(process.cwd(), 'scripts', 'output')
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

test.describe('Watchlist accessibility', ()=>{
  let testEmail, createdUser

  test.beforeEach(async ()=>{
    const id = Date.now()
    testEmail = `test+watchlist-a11y+${id}@example.com`
    createdUser = await createTestUser(testEmail)
    // ensure no leftover rows
    await prisma.watchlistItem.deleteMany({ where: { user: { email: testEmail } } }).catch(()=>{})
  })

  test.afterEach(async ()=>{
    if (createdUser?.id) await deleteTestUserById(createdUser.id)
    try{ await prisma.watchlistItem.deleteMany({ where: { user: { email: testEmail } } }) }catch(e){}
    try{ await prisma.title.deleteMany({ where: { title: { contains: 'A11Y Test' } } }) }catch(e){}
  })

  test('no critical or serious axe violations on /watchlist', async ({ page, request }) => {
    // create a title and add via API so the watchlist is not empty
    const tmdbId = Math.floor(Math.random()*1000000)+8000
    const addTitle = { tmdbId, title: 'A11Y Test Title', poster: '/assets/poster-placeholder.svg' }

    const { data } = await signInTestUser(testEmail)
    const accessToken = data.session.access_token

    const addRes = await request.post('/api/watchlist', { headers: { Authorization: `Bearer ${accessToken}` }, data: { title: addTitle } })
    expect(addRes.ok()).toBeTruthy()

    // Inject session into browser localStorage so client recognizes signed-in state
    await page.addInitScript(({ session }) => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({ currentSession: session }));
    }, { session: data.session })

    await page.goto('/watchlist')
    await page.waitForSelector('text=Your Watchlist')

    // Inject axe and run audit
    await page.addScriptTag({ content: axeCore.source })
    const results = await page.evaluate(async () => await axe.run())

    // write results for debugging
    fs.writeFileSync(path.join(outDir,'watchlist-axe.json'), JSON.stringify(results, null, 2))

    const serious = (results.violations || []).filter(v => v.impact === 'critical' || v.impact === 'serious')
    if (serious.length > 0) {
      console.error('Accessibility violations (critical/serious):')
      for (const v of serious) console.error(`- ${v.id}: impact=${v.impact} nodes=${v.nodes.length}`)
    }

    expect(serious.length, `No critical/serious axe violations; see scripts/output/watchlist-axe.json for full report`).toBe(0)
  })
})
