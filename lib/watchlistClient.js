// Minimal client helper for watchlist API calls
export async function fetchWatchlist(supabase){
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return []
  const token = session.access_token
  const res = await fetch('/api/watchlist', { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) return []
  const json = await res.json()
  return json.items || []
}

export async function addToWatchlist(supabase, title){
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')
  const token = session.access_token
  const res = await fetch('/api/watchlist', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ title }) })
  if (!res.ok) throw new Error('Add failed')
  return res.json()
}

export async function removeFromWatchlist(supabase, tmdbId){
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')
  const token = session.access_token
  const res = await fetch(`/api/watchlist/${tmdbId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error('Remove failed')
  return res.json()
}