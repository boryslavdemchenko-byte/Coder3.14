import Header from '../components/Header'
import Card from '../components/Card'
import { useEffect, useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { fetchWatchlist, removeFromWatchlist } from '../lib/watchlistClient'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Watchlist(){
  const supabase = useSupabaseClient()
  const user = useUser()
  const router = useRouter()
  const [items, setItems] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    if (!user) {
      router.push('/auth/signin')
      return
    }
    setLoading(true)
    fetchWatchlist(supabase).then(i=>{ setItems(i); setLoading(false) }).catch(()=>{ setItems([]); setLoading(false) })
  },[user?.id])

  async function handleToggle(item){
    try{
      await removeFromWatchlist(supabase, item.title.tmdbId)
      setItems(prev => prev.filter(x=>x.id!==item.id))
    }catch(err){
      console.error('Remove failed', err)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="px-6 py-8 max-w-6xl mx-auto">
        <h2 className="text-xl font-bold mb-4">Your Watchlist</h2>
        {loading && <div className="small-muted">Loading...</div>}
        {!loading && items && items.length === 0 && (
          <div className="card">
            <p className="mb-3">Your watchlist is empty.</p>
            <Link href="/recommendations" className="px-3 py-2 bg-accent text-white rounded">Browse recommendations</Link>
          </div>
        )}
        {!loading && items && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {items.map(item => (
              <Card key={item.id} item={{ id: item.title.tmdbId, title: item.title.title, poster: item.title.poster, genre: item.title.genre, year: item.title.year }} inWatchlist={true} onToggleWatchlist={()=>handleToggle(item)} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
