import Layout from '../components/Layout'
import Card from '../components/Card'
import { useEffect, useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { fetchWatchlist, addToWatchlist, removeFromWatchlist } from '../lib/watchlistClient'
import Link from 'next/link'
import BackButton from '../components/BackButton'
import * as tmdb from '../lib/tmdb'
import AuthModal from '../components/AuthModal'

export default function Recommendations() {
  const supabase = useSupabaseClient()
  const user = useUser()
  const [watchlist, setWatchlist] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [wlMsg, setWlMsg] = useState('')
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    if (user) {
      fetchWatchlist(supabase)
        .then(items => setWatchlist(items.map(i => i.title.tmdbId)))
        .catch(() => setWatchlist([]))
    }
  }, [user?.id])

  useEffect(() => {
    setLoading(true)
    tmdb.getTrending()
      .then(items => {
        setRecommendations(items || [])
        setLoading(false)
      })
      .catch(() => {
        setRecommendations([])
        setLoading(false)
      })
  }, [])

  async function toggle(item) {
    if (!user) return window.location.href = '/auth/login'
    const isIn = watchlist.includes(item.id)
    try {
      if (!isIn) {
        await addToWatchlist(supabase, { 
          tmdbId: item.id, 
          title: item.title, 
          poster: item.poster, 
          genre: item.genre, 
          year: Number(item.year),
          type: item.type
        })
        setWatchlist(prev => [...prev, item.id])
        setWlMsg('Added to watchlist')
      } else {
        await removeFromWatchlist(supabase, item.id)
        setWatchlist(prev => prev.filter(x => x !== item.id))
        setWlMsg('Removed from watchlist')
      }
    } catch (err) {
      setWlMsg('Action failed')
    }
    setTimeout(()=> setWlMsg(''), 2500)
  }

  const heroItem = recommendations[0]
  const listItems = recommendations.slice(1)

  return (
    <Layout title="Curated for You - Flico">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <BackButton />
          <h1 className="text-3xl font-bold text-white tracking-tight">Curated Discovery</h1>
        </div>

        {wlMsg && (
          <div className="fixed bottom-8 right-8 bg-blue-600 text-white px-6 py-3 rounded-full shadow-2xl z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            {wlMsg}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Editorial Hero Section */}
            {heroItem && (
              <div className="mb-20 relative rounded-3xl overflow-hidden bg-[#121212] border border-white/5 shadow-2xl group">
                <div className="absolute inset-0">
                  <img 
                    src={heroItem.backdrop || heroItem.poster} 
                    alt={heroItem.title}
                    className="w-full h-full object-cover opacity-40 group-hover:opacity-30 transition-opacity duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                </div>

                <div className="relative z-10 p-8 md:p-16 flex flex-col justify-end min-h-[500px] max-w-3xl">
                  <div className="flex items-center gap-3 mb-4 text-sm font-medium text-blue-400 tracking-wider uppercase">
                    <span className="bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">Editor's Pick</span>
                    <span>{heroItem.type === 'tv' ? 'TV Series' : 'Movie'}</span>
                  </div>
                  
                  <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                    {heroItem.title}
                  </h2>
                  
                  <p className="text-gray-300 text-lg md:text-xl mb-8 line-clamp-3 leading-relaxed max-w-2xl">
                    {heroItem.overview}
                  </p>

                  <div className="flex items-center gap-4">
                    <Link 
                      href={`/title/${heroItem.id}?type=${heroItem.type}`}
                      onClick={(e) => {
                        if (!user) {
                          e.preventDefault()
                          setShowAuthModal(true)
                        }
                      }}
                      className="bg-white text-black px-8 py-3.5 rounded-full font-bold hover:bg-gray-200 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                    >
                      View Details
                    </Link>
                    <button 
                      onClick={() => toggle(heroItem)}
                      className="px-8 py-3.5 rounded-full font-bold border border-white/20 text-white hover:bg-white/10 transition-all backdrop-blur-sm"
                    >
                      {watchlist.includes(heroItem.id) ? 'In Watchlist' : '+ Add to Watchlist'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Secondary Rows */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-200 border-l-4 border-blue-500 pl-4 mb-8">
                More Top Picks
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {listItems.map(item => (
                  <div key={`${item.type}-${item.id}`} className="flex flex-col gap-2">
                    <Card 
                      item={item} 
                      inWatchlist={watchlist.includes(item.id)}
                      onToggleWatchlist={toggle}
                    />
                    {/* Minimal metadata outside card if needed, but Card handles it. 
                        Prompt says "Show additional details only on hover", which Card does.
                    */}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </Layout>
  )
}
