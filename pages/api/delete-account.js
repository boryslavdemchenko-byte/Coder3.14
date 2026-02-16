import { createAdminClient } from '../../lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const authHeader = req.headers.authorization || ''
  const match = authHeader.match(/^Bearer (.+)$/)
  if (!match) return res.status(401).json({ error: 'Missing access token' })
  const token = match[1]

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.auth.getUser(token)
    if (error) return res.status(401).json({ error: error.message })
    const user = data.user
    if (!user) return res.status(404).json({ error: 'User not found' })

    const userId = user.id

    try {
      const prisma = (await import('../../lib/prisma')).default

      try {
        await prisma.watchlistItem.deleteMany({ where: { userId } })
      } catch {}

      try {
        await prisma.subscription.deleteMany({ where: { userId } })
      } catch {}

      try {
        await prisma.auditLog.deleteMany({ where: { userId } })
      } catch {}

      try {
        await prisma.user.delete({ where: { id: userId } })
      } catch {}
    } catch {}

    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)
    if (deleteError) return res.status(500).json({ error: deleteError.message })

    return res.status(200).json({ ok: true })
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Delete failed' })
  }
}
