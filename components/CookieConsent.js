import { useState, useEffect } from 'react'
import Link from 'next/link'
import CookiePreferencesModal from './CookiePreferencesModal'

export default function CookieConsent() {
  const [show, setShow] = useState(false)
  const [prefsOpen, setPrefsOpen] = useState(false)
  const [prefs, setPrefs] = useState({ essential: true, functional: true, analytics: false, advertising: false })

  useEffect(() => {
    const consent = localStorage.getItem('flico_cookie_consent')
    if (!consent) {
      setShow(true)
    }

    const existing = localStorage.getItem('flico_cookie_prefs')
    if (existing) {
      try {
        const parsed = JSON.parse(existing)
        setPrefs({ essential: true, functional: !!parsed.functional, analytics: !!parsed.analytics, advertising: !!parsed.advertising })
      } catch (_) {
        setPrefs({ essential: true, functional: true, analytics: false, advertising: false })
      }
    }
  }, [])

  useEffect(() => {
    function onOpenPrefs() {
      setPrefsOpen(true)
    }
    window.addEventListener('flico:open-cookie-preferences', onOpenPrefs)
    return () => window.removeEventListener('flico:open-cookie-preferences', onOpenPrefs)
  }, [])

  const persist = (nextPrefs) => {
    localStorage.setItem('flico_cookie_consent', 'true')
    localStorage.setItem(
      'flico_cookie_prefs',
      JSON.stringify({ functional: !!nextPrefs.functional, analytics: !!nextPrefs.analytics, advertising: !!nextPrefs.advertising })
    )
  }

  const acceptAll = () => {
    const next = { essential: true, functional: true, analytics: true, advertising: true }
    setPrefs(next)
    persist(next)
    setShow(false)
    setPrefsOpen(false)
  }

  const rejectNonEssential = () => {
    const next = { essential: true, functional: false, analytics: false, advertising: false }
    setPrefs(next)
    persist(next)
    setShow(false)
    setPrefsOpen(false)
  }

  const save = () => {
    const next = { ...prefs, essential: true }
    setPrefs(next)
    persist(next)
    setShow(false)
    setPrefsOpen(false)
  }

  return (
    <>
      <CookiePreferencesModal
        isOpen={prefsOpen}
        onClose={() => setPrefsOpen(false)}
        prefs={prefs}
        setPrefs={setPrefs}
        onSave={save}
        onAcceptAll={acceptAll}
        onRejectNonEssential={rejectNonEssential}
      />
      {show && (
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
                onClick={() => setPrefsOpen(true)}
                className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-full transition border border-white/10"
              >
                Manage
              </button>
              <button 
                onClick={acceptAll}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-full transition shadow-lg shadow-blue-900/20"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
