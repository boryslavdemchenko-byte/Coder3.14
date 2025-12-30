const { test, expect } = require('@playwright/test');
const { createTestUser, signInTestUser, deleteTestUserById } = require('./helpers/supabaseTestUtils')
const prisma = require('../../lib/prisma').default || require('../../lib/prisma')

// This test will:
// 1) Create a new supabase test user via admin
// 2) Sign in to obtain a session (access_token)
// 3) Simulate the client auto-sync by POSTing to /api/sync-user with the access token
// 4) Assert that the user appears in the Postgres DB with syncedAt set
// 5) Assert /api/me returns the user with syncedAt
// 6) Clean up the test user

test.describe('Auth -> auto-sync', ()=>{
  let testEmail
  let createdUser

  test.beforeEach(async ()=>{
    const id = Date.now()
    testEmail = `test+authsync+${id}@example.com`
    createdUser = await createTestUser(testEmail)
  })

  test.afterEach(async ()=>{
    if (createdUser?.id) await deleteTestUserById(createdUser.id)
    // cleanup DB record if created
    try{ await prisma.user.deleteMany({ where: { email: testEmail } }) }catch(e){}
  })

  test('user is upserted & /api/me returns syncedAt', async ({ request, page }) => {
    // Sign in to get a session
    const { data } = await signInTestUser(testEmail)
    const session = data.session
    expect(session).toBeTruthy()
    const accessToken = session.access_token
    expect(accessToken).toBeTruthy()

    // Simulate client auto-sync by POSTing to /api/sync-user with token
    const res = await request.post('/api/sync-user', { headers: { Authorization: `Bearer ${accessToken}` } })
    expect(res.ok()).toBeTruthy()
    const json = await res.json()
    expect(json.ok).toBeTruthy()
    expect(json.user).toBeTruthy()

    // Wait a moment for DB write (should be immediate)
    await new Promise(r => setTimeout(r, 300))

    // Check DB via Prisma
    const dbUser = await prisma.user.findUnique({ where: { id: json.user.id } })
    expect(dbUser).toBeTruthy()
    expect(dbUser.syncedAt).toBeTruthy()

    // Call /api/me with the same token and expect syncedAt present
    const me = await request.get('/api/me', { headers: { Authorization: `Bearer ${accessToken}` } })
    expect(me.ok()).toBeTruthy()
    const meJson = await me.json()
    expect(meJson.user).toBeTruthy()
    expect(meJson.user.syncedAt).toBeTruthy()
  })
})
