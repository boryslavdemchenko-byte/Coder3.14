import { useState, useEffect, useCallback } from 'react'
import { useSupabaseClient } from '../../pages/_app'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '../../components/Layout'
import BackButton from '../../components/BackButton'

export default function Login(){
  const supabase = useSupabaseClient()
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [isResend, setIsResend] = useState(false)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState(null)
  const [devConfirmLoading, setDevConfirmLoading] = useState(false)
  const [usernameError, setUsernameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordFeedback, setPasswordFeedback] = useState('')
  const [canSubmit, setCanSubmit] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [is2FA, setIs2FA] = useState(false)
  const [mfaCode, setMfaCode] = useState('')
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false
  })

  useEffect(() => {
    if (router.query.signup === 'true') {
      setIsSignUp(true)
      setIsResend(false)
    }
  }, [router.query])

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

  const validateEmailFormat = useCallback((value) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(String(value).toLowerCase())
  }, [])

  const validateUsername = useCallback((value) => {
    if (!isSignUp || isResend) return ''
    const re = /^[A-Za-z0-9_]{3,20}$/
    if (!value) return ''
    if (value.length < 3) return 'Username must be at least 3 characters'
    if (value.length > 20) return 'Username must be at most 20 characters'
    if (!re.test(value)) return 'Use letters, numbers, and underscores only'
    return ''
  }, [isSignUp])

  const getPasswordFeedback = useCallback((value) => {
    if (!value) return ''
    return value.length >= 6 ? '' : 'Password must be at least 6 characters'
  }, [])

  function formatAuthError(error){
    const message = (error?.message || '').toLowerCase()
    if (message.includes('user already registered') || message.includes('already')) {
      return 'Email already in use. Try signing in instead.'
    }
    if (message.includes('password') && (message.includes('6') || message.includes('weak') || message.includes('short'))) {
      return 'Weak password. Use at least 6 characters.'
    }
    if (error?.status === 429 || message.includes('rate limit')) {
      return 'Too many attempts. Please wait a moment and try again.'
    }
    return error?.message || 'Authentication failed. Please try again.'
  }

  useEffect(()=>{
    const uErr = validateUsername(username)
    setUsernameError(uErr)
    const eErr = email ? (validateEmailFormat(email) ? '' : 'Invalid email format') : 'Email is required'
    setEmailError(eErr)
    const pFeed = getPasswordFeedback(password)
    setPasswordFeedback(pFeed)
    const signUpValid = !uErr && !eErr && !pFeed
    const signInValid = !eErr && password.length >= 6
    const resendValid = !eErr
    setCanSubmit(isResend ? resendValid : (isSignUp ? signUpValid : signInValid))
  },[isSignUp, isResend, username, email, password, validateUsername, validateEmailFormat, getPasswordFeedback])

  async function handleSubmit(e){
    e.preventDefault()
    setNotice(null)
    
    setLoading(true)
    
    async function syncProfile() {
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData?.session?.access_token
        if (!token) return
        await fetch('/api/sync-user', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        })
      } catch {}
    }
    
    const trimmedEmail = email.trim()
    const trimmedUsername = username.trim()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin

    if (is2FA) {
      if (!mfaCode || mfaCode.length < 6) return;
      
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors?.all?.find(f => f.factor_type === 'totp');
      
      if (!totpFactor) {
         setLoading(false);
         setNotice({ type: 'error', text: 'No 2FA setup found. Please contact support.' });
         return;
      }

      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: totpFactor.id,
        code: mfaCode
      });

      if (error) {
        setLoading(false);
        setNotice({ type: 'error', text: 'Invalid authentication code.' });
        return;
      }
      
      router.replace('/recommendations');
      return;
    }

    if (isResend) {
      if (!canSubmit) { setLoading(false); return }
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: trimmedEmail,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback?next=/onboarding`
        }
      })
      
      setLoading(false)
      if (error) {
        return setNotice({ type: 'error', text: error.message || 'Failed to resend confirmation email.' })
      }
      setNotice({ type: 'success', text: `Confirmation email resent to ${trimmedEmail}. Check your inbox (and spam).` })
      return
    }

    if (isSignUp) {
      if (!canSubmit) { setLoading(false); return }
      // Sign up
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback?next=/onboarding`,
          data: trimmedUsername ? { username: trimmedUsername } : {}
        }
      })
      
      if (error) {
        setLoading(false)
        return setNotice({ type: 'error', text: formatAuthError(error) })
      }
      
      if (!data?.session) {
        setLoading(false)
        setNotice({
          type: 'success',
          text: `If ${trimmedEmail} is new, we sent a confirmation email. If it already has an account, no new account was created. Check spam, or use “Resend Email”.`
        })
        setIsSignUp(false)
        setIsResend(false)
        return
      }
      await syncProfile()
      setLoading(false)
      router.replace('/onboarding')
    } else {
      if (!canSubmit) { setLoading(false); return }
      // Sign in
      const { data, error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password })
      
      if (error) {
        setLoading(false)
        if (error.message?.toLowerCase().includes('invalid') || error.message?.toLowerCase().includes('password')) {
          return setNotice({ type: 'error', text: 'Incorrect email or password.' })
        }
        return setNotice({ type: 'error', text: formatAuthError(error) })
      }
      
      // Check MFA
      const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (mfaData?.nextLevel === 'aal2' && mfaData?.currentLevel !== 'aal2') {
         setIs2FA(true);
         setLoading(false);
         setNotice(null);
         return;
      }

      await syncProfile()
      setLoading(false)
      
      // Check if user has completed onboarding
      if (data?.user?.user_metadata?.onboarded) {
        router.replace('/recommendations')
      } else {
        router.replace('/onboarding')
      }
    }
  }

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  async function generateDevConfirmLink() {
    if (devConfirmLoading) return
    const trimmedEmail = email.trim()
    if (!trimmedEmail) return
    setDevConfirmLoading(true)
    try {
      const res = await fetch('/api/auth/dev-confirmation-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Could not generate link')
      if (json?.ok) {
        setNotice({ type: 'success', text: `Confirmed ${trimmedEmail}. You can sign in now.` })
        setIsResend(false)
      } else {
        throw new Error('Confirmation failed')
      }
    } catch (err) {
      setNotice({ type: 'error', text: err?.message || 'Could not generate link' })
    } finally {
      setDevConfirmLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0a0a0a] to-black text-white flex flex-col font-sans relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('/assets/noise.png')] opacity-[0.03] pointer-events-none"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow delay-1000"></div>

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <BackButton />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-[420px] mx-auto animate-in fade-in zoom-in-95 duration-500">
          
          {/* Logo Section */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 group focus:outline-none">
              <div className="relative overflow-hidden transition-transform duration-300 group-hover:scale-105 group-focus:ring-2 group-focus:ring-blue-500 rounded-full">
                <img 
                  src="/assets/FLICKO.png.png" 
                  alt="Flico Logo" 
                  className="h-16 w-auto object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] rounded-full" 
                />
              </div>
              <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight">Flico</span>
            </Link>
          </div>

          {/* Card */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50 relative overflow-hidden">
            {/* Top Light Glint */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">
                {isResend ? 'Resend Confirmation' : (isSignUp ? 'Create your account' : 'Welcome back')}
              </h1>
              <p className="text-gray-400 text-sm">
                {isResend ? 'Enter your email to receive a new confirmation link' : (isSignUp ? 'Join Flico to track movies & get recommendations' : 'Enter your details to access your watchlist')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {is2FA ? (
                <div className="space-y-1.5 animate-in slide-in-from-right duration-300">
                  <label className="text-xs font-medium text-gray-400 ml-1">Two-Factor Authentication</label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-center tracking-[0.5em] font-mono text-lg"
                      placeholder="000000"
                      maxLength={6}
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Enter the code from your authenticator app.
                  </p>
                  <button 
                    type="button" 
                    onClick={() => { setIs2FA(false); setMfaCode(''); }}
                    className="text-xs text-blue-400 hover:text-blue-300 block mx-auto mt-4 hover:underline transition-all"
                  >
                    Back to Login
                  </button>
                </div>
              ) : (
                <>
                  {/* Username (SignUp Only) */}
              {isSignUp && !isResend && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400 ml-1">Username</label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onBlur={() => handleBlur('username')}
                      autoComplete="username"
                      className={`w-full bg-black/40 border ${touched.username && usernameError ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-blue-500/50'} rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
                      placeholder="MovieBuff123 (optional)"
                    />
                  </div>
                  {touched.username && usernameError && (
                    <p className="text-xs text-red-400 ml-1 animate-in slide-in-from-top-1">{usernameError}</p>
                  )}
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400 ml-1">Email Address</label>
                <div className="relative group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => handleBlur('email')}
                    autoComplete="email"
                    className={`w-full bg-black/40 border ${touched.email && emailError ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-blue-500/50'} rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
                    placeholder="you@example.com"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </div>
                </div>
                {touched.email && emailError && (
                  <p className="text-xs text-red-400 ml-1 animate-in slide-in-from-top-1">{emailError}</p>
                )}
              </div>

              {/* Password */}
              {!isResend && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-400 ml-1">Password</label>
                    {!isSignUp && (
                      <Link href="/auth/reset-password" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                        Forgot password?
                      </Link>
                    )}
                  </div>

                  <div className="relative group">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => handleBlur('password')}
                      autoComplete={isSignUp ? 'new-password' : 'current-password'}
                      minLength={6}
                      className={`w-full bg-black/40 border ${touched.password && passwordFeedback ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-blue-500/50'} rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all pr-12`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors focus:outline-none p-1 rounded-md"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      )}
                    </button>
                  </div>

                {touched.password && passwordFeedback && (
              <p className="text-xs text-red-400 ml-1 animate-in slide-in-from-top-1">
  {passwordFeedback}
</p>
)}
                </div>
  {/* Error/Success Message */}
{notice?.text && (
  <div className={`p-3 rounded-xl text-sm text-center animate-in fade-in slide-in-from-top-2 ${
    notice.type === 'error'
      ? 'bg-red-50 text-red-700'
      : 'bg-green-50 text-green-700'
  }`}>
    {notice.text}
  </div>
)}



              {isResend && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={generateDevConfirmLink}
                    disabled={devConfirmLoading || !email}
                    className="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-3 rounded-xl border border-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {devConfirmLoading ? 'Confirming…' : 'Confirm email (dev)'}
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || (!canSubmit && !is2FA)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative flex items-center justify-center gap-2">
                  {loading && (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {loading ? 'Processing...' : (is2FA ? 'Verify' : (isResend ? 'Resend Confirmation Email' : (isSignUp ? 'Create Account' : 'Sign In')))}
                </span>
              </button>
            </form>

            {/* Switch Mode */}
            <div className="text-center mt-8 space-y-4">
              <p className="text-gray-400 text-sm">
                {isResend ? 'Remembered it?' : (isSignUp ? 'Already have an account?' : "Don't have an account?")}
                <button
                  type="button"
                  onClick={() => {
                    setIsResend(false)
                    setIsSignUp(!isSignUp)
                    setNotice(null)
                    setTouched({ username: false, email: false, password: false, phone: false })
                  }}
                  className="ml-2 text-blue-400 hover:text-blue-300 font-medium transition-colors hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-md px-1"
                >
                  {isResend ? 'Sign In' : (isSignUp ? 'Sign In' : 'Sign Up')}
                </button>
              </p>
              
              {!isResend && !isSignUp && (
                <p className="text-gray-400 text-sm">
                  Didn't receive confirmation?
                  <button
                    type="button"
                    onClick={() => {
                      setIsResend(true)
                      setIsSignUp(false)
                      setNotice(null)
                    }}
                    className="ml-2 text-blue-400 hover:text-blue-300 font-medium transition-colors hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-md px-1"
                  >
                    Resend Email
                  </button>
                </p>
              )}
            </div>
          </div>
          
          {/* Footer Links */}
          <div className="mt-8 flex justify-center gap-6 text-xs text-gray-500">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
