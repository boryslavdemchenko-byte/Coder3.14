import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

export default function Callback(){
  const supabase = useSupabaseClient()
  const router = useRouter()
  const [msg, setMsg] = useState('Finalizing sign-in...')

  useEffect(()=>{
    let mounted = true
    async function finish(){
      try{
        const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true })
        if (error) throw error
        // Session stored, redirect
        router.replace('/profile')
      }catch(err){
        console.error('OAuth callback error', err)
        if (mounted) setMsg('Authentication failed. Please try again.')
      }
    }
    finish()
    return ()=>{ mounted = false }
  },[])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card p-6">
        <h2 className="text-lg font-semibold">{msg}</h2>
      </div>
    </div>
  )
}
