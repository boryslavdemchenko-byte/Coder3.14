import { useState, useEffect } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '../../components/Layout'
import BackButton from '../../components/BackButton'

export default function Login(){
  const supabase = useSupabaseClient()
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordFeedback, setPasswordFeedback] = useState('')
  const [canSubmit, setCanSubmit] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false
  })

  useEffect(() => {
    if (router.query.signup === 'true') {
      setIsSignUp(true)
    }
  }, [router.query])

  function validateEmailFormat(value){
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(String(value).toLowerCase())
  }

  function validateUsername(value){
    if (!isSignUp) return ''
    const re = /^[A-Za-z0-9_]{3,20}$/
    if (!value) return 'Username is required'
    if (value.length < 3) return 'Username must be at least 3 characters'
    if (value.length > 20) return 'Username must be at most 20 characters'
    if (!re.test(value)) return 'Use letters, numbers, and underscores only'
    return ''
  }

  function getPasswordFeedback(value){
    if (!isSignUp) {
      return value.length >= 8 ? '' : 'Password too short'
    }
    const lenOk = value.length >= 8 && value.length <= 32
    const upperOk = /[A-Z]/.test(value)
    const numberOk = /\d/.test(value)
    if (!lenOk) return 'Password must be 8–32 characters'
    if (!upperOk || !numberOk) return 'Include at least 1 uppercase letter and 1 number'
    return ''
  }

  useEffect(()=>{
    const uErr = validateUsername(username)
    setUsernameError(uErr)
    const eErr = email ? (validateEmailFormat(email) ? '' : 'Invalid email format') : 'Email is required'
    setEmailError(eErr)
    const pFeed = getPasswordFeedback(password)
    setPasswordFeedback(pFeed)
    const signUpValid = !uErr && !eErr && !pFeed
    const signInValid = !eErr && password.length >= 8
    setCanSubmit(isSignUp ? signUpValid : signInValid)
  },[isSignUp, username, email, password])

  const handleOAuth = async (provider) => {
    setLoading(true)
    setMsg('')
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true,
        },
      })
      if (error) throw error
      if (data?.url) {
        window.location.href = data.url
      }
    } catch (error) {
      setLoading(false)
      if (error.message?.includes('provider is not enabled')) {
        setMsg(`Login failed: ${provider} login is not enabled in Supabase dashboard.`)
      } else {
        setMsg('Error: ' + (error.message || 'Could not connect to provider'))
      }
    }
  }

  async function handleSubmit(e){
    e.preventDefault()
    setMsg('')
    
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
    
    if (isSignUp) {
      if (!canSubmit) { setLoading(false); return }
      // Sign up
      const { data, error } = await supabase.auth.signUp({
        email, 
        password,
        options: { data: { username } }
      })
      
      if (error) {
        setLoading(false)
        if (error.message?.toLowerCase().includes('already')) {
          return setMsg('That email already exists. Try signing in.')
        }
        return setMsg('Error: ' + error.message)
      }
      
      if (!data?.session) {
        setLoading(false)
        setMsg('Account created! Please check your email to confirm. (Check spam folder if needed)')
        setIsSignUp(false)
        return
      }
      await syncProfile()
      setLoading(false)
      router.replace('/onboarding')
    } else {
      if (!canSubmit) { setLoading(false); return }
      // Sign in
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      
      if (error) {
        setLoading(false)
        if (error.message?.toLowerCase().includes('invalid') || error.message?.toLowerCase().includes('password')) {
          return setMsg('Incorrect email or password.')
        }
        return setMsg('Error: ' + error.message)
      }
      await syncProfile()
      setLoading(false)
      router.replace('/recommendations')
    }
  }

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }))
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
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="text-gray-400 text-sm">
                {isSignUp ? 'Join Flico to track movies & get recommendations' : 'Enter your details to access your watchlist'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Username (SignUp Only) */}
              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400 ml-1">Username</label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onBlur={() => handleBlur('username')}
                      className={`w-full bg-black/40 border ${touched.username && usernameError ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-blue-500/50'} rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
                      placeholder="MovieBuff123"
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
                  <p className="text-xs text-red-400 ml-1 animate-in slide-in-from-top-1">{passwordFeedback}</p>
                )}
              </div>

              {/* Error/Success Message */}
              {msg && (
                <div className={`p-3 rounded-xl text-sm text-center animate-in fade-in slide-in-from-top-2 ${msg.includes('Check') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {msg}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || (isSignUp && !canSubmit) || (!isSignUp && (!email || !password))}
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
                  {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
                </span>
              </button>
            </form>

            {/* Social Login */}
            <div className="mt-6">
              <div className="relative my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10"></div>
                <span className="text-xs uppercase text-gray-500 font-medium tracking-wider">Instant Access with</span>
                <div className="h-px flex-1 bg-white/10"></div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => handleOAuth('google')}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white text-gray-900 hover:bg-gray-100 font-bold rounded-xl transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/5"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>
            </div>

            {/* Switch Mode */}
            <div className="text-center mt-8">
              <p className="text-gray-400 text-sm">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp)
                    setMsg('')
                    setTouched({ username: false, email: false, password: false, phone: false })
                  }}
                  className="ml-2 text-blue-400 hover:text-blue-300 font-medium transition-colors hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-md px-1"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
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