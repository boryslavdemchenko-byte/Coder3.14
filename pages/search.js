import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '../components/Layout'
import * as tmdb from '../lib/tmdb'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { addToWatchlist, removeFromWatchlist, fetchWatchlist } from '../lib/watchlistClient'
import Card from '../components/Card'

export default function Search() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const supabase = useSupabaseClient()
  const user = useUser()
  const [watchlist, setWatchlist] = useState([])

  useEffect(() => {
    if (!user) { setWatchlist([]); return }
    fetchWatchlist(supabase).then(items => setWatchlist(items.map(i => i.title.tmdbId))).catch(() => setWatchlist([]))
  }, [user?.id])

  useEffect(() => {
    if (router.isReady && router.query.q) {
      setQuery(router.query.q)
      performSearch(router.query.q)
    }
  }, [router.isReady, router.query.q])

  async function performSearch(text) {
    if (!text || !text.trim()) { setResults([]); return }
    // Access control: Don't perform search if user is not logged in
    if (!user) { setResults([]); return }
    try {
      const r = await tmdb.searchMulti(text.trim())
      setResults(r)
    } catch {
      setResults([])
    }
  }

  async function onSearch(e) {
    e.preventDefault()
    if (!query.trim()) { setResults([]); return }
    router.push(`/search?q=${encodeURIComponent(query.trim())}`, undefined, { shallow: true })
    performSearch(query)
  }

  async function toggle(item) {
    if (!user) return window.location.href = '/auth/login'
    const isIn = watchlist.includes(item.id)
    try {
      if (!isIn) {
        await addToWatchlist(supabase, { tmdbId: item.id, title: item.title, poster: item.poster, genre: item.genre, year: Number(item.year), type: item.type })
        setWatchlist(prev => [...prev, item.id])
      } else {
        await removeFromWatchlist(supabase, item.id)
        setWatchlist(prev => prev.filter(x => x !== item.id))
      }
    } catch {}
  }

  return (
    <Layout title="Search - Flico">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-6">Search</h1>
        <form onSubmit={onSearch} className="flex gap-3 mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies and series"
            className="flex-1 px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Search input"
          />
          <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition">
            Search
          </button>
        </form>

        {!user ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-[#1a1a1a] rounded-2xl border border-white/5 p-8">
            <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Login Required</h2>
            <p className="text-gray-400 max-w-md mb-8">
              Please log in or create an account to search for movies, series, and access full details.
            </p>
            <div className="flex gap-4">
              <Link href="/auth/login" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition">
                Log In
              </Link>
              <Link href="/auth/signup" className="px-6 py-3 bg-[#2a2a2a] hover:bg-[#333] text-white font-medium rounded-xl transition border border-white/10">
                Create Account
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {results.map(r => (
                <Card key={r.id} item={r} inWatchlist={watchlist.includes(r.id)} onToggleWatchlist={toggle} />
              ))}
            </div>
            {results.length === 0 && query && (
              <p className="text-gray-400">No results found.</p>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
