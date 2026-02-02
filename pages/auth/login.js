import { useState, useEffect } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '../../components/Layout'

export default function Login(){
  const supabase = useSupabaseClient()
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordFeedback, setPasswordFeedback] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [canSubmit, setCanSubmit] = useState(true)

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
    const lenOk = value.length >= 8 && value.length <= 32
    const upperOk = /[A-Z]/.test(value)
    const numberOk = /\d/.test(value)
    if (!lenOk) return 'Password must be 8–32 characters'
    if (!upperOk || !numberOk) return 'Include at least 1 uppercase letter and 1 number'
    return 'Strong enough'
  }

  function validatePhone(value){
    if (!value) return ''
    const cleaned = value.replace(/[^\d+]/g,'')
    const digits = cleaned.replace(/\D/g,'')
    if (digits.length < 7) return 'Too short'
    if (digits.length > 15) return 'Too long'
    return ''
  }

  useEffect(()=>{
    const uErr = validateUsername(username)
    setUsernameError(uErr)
    const eErr = email ? (validateEmailFormat(email) ? '' : 'Invalid email format') : 'Email is required'
    setEmailError(eErr)
    const pFeed = getPasswordFeedback(password)
    setPasswordFeedback(pFeed)
    const phErr = validatePhone(phone)
    setPhoneError(phErr)
    const signUpValid = !uErr && !eErr && pFeed === 'Strong enough' && !phErr
    const signInValid = !eErr && password.length >= 8
    setCanSubmit(isSignUp ? signUpValid : signInValid)
  },[isSignUp, username, email, password, phone])

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
        options: { data: { username, phone } }
      })
      setLoading(false)
      if (error) {
        if (error.message?.toLowerCase().includes('already')) {
          return setMsg('That email already exists. Try signing in.')
        }
        return setMsg('Error: ' + error.message)
      }
      
      if (!data?.session) {
        setMsg('Account created — check your email to confirm. Then sign in.')
        setIsSignUp(false)
        return
      }
      await syncProfile()
      router.replace('/onboarding')
    } else {
      if (!canSubmit) { setLoading(false); return }
      // Sign in
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (error) {
        if (error.message?.toLowerCase().includes('invalid') || error.message?.toLowerCase().includes('password')) {
          return setMsg('Incorrect email or password.')
        }
        return setMsg('Error: ' + error.message)
      }
      await syncProfile()
      router.replace('/recommendations')
    }
  }

  return (
    <Layout title={isSignUp ? "Create Account - Flico" : "Sign In - Flico"}>
      <div className="flex-1 flex items-center justify-center p-6 gap-8 min-h-[calc(100vh-200px)]">
        {isSignUp ? (
          // CREATE ACCOUNT FORM
          <div className="max-w-md w-full">
            <div className="card p-12 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-2xl">
              <div className="mb-4">
                <Link 
                  href="/" 
                  className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
                  aria-label="Back to Home"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Home
                </Link>
              </div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2 text-white">Create account</h2>
                <p className="text-sm text-gray-400">
                  Already have an account? <button type="button" onClick={() => { setIsSignUp(false); setMsg(''); }} className="text-blue-500 font-semibold hover:underline">Sign in</button>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold mb-1 ml-1 text-gray-300">Email</label>
                  <input 
                    id="email"
                    required 
                    type="email" 
                    value={email} 
                    onChange={e=>setEmail(e.target.value)} 
                    placeholder="name@example.com"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-4 text-base text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition placeholder-gray-600" 
                  />
                  {emailError && <div className="mt-1 text-xs text-red-400" role="alert" aria-live="polite">{emailError}</div>}
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-semibold mb-1 ml-1 text-gray-300">Username</label>
                  <input 
                    id="username"
                    required 
                    type="text" 
                    value={username} 
                    onChange={e=>setUsername(e.target.value)} 
                    placeholder="Choose a username"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-4 text-base text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition placeholder-gray-600" 
                  />
                  <div className="mt-1 text-xs text-gray-400">{username.length}/20</div>
                  {usernameError && <div className="mt-1 text-xs text-red-400" role="alert" aria-live="polite">{usernameError}</div>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold mb-1 ml-1 text-gray-300">Phone</label>
                  <input 
                    id="phone"
                    type="tel" 
                    value={phone} 
                    onChange={e=>setPhone(e.target.value)} 
                    placeholder="Optional: +1 555 123 4567"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-4 text-base text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition placeholder-gray-600" 
                  />
                  {phoneError && <div className="mt-1 text-xs text-red-400" role="alert" aria-live="polite">{phoneError}</div>}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold mb-1 ml-1 text-gray-300">Password</label>
                  <input 
                    id="password"
                    required 
                    type="password" 
                    value={password} 
                    onChange={e=>setPassword(e.target.value)} 
                    placeholder="Create a password"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-4 text-base text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition placeholder-gray-600" 
                  />
                  <div className={`mt-1 text-xs ${passwordFeedback==='Strong enough' ? 'text-green-400' : 'text-yellow-300'}`}>{passwordFeedback}</div>
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading || !canSubmit} 
                  className="w-full bg-blue-600 text-white font-bold text-lg py-3.5 rounded-xl hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-900/40 transition-all transform hover:-translate-y-0.5"
                >
                  {loading ? 'Creating account…' : 'Sign Up'}
                </button>
              </form>

              {msg && <div className="mt-4 p-4 bg-red-900/30 border border-red-800 text-red-200 rounded-xl text-sm" role="alert" aria-live="assertive">{msg}</div>}
            </div>
          </div>
        ) : (
          // SIGN IN FORM
          <div className="flex flex-col items-center gap-6 w-full px-4">
            <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
              <div className="flex-1">
                <div className="card p-10 md:p-12 rounded-3xl h-full border border-[var(--border)] bg-[var(--card)] shadow-2xl">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-3 text-white">Sign in</h2>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Welcome back! Please enter your email and password to access your account.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="login-email" className="block text-sm font-semibold mb-1 ml-1 text-gray-300">Email</label>
                      <input 
                        id="login-email"
                        required 
                        type="email" 
                        value={email} 
                        onChange={e=>setEmail(e.target.value)} 
                        placeholder="name@example.com"
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-4 text-base text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition placeholder-gray-600" 
                      />
                      {emailError && <div className="mt-1 text-xs text-red-400" role="alert" aria-live="polite">{emailError}</div>}
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1 ml-1">
                        <label htmlFor="login-password" className="block text-sm font-semibold text-gray-300">Password</label>
                      </div>
                      <input 
                        id="login-password"
                        required 
                        type="password" 
                        value={password} 
                        onChange={e=>setPassword(e.target.value)} 
                        placeholder="Enter your password"
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-4 text-base text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition placeholder-gray-600" 
                      />
                      <div className="mt-1 text-xs text-gray-400">Min 8 characters</div>
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={loading || !canSubmit} 
                      className="w-full bg-blue-600 text-white font-bold text-lg py-3.5 rounded-xl hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-900/40 transition-all transform hover:-translate-y-0.5"
                    >
                      {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                  </form>

                  {msg && (
                    <div className="mt-6 p-4 bg-red-900/30 border border-red-800 rounded-xl text-sm text-red-200 font-medium" role="alert" aria-live="assertive">
                      {msg}
                    </div>
                  )}
                </div>
              </div>

              <div className="md:w-80 w-full">
                <div className="card p-8 rounded-3xl h-full flex flex-col justify-center items-center text-center bg-gray-900 border border-gray-800">
                  <h3 className="text-xl font-bold mb-2 text-white">New here?</h3>
                  <p className="text-sm text-gray-400 mb-6">
                    Join Flico today to start tracking your movies and sharing recommendations.
                  </p>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsSignUp(true)
                      setMsg('')
                    }}
                    className="w-full px-6 py-3 border-2 border-gray-700 rounded-xl font-bold text-gray-300 hover:bg-gray-800 hover:text-white transition text-base"
                  >
                    Create account
                  </button>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <Link 
                href="/" 
                className="text-sm inline-flex items-center gap-1 hover:underline text-gray-500"
              >
                ← Back to home
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
