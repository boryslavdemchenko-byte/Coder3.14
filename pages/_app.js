import '../styles/globals.css'
import Head from 'next/head'
import { useState, useEffect, createContext, useContext } from 'react'
import { createBrowserClient } from '../lib/supabaseClient'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const SessionContext = createContext(null)

export function useSupabaseClient() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSupabaseClient must be used within a SessionContextProvider')
  }
  return context.supabaseClient
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionContextProvider')
  }
  return context.session
}

export function useUser() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a SessionContextProvider')
  }
  return context.session?.user ?? null
}

export default function App({ Component, pageProps }){
  const [supabaseClient] = useState(() => createBrowserClient())
  const [session, setSession] = useState(null)

  useEffect(() => {
    document.body.classList.add(inter.variable, 'font-sans')

    // Initial session
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event, session) => {
      setSession(session)
      
      if (event === 'SIGNED_IN' && session?.access_token) {
        fetch('/api/sync-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
          body: JSON.stringify({})
        }).catch(err => console.error('Auto-sync failed', err))
      }

      if (event === 'TOKEN_REFRESHED' && session?.access_token) {
        fetch('/api/sync-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
          body: JSON.stringify({})
        }).catch(err => console.error('Auto-sync failed (refresh)', err))
      }
    })

    return () => { subscription.unsubscribe() }
  }, [supabaseClient])

  return (
    <>
      <Head>
        <title>Flico</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="icon" href="/assets/favicon-round.svg" />
      </Head>
      <SessionContext.Provider value={{ supabaseClient, session }}>
        <div className={`${inter.variable} font-sans`}>
          <Component {...pageProps} />
        </div>
      </SessionContext.Provider>
    </>
  )
}
