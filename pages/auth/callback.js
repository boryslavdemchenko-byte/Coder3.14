import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSupabaseClient } from '../../pages/_app'

export default function Callback(){
  const supabase = useSupabaseClient()
  const router = useRouter()
  const [msg, setMsg] = useState('Finalizing sign-in...')

  useEffect(()=>{
    if (!router.isReady) return
    let mounted = true
    
    async function finish(){
      try{
        const next = typeof router.query.next === 'string' && router.query.next.length > 0 ? router.query.next : '/onboarding'
        const { error: errorDesc, error_description } = router.query
        if (errorDesc || error_description) {
           throw new Error(error_description || errorDesc || 'Auth callback error')
        }

        const code = typeof router.query.code === 'string' ? router.query.code : ''
        const token_hash = typeof router.query.token_hash === 'string' ? router.query.token_hash : ''
        const type = typeof router.query.type === 'string' ? router.query.type : ''
        const otpType =
          type === 'signup' || type === 'recovery' || type === 'magiclink' || type === 'invite' || type === 'email_change'
            ? type
            : ''

        if (token_hash && otpType) {
          const { error } = await supabase.auth.verifyOtp({ type: otpType, token_hash })
          if (error) throw error
          router.replace(next)
          return
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
          router.replace(next)
          return
        }

        const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true })
        if (error) throw error
        
        if (data?.session) {
           router.replace(next)
        } else {
           setTimeout(() => {
             if (mounted) router.replace(next)
           }, 2000)
        }

      }catch(err){
        console.error('OAuth callback error', err)
        
        const message = err?.message || 'Unknown error'
        if (message.toLowerCase().includes('code verifier') || message.toLowerCase().includes('pkce')) {
          if (mounted) setMsg('Verification failed. Open the link in the same browser where you started the flow, then try again.')
          return
        }

        if (mounted) setMsg('Authentication failed: ' + message)
      }
    }
    
    finish()
    return ()=>{ mounted = false }
  },[router.isReady, router.query, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card p-6">
        <h2 className="text-lg font-semibold">{msg}</h2>
      </div>
    </div>
  )
}
