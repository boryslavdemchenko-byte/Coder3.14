// lib/supabaseClient.js — helpers to create Supabase clients
import { createBrowserClient as createBrowserClientSSR } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export function createBrowserClient(){
  return createBrowserClientSSR(SUPABASE_URL, SUPABASE_ANON_KEY)
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export function createAdminClient(){
  if (!SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_URL) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL in env')
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
}
