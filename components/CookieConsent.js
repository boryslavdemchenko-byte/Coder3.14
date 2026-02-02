import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('flico_cookie_consent')
    if (!consent) {
      setShow(true)
    }
  }, [])

  const accept = () => {
    localStorage.setItem('flico_cookie_consent', 'true')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-gray-800 p-4 z-50 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-gray-300 text-sm text-center md:text-left">
          <p>
            We use cookies to enhance your cinematic experience and provide personalized recommendations. 
            By continuing, you agree to our <Link href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={accept}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-full transition shadow-lg shadow-blue-900/20"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
