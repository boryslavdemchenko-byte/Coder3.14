import Link from 'next/link'
import { useRouter } from 'next/router'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import AuthModal from './AuthModal'

export default function Header(){
  const user = useUser()
  const supabase = useSupabaseClient()
  const router = useRouter()
  const logoSrc = '/assets/FLICKO.png.png' // Using the provided logo file
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [donateNotice, setDonateNotice] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [avatarColor, setAvatarColor] = useState('blue')
  const [avatarText, setAvatarText] = useState('👤')
  const [avatarImage, setAvatarImage] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  async function signOut(){
    await supabase.auth.signOut()
    // client will update via SessionContextProvider
  }

  function handleSearch(e) {
    e.preventDefault()
    if (searchQuery.trim()) {
      if (!user) {
        setShowAuthModal(true)
        setIsMobileMenuOpen(false)
        return
      }
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsMobileMenuOpen(false)
    }
  }
  
  useEffect(() => {
    try {
      const stored = localStorage.getItem('flico_avatar_color')
      if (stored) setAvatarColor(stored)
    } catch {}
    try {
      const t = localStorage.getItem('flico_avatar_text')
      if (t) setAvatarText(t)
    } catch {}
    try {
      const img = localStorage.getItem('flico_avatar_image')
      if (img) setAvatarImage(img)
    } catch {}
    function onAvatarColor(e){
      if (e?.detail) setAvatarColor(e.detail)
    }
    function onAvatarText(e){
      if (e?.detail) setAvatarText(e.detail)
    }
    function onAvatarImage(e){
      if (e?.detail) setAvatarImage(e.detail)
    }
    window.addEventListener('flico-avatar-color', onAvatarColor)
    window.addEventListener('flico-avatar-text', onAvatarText)
    window.addEventListener('flico-avatar-image', onAvatarImage)
    return () => {
      window.removeEventListener('flico-avatar-color', onAvatarColor)
      window.removeEventListener('flico-avatar-text', onAvatarText)
      window.removeEventListener('flico-avatar-image', onAvatarImage)
    }
  }, [])
  
  const username = user?.user_metadata?.username || 'Account'
  const avatarBgClass = {
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
    green: 'bg-green-600',
    orange: 'bg-orange-600',
    red: 'bg-red-600',
    gray: 'bg-gray-600'
  }[avatarColor] || 'bg-blue-600'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-md transition-all duration-300">
      <div className="flex h-20 items-center justify-between px-6 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3 focus:outline-none" aria-label="Flico Home">
          <div className="relative overflow-hidden rounded-xl transition-transform duration-300 group-hover:scale-105 group-focus:ring-2 group-focus:ring-blue-500">
            <img 
              src={logoSrc} 
              alt="Flico Logo" 
              className="h-14 w-auto object-contain" 
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'block'
              }}
            />
            <div className="hidden h-14 w-14 bg-blue-600 rounded-xl items-center justify-center text-white font-bold text-2xl">F</div>
          </div>
          <span className="text-3xl font-bold text-white tracking-tight transition-colors group-hover:text-blue-400">Flico</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors relative group">
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
          </Link>
          <Link href="/recommendations" className="text-sm font-medium text-gray-300 hover:text-white transition-colors relative group">
            Recommendations
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
          </Link>
          <Link href="/new-releases" className="text-sm font-medium text-gray-300 hover:text-white transition-colors relative group">
            New Releases
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
          </Link>
          <Link href="/watchlist" className="text-sm font-medium text-gray-300 hover:text-white transition-colors relative group">
            Watchlist
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
          </Link>
          <button
            type="button"
            onClick={() => {
              setDonateNotice(true)
              setTimeout(() => {
                window.open('https://donate.stripe.com/test_00w8wI2Sx6Kb6OU93X6Na00', '_blank', 'noopener,noreferrer')
                setTimeout(() => setDonateNotice(false), 3500)
              }, 4200)
            }}
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors relative group"
            aria-label="Donate"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
          </button>
        </nav>

        {/* Search (Desktop) */}
        <form onSubmit={handleSearch} className="hidden lg:flex items-center relative mx-4">
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-white/10 text-white px-4 py-2 pl-10 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 transition-all focus:w-64 border border-transparent focus:border-blue-500 placeholder-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </form>

        {/* Auth Buttons & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition"
                >
                  <span className="hidden sm:inline text-sm font-medium">{username}</span>
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${avatarBgClass} text-white overflow-hidden`}>
                    {avatarImage ? (
                      <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      (avatarText || '👤')
                    )}
                  </span>
                  <svg className={`w-4 h-4 transition-transform ${accountOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {accountOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-44 rounded-xl border border-white/10 bg-black/90 backdrop-blur-xl shadow-xl p-2 z-50"
                  >
                    <Link href="/settings" className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition">
                      Settings
                    </Link>
                    <button
                      onClick={signOut}
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/10 rounded-lg transition"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="btn btn-primary text-sm px-5 py-2 shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40">
                Sign Up / Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-black/95 backdrop-blur-xl animate-in slide-in-from-top-5 duration-200">
          <nav className="flex flex-col p-6 gap-4">
            {/* Search (Mobile) */}
            <form onSubmit={handleSearch} className="relative mb-2">
              <input 
                type="text" 
                placeholder="Search movies & TV..." 
                className="w-full bg-white/10 text-white px-4 py-3 pl-10 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 border border-transparent focus:border-blue-500 placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </form>

            <Link href="/" className="text-lg font-medium text-gray-300 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </Link>
            <Link href="/recommendations" className="text-lg font-medium text-gray-300 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              Recommendations
            </Link>
            <Link href="/new-releases" className="text-lg font-medium text-gray-300 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              New Releases
            </Link>
            <Link href="/watchlist" className="text-lg font-medium text-gray-300 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              Watchlist
            </Link>
            <button
              type="button"
              className="text-left text-lg font-medium text-gray-300 hover:text-white transition-colors"
              onClick={() => {
                setIsMobileMenuOpen(false)
                setDonateNotice(true)
                setTimeout(() => {
                  window.open('https://donate.stripe.com/test_00w8wI2Sx6Kb6OU93X6Na00', '_blank', 'noopener,noreferrer')
                  setTimeout(() => setDonateNotice(false), 3500)
                }, 4200)
              }}
              aria-label="Donate"
            >
              Donate
            </button>
            <hr className="border-gray-800 my-2" />
            {user ? (
              <>
                <Link href="/settings" className="text-lg font-medium text-gray-300 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  Settings
                </Link>
                <button 
                  onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                  className="text-left text-lg font-medium text-red-400 hover:text-red-300 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link href="/auth/login" className="btn btn-primary text-center" onClick={() => setIsMobileMenuOpen(false)}>
                Sign Up / Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
      {donateNotice && (
        <div className="fixed bottom-6 right-6 z-[60] px-4 py-3 rounded-xl border border-gray-700 bg-black/80 text-gray-200 shadow-lg">
          You will be redirected to a secure Stripe page in a new tab.
          <button
            onClick={() => setDonateNotice(false)}
            className="ml-3 text-sm text-blue-400 hover:text-blue-300"
          >
            Dismiss
          </button>
        </div>
      )}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </header>
  )
}
