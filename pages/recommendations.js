import Header from '../components/Header'
import Card from '../components/Card'
import mapping from '../data/mapping.json'
import { useEffect, useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { fetchWatchlist, addToWatchlist, removeFromWatchlist } from '../lib/watchlistClient'

export default function Recommendations(){
  const recs = mapping.recommendations
  const supabase = useSupabaseClient()
  const user = useUser()
  const [watchlist, setWatchlist] = useState([])

  useEffect(()=>{
    if (!user) { setWatchlist([]); return }
    fetchWatchlist(supabase).then(items=>setWatchlist(items.map(i=>i.title.tmdbId))).catch(()=>setWatchlist([]))
  },[user?.id])

  async function toggle(item){
    if (!user) return window.location.href = '/auth/signin'
    const isIn = watchlist.includes(item.id)
    try{
      if (!isIn){
        await addToWatchlist(supabase, { tmdbId: item.id, title: item.title, poster: item.poster, genre: item.genre, year: item.year })
        setWatchlist(prev => [...prev, item.id])
      } else {
        await removeFromWatchlist(supabase, item.id)
        setWatchlist(prev => prev.filter(x=>x!==item.id))
      }
    }catch(err){
      console.error('Watchlist toggle error', err)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="px-6 py-8 max-w-6xl mx-auto">
        <h2 className="text-xl font-bold mb-4">Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recs.map(r => <Card key={r.id} item={r} inWatchlist={watchlist.includes(r.id)} onToggleWatchlist={toggle} />)}
        </div>
      </main>
    </div>
  )
}
