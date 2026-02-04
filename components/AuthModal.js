import { Fragment, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export default function AuthModal({ isOpen, onClose }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className={`${inter.variable} font-sans fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-in fade-in duration-300`}>
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div 
        className="relative w-full max-w-md bg-[#121212] rounded-3xl shadow-2xl border border-white/10 p-8 overflow-hidden animate-in zoom-in-95 duration-300 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Gradient Background */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none"></div>

        {/* Close Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-4 right-4 text-gray-300 hover:text-white transition-all p-3 rounded-full bg-white/5 hover:bg-white/20 backdrop-blur-md z-50 group shadow-lg border border-white/5"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Content */}
        <div className="text-center space-y-6 relative z-10">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400 drop-shadow-md">
              <path d="M15 10l-4 4l6 6l4 -16l-18 7l4 2l2 6l3 -4"></path>
            </svg>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white tracking-tight">Unlock the Full Experience</h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-[85%] mx-auto">
              Join Flico to use AI recommendations, save your watchlist, and sync across devices.
            </p>
          </div>

          <div className="grid gap-4 pt-2">
            <Link 
              href="/auth/signup" 
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 group"
            >
              <span>Create Free Account</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link 
              href="/auth/login" 
              className="w-full py-3.5 px-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all border border-white/10 hover:border-white/20"
            >
              Log In
            </Link>
          </div>
          
          <p className="text-[11px] text-gray-500 pt-2">
            Free forever
          </p>
        </div>
      </div>
    </div>,
    document.body
  )
}
