
import Link from 'next/link'
import { useState } from 'react'
import { useUser } from '@supabase/auth-helpers-react'
import AuthModal from './AuthModal'

export default function LibraryCard({ item, onRemove }) {
  const user = useUser()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleLinkClick = (e) => {
    if (!user) {
      e.preventDefault()
      setShowAuthModal(true)
    }
  }

  return (
    <>
      <div 
        className="group relative flex flex-col w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link 
          href={`/title/${item.id}${item.type ? `?type=${item.type}` : ''}`} 
          onClick={handleLinkClick}
          aria-label={`Open ${item.title}`} 
          className="relative block w-full aspect-[2/3] rounded-xl overflow-hidden shadow-lg transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-blue-900/20 group-hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          {/* Poster Image */}
          <div className="absolute inset-0 bg-gray-900">
            <img 
              src={item.poster || '/assets/poster-placeholder.svg'} 
              alt={item.title || 'Poster'} 
              loading="lazy" 
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
            />
            
            {/* Cinematic Gradient Overlay (Hover) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Remove Action (Overlay) */}
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemove(item);
              }}
              aria-label="Remove from library"
              className={`
                absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md text-white/70 hover:bg-red-500/80 hover:text-white transition-all duration-300 transform 
                ${isHovered ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}
              `}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </Link>

        {/* Minimalist Content */}
        <div className="mt-3 flex flex-col gap-0.5 px-1">
          <h3 className="font-semibold text-[15px] text-white leading-tight line-clamp-1 group-hover:text-blue-400 transition-colors">
            {item.title}
          </h3>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400/80">
            <span>{item.year}</span>
            {item.type && (
              <>
                <span className="w-0.5 h-0.5 bg-gray-500 rounded-full" />
                <span className="uppercase tracking-wider">{item.type === 'tv' ? 'Series' : 'Movie'}</span>
              </>
            )}
            {item.genre && (
              <>
                <span className="w-0.5 h-0.5 bg-gray-500 rounded-full" />
                <span className="truncate max-w-[100px]">{item.genre}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  )
}
