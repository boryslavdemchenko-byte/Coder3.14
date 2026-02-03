import { Fragment } from 'react'
import Link from 'next/link'

export default function AuthModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-[#1a1a1a] rounded-2xl shadow-2xl border border-white/10 p-6 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Content */}
        <div className="text-center space-y-4 pt-2">
          <div className="mx-auto w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          
          <h3 className="text-xl font-bold text-white">Join Flico to Watch</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Create a free account to unlock full access to movies, personalized recommendations, and your own watchlist.
          </p>

          <div className="grid gap-3 pt-4">
            <Link 
              href="/auth/signup" 
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-600/20"
            >
              Create Account
            </Link>
            <Link 
              href="/auth/login" 
              className="w-full py-3 px-4 bg-[#2a2a2a] hover:bg-[#333] text-white font-medium rounded-xl transition-all border border-white/5 hover:border-white/10"
            >
              Log In
            </Link>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            It takes less than a minute.
          </p>
        </div>
      </div>
      
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />
    </div>
  )
}
