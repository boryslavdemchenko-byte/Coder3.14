import Link from 'next/link'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'

export default function Header(){
  const user = useUser()
  const supabase = useSupabaseClient()

  async function signOut(){
    await supabase.auth.signOut()
    // client will update via SessionContextProvider
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-transparent">
      <div className="flex items-center gap-3">
        <div className="text-xl font-bold" style={{color:'var(--accent)'}}>StreamPlanner</div>
        <div className="small-muted">Classic Monochrome</div>
      </div>
      <nav className="flex items-center gap-4">
        <Link href="/" className="small-muted">Home</Link>
        <Link href="/recommendations" className="small-muted">Recommendations</Link>
        <Link href="/watchlist" className="small-muted">Watchlist</Link>
        <Link href="/donate" className="small-muted">Donate</Link>
        {user ? (
          <>
            <Link href="/profile" className="small-muted">{user.email}</Link>
            <button onClick={signOut} className="small-muted">Sign out</button>
          </>
        ) : (
          <Link href="/auth/signin" className="small-muted">Sign in</Link>
        )}
      </nav>
    </header>
  )
}
