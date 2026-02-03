import { useState, useEffect } from 'react'
import { useUser } from '@supabase/auth-helpers-react'
import Link from 'next/link'
import Layout from '../components/Layout'
import Card from '../components/Card'
import mapping from '../data/mapping.json'
import * as tmdb from '../lib/tmdb'
import CalendarDrawer from '../components/calendar/CalendarDrawer'

export default function Home() {
  const user = useUser()
  const [recommendations, setRecommendations] = useState(mapping.recommendations || [])
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [apiError, setApiError] = useState('')
  const [releases, setReleases] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [releasesError, setReleasesError] = useState('')

  useEffect(() => {
    tmdb.getTrending()
      .then(items => {
        setRecommendations(items || [])
        setApiError('')
      })
      .catch((err) => {
        console.error('TMDB Trending Error:', err)
        setApiError('Unable to fetch TMDB data. Check NEXT_PUBLIC_TMDB_API_KEY.')
        setRecommendations([])
      })
  }, [])
  
  useEffect(() => {
    tmdb.getNewReleases()
      .then(items => {
        setReleases(items || [])
        setReleasesError('')
      })
      .catch((err) => {
        console.error('TMDB New Releases Error:', err)
        setReleasesError('Unable to fetch New Releases from TMDB.')
        setReleases([])
      })
    tmdb.getUpcoming()
      .then(items => setUpcoming(items || []))
      .catch((err) => {
        console.error('TMDB Upcoming Error:', err)
        setUpcoming([])
      })
  }, [])
  
  // New releases are static placeholders here

  return (
    <Layout>
      {/* Hero Section */}
      <section className="mb-24 text-center md:text-left relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#1a1a1a] via-[#0a0a0a] to-black border border-white/5 p-10 md:p-20 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight tracking-tight text-white">
            {user ? (
              <>Welcome back to <span className="text-blue-500">Flico</span></>
            ) : (
              <>Discover your next <span className="text-blue-500">favorite movie</span></>
            )}
          </h1>
          <p className="text-gray-400/80 text-lg mb-10 leading-loose max-w-xl mx-auto md:mx-0">
            {user 
              ? "We've curated some fresh picks based on your recent activity. Ready to dive in?" 
              : "Track what you watch, save your favorites, and get personalized recommendations powered by AI."
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center md:justify-start">
            {!user ? (
              <>
                <Link href="/auth/signup" className="bg-white text-black px-8 py-3.5 rounded-full font-semibold hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  Get Started Free
                </Link>
                <Link href="/auth/login" className="bg-transparent border border-white/20 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-white/5 transition-all">
                  Sign In
                </Link>
              </>
            ) : (
              <>
                <Link href="/watchlist" className="bg-white text-black px-8 py-3.5 rounded-full font-semibold hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  Your Watchlist
                </Link>
                <Link href="/flick-me" className="bg-transparent border border-white/20 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-white/5 transition-all">
                  Flick Me
                </Link>
              </>
            )}
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[150px]"></div>
        </div>
      </section>

      {user && null}

      {/* Recommended Section */}
      <section className="mb-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Recommended for You</h2>
          {user && (
            <Link href="/recommendations" className="text-sm text-gray-400 hover:text-white transition">
              View All
            </Link>
          )}
        </div>
        {apiError && (
          <div className="mb-4 text-sm text-red-400">
            {apiError}
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {recommendations.slice(0, 6).map(r => {
            return (
              <div key={`${r.type}-${r.id}`} className="flex flex-col">
                <Card item={r} />
                <div className="mt-3 text-sm font-medium text-gray-500">Trending now</div>
              </div>
            )
          })}
        </div>
      </section>

      {/* New Releases Section */}
      <section className="mb-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">New Releases</h2>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block px-2 py-1 text-xs font-bold text-red-500 bg-red-500/10 border border-red-500/20 rounded">HOT THIS WEEK</span>
            <button
              type="button"
              onClick={() => setCalendarOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-blue-600 text-blue-400 hover:bg-blue-600/10 transition text-sm font-medium"
            >
              Calendar
            </button>
          </div>
        </div>
        
        {releasesError && (
          <div className="mb-4 text-sm text-red-400">
            {releasesError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {releases.slice(0, 6).map(r => (
            <Card key={`${r.type}-${r.id}`} item={r} />
          ))}
        </div>

        <CalendarDrawer isOpen={calendarOpen} onClose={() => setCalendarOpen(false)} />
      </section>
    </Layout>
  )
}
