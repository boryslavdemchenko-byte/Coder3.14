import { useEffect } from 'react'

export default function CookiePreferencesModal({ isOpen, onClose, prefs, setPrefs, onSave, onAcceptAll, onRejectNonEssential }) {
  useEffect(() => {
    if (!isOpen) return
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0f0f0f] border border-white/10 shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-lg">Cookie Preferences</h3>
            <p className="text-gray-400 text-sm mt-1">Control non-essential cookies used by Flico.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <PreferenceRow
            title="Essential"
            description="Required for core site functionality and security."
            checked
            disabled
          />
          <PreferenceRow
            title="Functional"
            description="Remembers your preferences and settings."
            checked={!!prefs.functional}
            onToggle={() => setPrefs((p) => ({ ...p, functional: !p.functional }))}
          />
          <PreferenceRow
            title="Analytics"
            description="Helps us understand usage to improve performance."
            checked={!!prefs.analytics}
            onToggle={() => setPrefs((p) => ({ ...p, analytics: !p.analytics }))}
          />
          <PreferenceRow
            title="Advertising"
            description="Supports relevant messaging where applicable."
            checked={!!prefs.advertising}
            onToggle={() => setPrefs((p) => ({ ...p, advertising: !p.advertising }))}
          />
        </div>

        <div className="px-6 py-5 border-t border-white/10 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onRejectNonEssential}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-200 hover:bg-white/10 transition text-sm font-semibold"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={onAcceptAll}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition text-sm font-bold"
            >
              Accept all
            </button>
          </div>
          <button
            type="button"
            onClick={onSave}
            className="px-5 py-2 rounded-xl bg-white text-black hover:bg-gray-200 transition text-sm font-bold"
          >
            Save preferences
          </button>
        </div>
      </div>
    </div>
  )
}

function PreferenceRow({ title, description, checked, onToggle, disabled }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl bg-black/20 border border-white/10 px-4 py-4">
      <div className="min-w-0">
        <div className="text-white font-semibold">{title}</div>
        <div className="text-gray-400 text-sm leading-relaxed mt-1">{description}</div>
      </div>
      <button
        type="button"
        onClick={disabled ? undefined : onToggle}
        className={`w-12 h-7 rounded-full relative transition border ${
          checked ? 'bg-blue-600 border-blue-500' : 'bg-gray-700 border-gray-600'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:brightness-110'}`}
        aria-pressed={checked}
        aria-label={`${title} cookies`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
        ></span>
      </button>
    </div>
  )
}

