// Minimal client helper for watchlist API calls
export async function fetchWatchlist(supabase){
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('flico_watchlist') : null
      const list = raw ? JSON.parse(raw) : []
      return list.map(t => ({ id: t.tmdbId, title: t }))
    } catch { return [] }
  }
  const token = session.access_token
  const res = await fetch('/api/watchlist', { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('flico_watchlist') : null
      const list = raw ? JSON.parse(raw) : []
      return list.map(t => ({ id: t.tmdbId, title: t }))
    } catch { return [] }
  }
  const json = await res.json()
  return json.items || []
}

export async function addToWatchlist(supabase, title){
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('flico_watchlist') : null
      const list = raw ? JSON.parse(raw) : []
      const exists = list.some(t => Number(t.tmdbId) === Number(title.tmdbId))
      if (!exists) {
        list.push(title)
        if (typeof window !== 'undefined') localStorage.setItem('flico_watchlist', JSON.stringify(list))
      }
      return { ok: true, local: true }
    } catch { throw new Error('Not authenticated') }
  }
  const token = session.access_token
  try{
    const res = await fetch('/api/watchlist', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ title }) })
    const json = await res.json().catch(()=> ({}))
    if (!res.ok) throw new Error(json?.error || 'Add failed')
    return json
  }catch(err){
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('flico_watchlist') : null
      const list = raw ? JSON.parse(raw) : []
      const exists = list.some(t => Number(t.tmdbId) === Number(title.tmdbId))
      if (!exists) {
        list.push(title)
        if (typeof window !== 'undefined') localStorage.setItem('flico_watchlist', JSON.stringify(list))
      }
      return { ok: true, local: true }
    } catch {
      throw err
    }
  }
}

export async function removeFromWatchlist(supabase, tmdbId){
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('flico_watchlist') : null
      const list = raw ? JSON.parse(raw) : []
      const next = list.filter(t => Number(t.tmdbId) !== Number(tmdbId))
      if (typeof window !== 'undefined') localStorage.setItem('flico_watchlist', JSON.stringify(next))
      return { ok: true, local: true }
    } catch { throw new Error('Not authenticated') }
  }
  const token = session.access_token
  try{
    const res = await fetch(`/api/watchlist/${tmdbId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    const json = await res.json().catch(()=> ({}))
    if (!res.ok) throw new Error(json?.error || 'Remove failed')
    return json
  }catch(err){
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('flico_watchlist') : null
      const list = raw ? JSON.parse(raw) : []
      const next = list.filter(t => Number(t.tmdbId) !== Number(tmdbId))
      if (typeof window !== 'undefined') localStorage.setItem('flico_watchlist', JSON.stringify(next))
      return { ok: true, local: true }
    } catch {
      throw err
    }
  }
}
