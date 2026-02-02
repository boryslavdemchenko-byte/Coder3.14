import Layout from '../components/Layout'
import Link from 'next/link'
import Card from '../components/Card'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { addToWatchlist, removeFromWatchlist, fetchWatchlist } from '../lib/watchlistClient'
import * as tmdb from '../lib/tmdb'
import CalendarDrawer from '../components/calendar/CalendarDrawer'
import BackButton from '../components/BackButton'

export default function NewReleases() {
  const supabase = useSupabaseClient()
  const user = useUser()
  const [watchlist, setWatchlist] = useState([])
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [allItems, setAllItems] = useState([])
  const [error, setError] = useState('')
  const [wlMsg, setWlMsg] = useState('')
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY

  useEffect(() => {
    if (!user) return
    fetchWatchlist(supabase)
      .then(items => setWatchlist(items.map(i => i.title.tmdbId)))
      .catch(() => setWatchlist([]))
  }, [user?.id])

  useEffect(() => {
    if (!apiKey) {
      setError('TMDB API key missing. Set NEXT_PUBLIC_TMDB_API_KEY in .env.local')
      setLoading(false)
      return
    }

    Promise.all([
      tmdb.getNewReleases(),
      tmdb.getUpcoming()
    ]).then(([newReleases, upcoming]) => {
      // De-duplicate by ID and Type to avoid collisions
      const map = new Map();
      [...newReleases, ...upcoming].forEach(item => map.set(`${item.type}-${item.id}`, item))
      setAllItems(Array.from(map.values()))
      setLoading(false)
    }).catch(() => {
      setError('Failed to fetch data')
      setLoading(false)
    })
  }, [])

  async function toggle(item) {
    if (!user) return window.location.href = '/auth/login'
    const isIn = watchlist.includes(item.id)
    try {
      if (!isIn) {
        await addToWatchlist(supabase, { tmdbId: item.id, title: item.title, poster: item.poster, genre: item.genre, year: Number(item.year), type: item.type })
        setWatchlist(prev => [...prev, item.id])
        setWlMsg('Added to watchlist')
      } else {
        await removeFromWatchlist(supabase, item.id)
        setWatchlist(prev => prev.filter(x => x !== item.id))
        setWlMsg('Removed from watchlist')
      }
    } catch (err) {
      setWlMsg(err?.message || 'Action failed')
    }
    setTimeout(()=> setWlMsg(''), 2500)
  }

  // Grouping Logic
  const now = new Date()
  const oneWeekAgo = new Date(now)
  oneWeekAgo.setDate(now.getDate() - 7)
  const oneMonthAgo = new Date(now)
  oneMonthAgo.setDate(now.getDate() - 30)

  const groups = {
    thisWeek: [],
    thisMonth: [],
    recentlyReleased: [],
    comingSoon: []
  }

  allItems.forEach(item => {
    if (!item.releaseDate) return
    const d = new Date(item.releaseDate)
    if (isNaN(d.getTime())) return
    
    if (d > now) {
      groups.comingSoon.push(item)
    } else if (d >= oneWeekAgo) {
      groups.thisWeek.push(item)
    } else if (d >= oneMonthAgo) {
      groups.thisMonth.push(item)
    } else {
      groups.recentlyReleased.push(item)
    }
  })

  // Sort by date
  const sortByDateDesc = (a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)
  const sortByDateAsc = (a, b) => new Date(a.releaseDate) - new Date(b.releaseDate)

  groups.thisWeek.sort(sortByDateDesc)
  groups.thisMonth.sort(sortByDateDesc)
  groups.recentlyReleased.sort(sortByDateDesc)
  groups.comingSoon.sort(sortByDateAsc)

  return (
    <Layout title="New Releases - Flico">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Fresh Drops</h1>
              <p className="text-gray-400 mt-1">Latest releases and upcoming premieres</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCalendarOpen(true)}
            className="px-4 py-2 rounded-full border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition flex items-center gap-2 text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Release Calendar
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 mb-8">
            {error}
          </div>
        )}
        
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
          <div className="space-y-4">
            <Section title="This Week" items={groups.thisWeek} watchlist={watchlist} toggle={toggle} />
            <Section title="This Month" items={groups.thisMonth} watchlist={watchlist} toggle={toggle} />
            <Section title="Recently Released" items={groups.recentlyReleased} watchlist={watchlist} toggle={toggle} />
            <Section title="Coming Soon" items={groups.comingSoon} watchlist={watchlist} toggle={toggle} />
            
            {allItems.length === 0 && !error && (
              <div className="text-center py-20 text-gray-500">
                No new releases found at the moment.
              </div>
            )}
          </div>
        )}

        <CalendarDrawer isOpen={calendarOpen} onClose={() => setCalendarOpen(false)} />
      </div>
    </Layout>
  )
}

const Section = ({ title, items, watchlist, toggle }) => (
  items.length > 0 && (
    <section className="mb-16">
      <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
        <h2 className="text-xl font-bold text-white tracking-wide">{title}</h2>
        <span className="px-2 py-0.5 rounded-md bg-white/10 text-xs font-medium text-gray-400">
          {items.length}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {items.map(r => (
          <Card key={`${r.type}-${r.id}`} item={r} inWatchlist={watchlist.includes(r.id)} onToggleWatchlist={toggle} />
        ))}
      </div>
    </section>
  )
)
