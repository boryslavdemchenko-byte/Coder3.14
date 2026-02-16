import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import BackButton from '../../components/BackButton'
import { useSession, useSupabaseClient } from '../../pages/_app'

export default function UpdatePassword(){
  const supabase = useSupabaseClient()
  const session = useSession()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState(null)
  const [ready, setReady] = useState(false)
  const [sessionExists, setSessionExists] = useState(false)

  useEffect(() => {
    if (!router.isReady) return
    const { error, message } = router.query
    if (typeof error === 'string' && error.length > 0) {
      setNotice({ type: 'error', text: decodeURIComponent(error) })
    }
    if (typeof message === 'string' && message.length > 0) {
      setNotice({ type: 'success', text: decodeURIComponent(message) })
    }
  }, [router.isReady, router.query])

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setReady(true)
      const has = !!data?.session
      setSessionExists(has)
      if (!has) router.replace('/auth/login')
    })
    return () => { mounted = false }
  }, [router, supabase])

  async function handleSubmit(e){
    e.preventDefault()
    setNotice(null)

    if (password.length < 6) {
      setNotice({ type: 'error', text: 'Password must be at least 6 characters.' })
      return
    }
    if (password !== confirmPassword) {
      setNotice({ type: 'error', text: 'Passwords do not match.' })
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setNotice({ type: 'success', text: 'Password updated successfully. Redirecting…' })
      setTimeout(() => router.replace('/settings'), 1500)
    } catch (err) {
      setNotice({ type: 'error', text: err?.message || 'Could not update password. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const hasSession = sessionExists || !!session

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0a0a0a] to-black text-white flex flex-col font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/assets/noise.png')] opacity-[0.03] pointer-events-none"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow delay-1000"></div>

      <div className="absolute top-6 left-6 z-20">
        <BackButton />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-[420px] mx-auto animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">Set a new password</h1>
              <p className="text-gray-400 text-sm">Choose a strong password you’ll remember.</p>
            </div>

            {!ready ? (
              <div className="text-center text-sm text-gray-400">Loading…</div>
            ) : !hasSession ? (
              <div className="text-center text-sm text-gray-400">
                Session not found. Please restart the reset flow.
                <div className="mt-4">
                  <Link href="/auth/reset-password" className="text-blue-400 hover:text-blue-300 transition-colors hover:underline">Send a new reset email</Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400 ml-1">New password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    minLength={6}
                    className="w-full bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400 ml-1">Confirm new password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    minLength={6}
                    className="w-full bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="••••••••"
                  />
                </div>

                {notice?.text && (
                  <div className={`p-3 rounded-xl text-sm text-center animate-in fade-in slide-in-from-top-2 ${notice.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {notice.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? 'Updating…' : 'Update password'}
                  </span>
                </button>
              </form>
            )}

            <div className="text-center mt-8">
              <Link href="/auth/login" className="text-sm text-blue-400 hover:text-blue-300 transition-colors hover:underline">
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
