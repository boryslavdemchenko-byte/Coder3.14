import { useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import Link from 'next/link'
import Header from '../../components/Header'

export default function SignIn(){
  const supabase = useSupabaseClient()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const [sending, setSending] = useState(false)

  async function handleMagicLink(e){
    e.preventDefault()
    setStatus('')
    setSending(true)
    setStatus('Sending...')
    const { error } = await supabase.auth.signInWithOtp({ email })
    setSending(false)
    if (error) setStatus('Error: ' + error.message)
    else setStatus('Magic link sent — check your email')
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="px-6 py-8 max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-2">Sign in / Sign up</h2>
        <p className="small-muted mb-4">Enter your email and we’ll send a magic link to sign you in.</p>
        <form onSubmit={handleMagicLink} className="card" aria-labelledby="signin-heading">
          <label htmlFor="email" className="block mb-2">Email</label>
          <input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded px-3 py-2 mb-3" required aria-required="true" />
          <button aria-disabled={sending} disabled={sending} className="px-4 py-2 bg-accent text-white rounded" type="submit">{sending ? 'Sending…' : 'Send magic link'}</button>
        </form>
        {status && <div role="status" aria-live="polite" className="mt-4 small-muted">{status}</div>}
        <div className="mt-6 text-sm">
          <Link href="/">Back to Home</Link>
        </div>
      </main>
    </div>
  )
}
