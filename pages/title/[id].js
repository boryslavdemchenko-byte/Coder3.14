import Header from '../../components/Header'
import mapping from '../../data/mapping.json'
import {useRouter} from 'next/router'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useEffect, useState, useRef } from 'react'
import { addToWatchlist, removeFromWatchlist, fetchWatchlist } from '../../lib/watchlistClient'

export default function Title(){
  const router = useRouter()
  const {id} = router.query
  const item = mapping.recommendations.find(r=>String(r.id)===String(id))
  const supabase = useSupabaseClient()
  const user = useUser()
  const [inWatchlist, setInWatchlist] = useState(false)
  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const headingRef = useRef(null)

  useEffect(()=>{
    // autofocus the main heading for accessibility
    headingRef.current?.focus()
  }, [])

  useEffect(()=>{
    if (!user) { setInWatchlist(false); return }
    fetchWatchlist(supabase).then(items=>{
      const ids = items.map(i=>i.title.tmdbId)
      setInWatchlist(ids.includes(Number(id)))
    }).catch(()=>setInWatchlist(false))
  },[user?.id, id])

  if(!item) return (
    <div className="min-h-screen"><Header /><main className="px-6 py-8 max-w-6xl mx-auto">Title not found</main></div>
  )

  // Helper to show inline status messages for a short time
  function showStatus(msg){
    setStatusMsg(msg)
    setTimeout(()=> setStatusMsg(''), 3000)
  }

  async function toggle(){
    if (!user) return router.push('/auth/signin')
    setLoading(true)
    try{
      if (!inWatchlist){
        await addToWatchlist(supabase, { tmdbId: Number(id), title: item.title, poster: item.poster, genre: item.genre, year: item.year })
        setInWatchlist(true)
        showStatus('Added to watchlist')
      } else {
        await removeFromWatchlist(supabase, Number(id))
        setInWatchlist(false)
        showStatus('Removed from watchlist')
      }
    }catch(err){
      console.error('Watchlist toggle error', err)
      showStatus('Action failed')
    }finally{ 
      // keep button briefly disabled after success/failure to avoid double-tap
      setTimeout(()=>setLoading(false), 350)
    }
  }

  const genres = item.genre ? item.genre.split(',').map(s=>s.trim()) : []
  const type = item.type || 'Movie'

  return (
    <div className="min-h-screen">
      <Header />
      <main className="px-6 py-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <img src={item.poster} alt={item.title} className="w-full rounded" />
          </div>
          <div className="md:col-span-2">
            <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold">{item.title}</h2>
            <p className="small-muted">{type} · {item.year} · {genres.join(', ')}</p>
            <p className="mt-4">A short synopsis about the title goes here. Matches: <strong>{item.match}%</strong></p>
            <div className="mt-2">
              <div role="status" aria-live="polite" className="small-muted">{statusMsg}</div>
            </div>
            <div className="mt-6 flex gap-3">
              <button aria-pressed={inWatchlist} aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'} onClick={toggle} disabled={loading} className={`px-4 py-2 rounded ${inWatchlist ? 'bg-white border text-accent' : 'bg-accent text-white'}`}>
                {loading ? 'Saving…' : (inWatchlist ? 'Added' : 'Add to Watchlist')}
              </button>
              <a href="#" className="px-4 py-2 border rounded">View on Provider</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
