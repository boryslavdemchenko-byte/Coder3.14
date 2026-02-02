import Layout from '../components/Layout'
import Card from '../components/Card'
import { useEffect, useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { fetchWatchlist, removeFromWatchlist } from '../lib/watchlistClient'
import Link from 'next/link'
import { useRouter } from 'next/router'
import BackButton from '../components/BackButton'

export default function Watchlist() {
  const supabase = useSupabaseClient()
  const user = useUser()
  const router = useRouter()
  const [items, setItems] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    fetchWatchlist(supabase)
      .then(i => { setItems(i); setLoading(false) })
      .catch(() => { setItems([]); setLoading(false) })
  }, [user?.id])

  async function handleRemove(id) {
    try {
      await removeFromWatchlist(supabase, id)
      setItems(prev => prev.filter(x => x.title.tmdbId !== id))
    } catch (err) {
      console.error('Remove failed', err)
    }
  }

  // Mock splitting logic
  const continueWatching = items ? items.slice(0, 2) : []
  const savedForLater = items ? items.slice(2) : []

  return (
    <Layout title="Your Watchlist - Flico">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <BackButton />
          <h1 className="text-3xl font-bold text-white tracking-tight">Your Library</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : !user ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-[#121212] rounded-3xl border border-white/5 p-10">
            <h2 className="text-2xl font-bold text-white mb-4">Sign in to track your shows</h2>
            <p className="text-gray-400 mb-8 max-w-md">Create a watchlist to keep track of movies and TV shows you want to watch.</p>
            <Link href="/auth/login" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition-all shadow-lg shadow-blue-900/20">
              Sign In or Create Account
            </Link>
          </div>
        ) : items && items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Your watchlist is empty</h2>
            <p className="text-gray-400 mb-8 max-w-md">Start building your library by adding movies and shows you want to watch.</p>
            <Link href="/recommendations" className="px-8 py-3 bg-white text-black hover:bg-gray-200 rounded-full font-bold transition-all">
              Browse Recommendations
            </Link>
          </div>
        ) : (
          <div className="space-y-16">
            
            {/* Continue Watching Section */}
            {continueWatching.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Continue Watching
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {continueWatching.map(item => {
                     // Deterministic progress based on ID to prevent hydration mismatch
                     const progress = (item.title.tmdbId % 50) + 30
                     return (
                       <Link 
                         key={item.id} 
                         href={`/title/${item.title.tmdbId}?type=${item.title.type}`}
                         className="group relative flex items-center bg-[#1a1a1a] rounded-2xl overflow-hidden border border-white/5 hover:border-white/10 transition-all hover:shadow-2xl hover:shadow-blue-900/10"
                       >
                         {/* Poster */}
                         <div className="relative w-32 h-48 flex-shrink-0">
                           <img 
                             src={item.title.poster || '/assets/poster-placeholder.svg'} 
                             alt={item.title.title} 
                             className="w-full h-full object-cover"
                           />
                           {/* Play Overlay */}
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center pl-1 shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                               </svg>
                             </div>
                           </div>
                         </div>
                         
                         {/* Details */}
                         <div className="flex-1 p-6 flex flex-col justify-center">
                           <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{item.title.title}</h3>
                           <div className="text-sm text-gray-400 mb-4 flex items-center gap-3">
                             <span>{item.title.year}</span>
                             <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                             <span className="uppercase text-xs font-semibold tracking-wider text-gray-500">{item.title.type}</span>
                           </div>
                           
                           {/* Progress Bar */}
                           <div className="w-full bg-gray-800 rounded-full h-1.5 mb-2 overflow-hidden">
                             <div 
                               className="bg-blue-600 h-full rounded-full" 
                               style={{ width: `${progress}%` }}
                             ></div>
                           </div>
                           <div className="text-xs text-gray-500 font-medium">
                             {Math.floor(item.title.type === 'movie' ? 120 * (progress/100) : 45 * (progress/100))}m remaining
                           </div>
                         </div>

                         {/* Remove Button */}
                         <button
                           onClick={(e) => {
                             e.preventDefault()
                             handleRemove(item.title.tmdbId)
                           }}
                           className="absolute top-4 right-4 text-gray-500 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                           title="Remove from watchlist"
                         >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                           </svg>
                         </button>
                       </Link>
                     )
                  })}
                </div>
              </section>
            )}

            {/* Saved for Later Section */}
            {savedForLater.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Saved for Later
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {savedForLater.map(item => (
                    <div key={item.id} className="relative group">
                      <Card 
                        item={{ 
                          id: item.title.tmdbId, 
                          title: item.title.title, 
                          poster: item.title.poster, 
                          genre: item.title.genre, 
                          year: item.title.year,
                          type: item.title.type
                        }} 
                        inWatchlist={true} 
                        onToggleWatchlist={() => handleRemove(item.title.tmdbId)} 
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
