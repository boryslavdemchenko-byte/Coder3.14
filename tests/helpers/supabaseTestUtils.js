const { createClient } = require('@supabase/supabase-js')
const { createClient: createAdminClientFn } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Supabase env vars are required for tests: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY')
}

const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
const adminClient = createAdminClientFn(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function createTestUser(email, password = 'Password123!'){
  // Create user via admin API
  try{
    const { data, error } = await adminClient.auth.admin.createUser({ email, password, email_confirm: true })
    if (error) {
      // If user already exists, try to fetch user
      if (error.message && error.message.includes('User already registered')){
        // attempt to get user via admin
        const { data: u } = await adminClient.auth.admin.listUsers({ query: email })
        // find exact match
        const found = (u?.users || []).find(x => x.email === email)
        if (found) return found
        throw error
      }
      throw error
    }
    return data.user || data // backward compat
  }catch(err){
    throw new Error('createTestUser failed: ' + err.message)
  }
}

async function signInTestUser(email, password='Password123!'){
  const { data, error } = await anonClient.auth.signInWithPassword({ email, password })
  if (error) throw new Error('signIn failed: ' + error.message)
  return data
}

async function deleteTestUserById(id){
  try{
    const { error } = await adminClient.auth.admin.deleteUser(id)
    if (error) throw new Error('deleteUser failed: ' + error.message)
    return true
  }catch(err){
    // swallow
    console.warn('deleteTestUserById error', err.message)
  }
}

module.exports = { createTestUser, signInTestUser, deleteTestUserById }
