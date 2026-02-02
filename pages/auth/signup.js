import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function SignUp(){
  const router = useRouter()
  useEffect(()=>{ router.replace('/auth/login?signup=true') }, [])
  return null
}
