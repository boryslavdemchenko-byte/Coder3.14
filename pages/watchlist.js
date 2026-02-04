
import Layout from '../components/Layout'
import LibraryCard from '../components/LibraryCard'
import { useEffect, useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { fetchWatchlist, removeFromWatchlist } from '../lib/watchlistClient'
import Link from 'next/link'
import BackButton from '../components/BackButton'

export default function Watchlist() {
  const supabase = useSupabaseClient()
  const user = useUser()
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

  return (
    <Layout 
      title="Your Library - Flico" 
      background="bg-gradient-to-br from-[#141414] via-[#0f1115] to-[#0a0a0c]"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header Section */}
        <header className="mb-12 border-b border-white/5 pb-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 text-sm text-gray-400 font-medium mb-2">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <span className="text-blue-500">Library</span>
            </div>
            
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">Your Library</h1>
                <p className="text-gray-400 mt-2 text-lg">Movies and shows you've saved and tracked.</p>
              </div>
              {items && items.length > 0 && (
                <div className="hidden sm:block text-gray-500 font-medium">
                  {items.length} {items.length === 1 ? 'Title' : 'Titles'}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Section */}
        {loading ? (
          <div className="flex justify-center py-40">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : !user ? (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-white/5 rounded-3xl border border-white/5 p-12 backdrop-blur-sm max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">Sign in to build your library</h2>
            <p className="text-gray-400 mb-8 max-w-md text-lg">Create a personal collection of movies and TV shows you want to watch.</p>
            <Link href="/auth/login" className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-xl shadow-blue-900/20 hover:scale-105">
              Sign In to Flico
            </Link>
          </div>
        ) : items && items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 ring-1 ring-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Your library is empty</h2>
            <p className="text-gray-400 mb-8 max-w-md text-lg">Start building your collection by adding movies and shows you're interested in.</p>
            <Link href="/" className="px-8 py-3 bg-white text-black hover:bg-gray-200 rounded-full font-bold transition-all hover:-translate-y-1">
              Explore Content
            </Link>
          </div>
        ) : (
          <div className="animate-in fade-in duration-700 slide-in-from-bottom-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
              {items.map(item => (
                <div key={item.id} className="w-full">
                  <LibraryCard 
                    item={{ 
                      id: item.title.tmdbId, 
                      title: item.title.title, 
                      poster: item.title.poster, 
                      genre: item.title.genre, 
                      year: item.title.year,
                      type: item.title.type
                    }} 
                    onRemove={() => handleRemove(item.title.tmdbId)} 
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
