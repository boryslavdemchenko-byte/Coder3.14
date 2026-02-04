import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'

export default function RedirectModal({ isOpen, onClose, onConfirm, url }) {
  const [mounted, setMounted] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const hasRedirectedRef = useRef(false)
  const timerRef = useRef(null)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setCountdown(5)
      hasRedirectedRef.current = false
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            if (!hasRedirectedRef.current) {
              hasRedirectedRef.current = true
              onConfirm()
              onClose()
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [isOpen, onConfirm, onClose])

  if (!isOpen || !mounted) return null

  const handleManualRedirect = () => {
    if (hasRedirectedRef.current) return
    hasRedirectedRef.current = true
    clearInterval(timerRef.current)
    onConfirm()
    onClose()
  }

  return createPortal(
    <div className="font-sans fixed top-24 right-6 z-[9999] w-80 bg-[#18181b] rounded-xl shadow-2xl border border-white/10 p-4 animate-in slide-in-from-right-10 fade-in duration-300">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">Leaving Flico</h3>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            Redirecting to external site in <span className="text-blue-400 font-bold">{countdown}s</span>...
          </p>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mt-3 w-full bg-white/10 h-1 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-all duration-1000 ease-linear" 
          style={{ width: `${(countdown / 5) * 100}%` }} 
        />
      </div>

      <div className="flex gap-2 justify-end mt-4">
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleManualRedirect}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20"
        >
          Go Now
        </button>
      </div>
    </div>,
    document.body
  )
}
