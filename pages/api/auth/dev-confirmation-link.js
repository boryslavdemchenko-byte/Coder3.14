import { createAdminClient } from '../../../lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  if (process.env.NODE_ENV === 'production') {
    res.status(404).json({ error: 'Not found' })
    return
  }

  const email = String(req.body?.email || '').trim().toLowerCase()
  if (!email) {
    res.status(400).json({ error: 'Email is required' })
    return
  }

  try {
    const supabase = createAdminClient()
    let foundUser = null
    let page = 1
    const perPage = 200
    while (!foundUser && page <= 20) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
      if (error) {
        res.status(400).json({ error: error.message || 'Could not list users' })
        return
      }
      foundUser = (data?.users || []).find((u) => (u.email || '').toLowerCase() === email) || null
      if ((data?.users || []).length < perPage) break
      page += 1
    }

    if (!foundUser) {
      res.status(404).json({ error: 'User not found for this email' })
      return
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(foundUser.id, {
      email_confirm: true,
    })
    if (updateError) {
      res.status(400).json({ error: updateError.message || 'Could not confirm email' })
      return
    }

    res.status(200).json({ ok: true })
    return
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Internal error' })
    return
  }
}
