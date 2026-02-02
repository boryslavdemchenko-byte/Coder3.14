import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {results.map(r => (
            <Card key={r.id} item={r} inWatchlist={watchlist.includes(r.id)} onToggleWatchlist={toggle} />
          ))}
        </div>
        {results.length === 0 && query && (
          <p className="text-gray-400">No results found.</p>
        )}
      </div>
    </Layout>
  )
}
