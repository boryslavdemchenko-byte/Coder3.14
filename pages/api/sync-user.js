import { createAdminClient } from '../../lib/supabaseClient'
import prisma from '../../lib/prisma'

export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).end()

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

    // Upsert into Postgres via Prisma and set syncedAt timestamp
    const dbUser = await prisma.user.upsert({
      where: { id: user.id },
      update: { email: user.email, name: user.user_metadata?.full_name || user.user_metadata?.name || null, syncedAt: new Date() },
      create: { id: user.id, email: user.email, name: user.user_metadata?.full_name || user.user_metadata?.name || null, syncedAt: new Date() }
    })

    return res.status(200).json({ ok: true, user: dbUser })
  }catch(err){
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
