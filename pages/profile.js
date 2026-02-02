import Header from '../components/Header'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useState } from 'react'

export default function Profile(){
  const user = useUser()
  const supabase = useSupabaseClient()
  const [message, setMessage] = useState('')
  const [dbUser, setDbUser] = useState(null)

  // Fetch server-side user (which includes syncedAt) when component mounts and when session changes
  async function fetchDbUser(){
    const { data: { session } } = await supabase.auth.getSession()
    const accessToken = session?.access_token
    if (!accessToken) return
    try{
      const res = await fetch('/api/me', { headers: { Authorization: `Bearer ${accessToken}` } })
      if (res.ok) {
        const json = await res.json()
        setDbUser(json.user)
      }
    }catch(err){ console.warn('Failed to fetch DB user', err) }
  }

  // run once on mount
  useState(()=>{ fetchDbUser() })


  if (!user) {
    // client-side redirect to login for unauthenticated users
    if (typeof window !== 'undefined') window.location.replace('/auth/login')
    return (
      <div className="min-h-screen"><Header /><main className="px-6 py-8 max-w-6xl mx-auto">Redirecting to sign in…</main></div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="px-6 py-8 max-w-6xl mx-auto">
        <h2 className="text-xl font-bold mb-2">Profile</h2>
        <div className="card">
          <div><strong>Email:</strong> {user.email}</div>
          <div><strong>ID:</strong> {user.id}</div>
          <div className="mt-4">
            <small className="small-muted">{dbUser?.syncedAt ? `Last synced: ${new Date(dbUser.syncedAt).toLocaleString()}` : 'Not yet synced'}</small>
          </div>
          {message && <div className="mt-3 small-muted">{message}</div>}
        </div>
      </main>
    </div>
  )
}
