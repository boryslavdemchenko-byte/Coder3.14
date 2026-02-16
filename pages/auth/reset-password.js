import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import BackButton from '../../components/BackButton'
import { useSupabaseClient } from '../../pages/_app'

export default function ResetPassword(){
  const supabase = useSupabaseClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [touched, setTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState(null)

  const validateEmailFormat = useCallback((value) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(String(value).toLowerCase())
  }, [])

  useEffect(() => {
    if (!touched) return
    const err = email ? (validateEmailFormat(email) ? '' : 'Invalid email format') : 'Email is required'
    setEmailError(err)
  }, [email, touched, validateEmailFormat])

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

  async function handleSubmit(e){
    e.preventDefault()
    setTouched(true)
    setNotice(null)

    const trimmedEmail = email.trim()
    const err = trimmedEmail ? (validateEmailFormat(trimmedEmail) ? '' : 'Invalid email format') : 'Email is required'
    setEmailError(err)
    if (err) return

    setLoading(true)
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      const redirectTo = `${siteUrl}/auth/callback?next=/auth/update-password`
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, { redirectTo })
      if (error) throw error

      setNotice({
        type: 'success',
        text: 'Password reset email sent. Check your inbox (and spam folder).'
      })
      setTimeout(() => router.replace('/auth/login'), 4000)
    } catch (err) {
      const message = err?.message || 'Could not send reset email. Please try again.'
      if (message.toLowerCase().includes('error sending recovery email')) {
        setNotice({
          type: 'error',
          text: 'Supabase failed to send the recovery email. This is usually SMTP/deliverability or a rate limit issue. Configure SMTP in Supabase Auth settings and check Auth logs.'
        })
        return
      }
      setNotice({ type: 'error', text: message })
    } finally {
      setLoading(false)
    }
  }

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
              <h1 className="text-2xl font-bold text-white mb-2">Reset your password</h1>
              <p className="text-gray-400 text-sm">Enter your email and we’ll send a reset link.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400 ml-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched(true)}
                  autoComplete="email"
                  className={`w-full bg-black/40 border ${touched && emailError ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-blue-500/50'} rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
                  placeholder="you@example.com"
                />
                {touched && emailError && (
                  <p className="text-xs text-red-400 ml-1 animate-in slide-in-from-top-1">{emailError}</p>
                )}
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
                  {loading ? 'Sending...' : 'Send reset link'}
                </span>
              </button>
            </form>

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
