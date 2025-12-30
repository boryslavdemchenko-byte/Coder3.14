import '../styles/globals.css'
import Head from 'next/head'
import { useState } from 'react'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { createBrowserClient } from '../lib/supabaseClient'

export default function App({ Component, pageProps }){
  const [supabaseClient] = useState(() => createBrowserClient())

  // Automatically sync user to DB when a SIGNED_IN auth event occurs.
  // This sends the current access token to our secure server API which verifies
  // the token with Supabase admin client and upserts the user via Prisma.
  // This is safer than trusting client-only state and avoids manual sync steps.
  useState(() => {
    // register listener once
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.access_token) {
        // fire-and-forget POST to sync endpoint
        fetch('/api/sync-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
          body: JSON.stringify({})
        }).catch(err => console.error('Auto-sync failed', err))
      }

      // Also handle token refresh to keep user record synced
      if (event === 'TOKEN_REFRESHED' && session?.access_token) {
        fetch('/api/sync-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
          body: JSON.stringify({})
        }).catch(err => console.error('Auto-sync failed (refresh)', err))
      }
    })

    // Return cleanup to unsubscribe when unmounting
    return () => { subscription.unsubscribe() }
  })

  return (
    <>
      <Head>
        <title>StreamPlanner</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </Head>
      <SessionContextProvider supabaseClient={supabaseClient} initialSession={pageProps.initialSession}>
        <Component {...pageProps} />
      </SessionContextProvider>
    </>
  )
}
