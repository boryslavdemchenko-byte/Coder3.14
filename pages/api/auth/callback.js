import { createServerClient, serializeCookieHeader } from '@supabase/ssr'

export default async function handler(req, res) {
  try {
    const code = req.query.code
    const next = req.query.next || '/onboarding'

    if (!code) {
      console.log('No code provided in callback')
      const qs = typeof req.url === 'string' && req.url.includes('?') ? req.url.split('?')[1] : ''
      if (qs) {
        res.redirect(`/auth/callback?${qs}`)
        return
      }
      res.redirect('/auth/login?error=no_code_provided')
      return
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return Object.keys(req.cookies || {}).map((name) => ({ name, value: req.cookies[name] || '' }))
          },
          setAll(cookiesToSet) {
            res.setHeader(
              'Set-Cookie',
              cookiesToSet.map(({ name, value, options }) => serializeCookieHeader(name, value, options))
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      console.log('Session exchanged successfully, redirecting to', next)
      res.redirect(next)
      return
    } else {
      console.error('Code exchange error:', error)
      if (
        error?.code === 'pkce_code_verifier_not_found' ||
        (error.message || '').toLowerCase().includes('code verifier') ||
        (error.message || '').toLowerCase().includes('pkce')
      ) {
        const qs = typeof req.url === 'string' && req.url.includes('?') ? req.url.split('?')[1] : ''
        if (qs) {
          res.redirect(`/auth/callback?${qs}`)
          return
        }
        res.redirect(`/auth/login?error=${encodeURIComponent('Verification failed. Please try again.')}`)
        return
      }
      res.redirect(`/auth/login?error=${encodeURIComponent(error.message)}`)
      return
    }
  } catch (err) {
    console.error('Unhandled callback error:', err)
    res.redirect(`/auth/login?error=${encodeURIComponent('Internal server error during auth')}`)
    return
  }
}
