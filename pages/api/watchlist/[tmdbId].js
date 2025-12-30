import { createAdminClient } from '../../../lib/supabaseClient'
import prisma from '../../../lib/prisma'

export default async function handler(req, res){
  const { tmdbId } = req.query
  if (req.method !== 'DELETE') return res.status(405).end()

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

    // Find title by tmdbId
    const title = await prisma.title.findUnique({ where: { tmdbId: Number(tmdbId) } })
    if (!title) return res.status(404).json({ error: 'Title not found' })

    // Delete watchlist item
    const deleted = await prisma.watchlistItem.deleteMany({ where: { userId: user.id, titleId: title.id } })
    return res.status(200).json({ ok: true, deletedCount: deleted.count })
  }catch(err){
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
