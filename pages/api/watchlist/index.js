import { createAdminClient } from '../../../lib/supabaseClient'
import prisma from '../../../lib/prisma'

export default async function handler(req, res){
  const method = req.method
  if (method === 'GET'){
    // GET /api/watchlist -> list current user's watchlist
    const authHeader = req.headers.authorization || ''
    const match = authHeader.match(/^Bearer (.+)$/)
    if (!match) return res.status(401).json({ error: 'Missing access token' })
    const token = match[1]
    try{
      const supabase = createAdminClient()
      const { data, error } = await supabase.auth.getUser(token)
      if (error) return res.status(401).json({ error: error.message })
      const user = data.user
      if (!user) return res.status(404).json({ error: 'User not found' })

      const items = await prisma.watchlistItem.findMany({ where: { userId: user.id }, include: { title: true } })
      return res.status(200).json({ ok: true, items })
    }catch(err){
      console.error(err)
      return res.status(500).json({ error: err.message })
    }
  }

  if (method === 'POST'){
    // POST /api/watchlist -> add an item
    const authHeader = req.headers.authorization || ''
    const match = authHeader.match(/^Bearer (.+)$/)
    if (!match) return res.status(401).json({ error: 'Missing access token' })
    const token = match[1]
    try{
      const supabase = createAdminClient()
      const { data, error } = await supabase.auth.getUser(token)
      if (error) return res.status(401).json({ error: error.message })
      const user = data.user
      if (!user) return res.status(404).json({ error: 'User not found' })

      const { title } = req.body || {}
      if (!title || !title.tmdbId) return res.status(400).json({ error: 'title.tmdbId is required' })

      // Upsert Title by tmdbId
      const dbTitle = await prisma.title.upsert({
        where: { tmdbId: title.tmdbId },
        update: { title: title.title, poster: title.poster, genre: title.genre, year: title.year, type: title.type },
        create: { tmdbId: title.tmdbId, title: title.title, poster: title.poster, genre: title.genre, year: title.year, type: title.type }
      })

      // Check if watchlist item exists
      const exists = await prisma.watchlistItem.findFirst({ where: { userId: user.id, titleId: dbTitle.id } })
      if (exists) return res.status(200).json({ ok: true, item: exists })

      const item = await prisma.watchlistItem.create({ data: { userId: user.id, titleId: dbTitle.id } })
      return res.status(201).json({ ok: true, item })
    }catch(err){
      console.error(err)
      return res.status(500).json({ error: err.message })
    }
  }

  return res.status(405).end()
}
