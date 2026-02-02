import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { useUser } from '@supabase/auth-helpers-react'
import * as tmdb from '../lib/tmdb'

export default function FlickMe() {
  const router = useRouter()
  const user = useUser()

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY
    if (!apiKey) return
    const prefsRaw = typeof window !== 'undefined' ? localStorage.getItem('flico_preferences') : null
    let prefs = null
    if (prefsRaw) {
      try {
        prefs = JSON.parse(prefsRaw)
      } catch {}
    }

    ;(async () => {
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
    })().catch(() => router.replace('/'))
  }, [])

  return (
    <Layout title="Flick Me">
      <div className="max-w-3xl mx-auto py-20 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Finding a great pick…</h1>
        <p className="text-gray-400">We’re using your preferences (if available) to choose a random title.</p>
        {!process.env.NEXT_PUBLIC_TMDB_API_KEY && (
          <p className="text-red-400 mt-4 text-sm">TMDB API key missing. Set NEXT_PUBLIC_TMDB_API_KEY in .env.local and restart.</p>
        )}
      </div>
    </Layout>
  )
}
