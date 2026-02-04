import Link from 'next/link'
import { useEffect, useState } from 'react'
import * as tmdb from '../lib/tmdb'
import { useUser } from '@supabase/auth-helpers-react'
import AuthModal from './AuthModal'

export default function Card({ item, inWatchlist = false, onToggleWatchlist }) {
  const user = useUser()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const isNew = item.year >= new Date().getFullYear();
  const matchColor = item.match >= 90 ? 'bg-green-500' : item.match >= 75 ? 'bg-blue-500' : 'bg-yellow-500';
  const [cert, setCert] = useState(item.certification || '')
  const [providers, setProviders] = useState([])

  useEffect(() => {
    let cancelled = false
    async function run() {
      // Fetch Certification
      if (!cert && item?.id && item?.type) {
        try {
          const certKey = `flico_cert_${item.type}_${item.id}`
          const cachedCert = typeof window !== 'undefined' ? sessionStorage.getItem(certKey) : null
          if (cachedCert) {
             if (!cancelled) setCert(cachedCert)
          } else {
             const c = await tmdb.getTitleCertification(item.id, item.type)
             if (!cancelled) {
               setCert(c || '')
               if (typeof window !== 'undefined') sessionStorage.setItem(certKey, c || '')
             }
          }
        } catch {}
      }

      // Fetch Providers
      if (item?.id && item?.type) {
        try {
          const provKey = `flico_prov_${item.type}_${item.id}`
          const cachedProv = typeof window !== 'undefined' ? sessionStorage.getItem(provKey) : null
          if (cachedProv) {
            if (!cancelled) setProviders(JSON.parse(cachedProv))
          } else {
            const p = await tmdb.getWatchProviders(item.id, item.type)
            if (!cancelled) {
              const topProviders = p.slice(0, 3) // Limit to top 3
              setProviders(topProviders)
              if (typeof window !== 'undefined') sessionStorage.setItem(provKey, JSON.stringify(topProviders))
            }
          }
        } catch {}
      }
    }
    run()
    return () => { cancelled = true }
  }, [item?.id, item?.type])

  const handleLinkClick = (e) => {
    if (!user) {
      e.preventDefault()
      setShowAuthModal(true)
    }
  }

  return (
    <>
      <Link 
        href={`/title/${item.id}${item.type ? `?type=${item.type}` : ''}`} 
        onClick={handleLinkClick}
        aria-label={`Open ${item.title}`} 
        className="group relative flex flex-col bg-[#121212] rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
      {/* Poster Image */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-900">
        <img 
          src={item.poster || '/assets/poster-placeholder.svg'} 
          alt={item.title || 'Poster'} 
          loading="lazy" 
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
        />
        
        {/* Overlay Gradient (Hover) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges (Hover only) */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0">
          {isNew && (
            <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-md shadow-lg backdrop-blur-md">
              NEW
            </span>
          )}
          {item.match && (
            <span className={`px-2 py-0.5 ${matchColor} text-white text-[10px] font-bold rounded-md shadow-lg backdrop-blur-md`}>
              {item.match}%
            </span>
          )}
          {cert && (
            <span className="px-2 py-0.5 bg-white/10 border border-white/20 text-white text-[10px] font-bold rounded-md backdrop-blur-md">
              {cert}
            </span>
          )}
        </div>

        {/* Secondary Details (Hover only - Bottom of poster) */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          {item.genre && (
            <p className="text-xs text-gray-300 font-medium line-clamp-1 mb-2">{item.genre}</p>
          )}
          {providers.length > 0 && (
            <div className="flex gap-1.5">
              {providers.map(p => (
                <div key={p.id} className="w-5 h-5 rounded-md overflow-hidden shadow-sm" title={p.name}>
                  <img src={p.logo} alt={p.name} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Action Button (Visible on Hover) */}
        {onToggleWatchlist && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWatchlist(item);
            }}
            aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
            title={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
            className={`
              absolute top-3 right-3 p-2 rounded-full backdrop-blur-md shadow-lg transition-all duration-300 transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100
              ${inWatchlist ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-black/40 text-white hover:bg-blue-600 hover:text-white'}
            `}
          >
            {inWatchlist ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-1">
        <h3 className="font-semibold text-base text-gray-100 leading-snug line-clamp-1 group-hover:text-blue-400 transition-colors" title={item.title}>
          {item.title}
        </h3>
        
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>{item.year}</span>
          
          {(item.rating) && (
            <div className="flex items-center gap-1.5 text-gray-400">
              <svg className="w-3.5 h-3.5 text-yellow-500 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              <span className="font-medium">{item.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  )
}
