import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { useUser } from '@supabase/auth-helpers-react'
import * as tmdb from '../lib/tmdb'
import Link from 'next/link'

export default function FlickMe() {
  const router = useRouter()
  const user = useUser()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If no user, stop here (UI will handle showing login prompt)
    if (!user) {
      setLoading(false)
      return
    }

    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY
    if (!apiKey) {
      setLoading(false)
      return
    }

    const prefsRaw = typeof window !== 'undefined' ? localStorage.getItem('flico_preferences') : null
    let prefs = null
    if (prefsRaw) {
      try {
        prefs = JSON.parse(prefsRaw)
      } catch {}
    }

    ;(async () => {
      try {
        const all = await tmdb.getTrending()
        let pool = all
        if (prefs?.genres?.length) {
          const matches = all.filter(r => prefs.genres.some(g => (r.title || '').toLowerCase().includes(g.toLowerCase())))
          if (matches.length > 0) pool = matches
        }
        if (!pool || pool.length === 0) {
          router.replace('/')
          return
        }
        const choice = pool[Math.floor(Math.random() * pool.length)]
        router.replace(`/title/${choice.id}?type=${choice.type || ''}`)
      } catch (e) {
        console.error(e)
        router.replace('/')
      }
    })()
  }, [user, router])

  if (!user) {
    return (
      <Layout title="Flick Me">
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <div className="w-16 h-16 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Login Required</h1>
          <p className="text-gray-400 max-w-md mb-8">
            Flick Me uses AI to pick the perfect movie for you based on your taste. Please sign in to use this feature.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
            <Link href="/auth/login" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition text-center">
              Sign In
            </Link>
            <Link href="/auth/signup" className="flex-1 bg-white/10 text-white py-3 rounded-xl font-semibold hover:bg-white/20 transition text-center">
              Create Account
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Flick Me">
      <div className="max-w-3xl mx-auto py-20 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Finding a great pick…</h1>
        <p className="text-gray-400">We’re using your preferences (if available) to choose a random title.</p>
        {!process.env.NEXT_PUBLIC_TMDB_API_KEY && !loading && (
          <p className="text-red-400 mt-4 text-sm">TMDB API key missing. Set NEXT_PUBLIC_TMDB_API_KEY in .env.local and restart.</p>
        )}
      </div>
    </Layout>
  )
}
