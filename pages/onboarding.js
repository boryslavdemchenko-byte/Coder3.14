import { useState } from 'react'
import { useRouter } from 'next/router'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import Layout from '../components/Layout'

const GENRES = [
  { id: 'action', label: 'Action', emoji: '💥', bg: 'from-orange-900/50 to-red-900/50' },
  { id: 'comedy', label: 'Comedy', emoji: '😂', bg: 'from-yellow-900/50 to-orange-900/50' },
  { id: 'drama', label: 'Drama', emoji: '🎭', bg: 'from-purple-900/50 to-pink-900/50' },
  { id: 'scifi', label: 'Sci-Fi', emoji: '👽', bg: 'from-blue-900/50 to-indigo-900/50' },
  { id: 'horror', label: 'Horror', emoji: '👻', bg: 'from-gray-900/50 to-black/50' },
  { id: 'romance', label: 'Romance', emoji: '💖', bg: 'from-pink-900/50 to-rose-900/50' },
  { id: 'documentary', label: 'Documentary', emoji: '🧠', bg: 'from-emerald-900/50 to-teal-900/50' },
  { id: 'thriller', label: 'Thriller', emoji: '😱', bg: 'from-slate-900/50 to-gray-900/50' },
]

const SERVICES = [
  { id: 'netflix', label: 'Netflix', color: 'border-red-600' },
  { id: 'hulu', label: 'Hulu', color: 'border-green-500' },
  { id: 'disney', label: 'Disney+', color: 'border-blue-600' },
  { id: 'prime', label: 'Prime Video', color: 'border-blue-400' },
  { id: 'hbo', label: 'HBO Max', color: 'border-purple-600' },
  { id: 'apple', label: 'Apple TV+', color: 'border-gray-400' },
]

// Mood step removed per request

export default function Onboarding() {
  const router = useRouter()
  const user = useUser()
  const supabase = useSupabaseClient()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [selections, setSelections] = useState({
    genres: [],
    platforms: []
  })

  const toggleSelection = (category, id, max) => {
    setSelections(prev => {
      const current = prev[category]
      if (current.includes(id)) {
        return { ...prev, [category]: current.filter(item => item !== id) }
      } else {
        if (max && current.length >= max) return prev
        return { ...prev, [category]: [...current, id] }
      }
    })
  }

  const handleNext = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setStep(step + 1)
  }

  const handleFinish = async () => {
    setLoading(true)
    try {
      const payload = {
        genres: selections.genres,
        platforms: selections.platforms,
        services: selections.platforms
      }
      if (user) {
        const { error } = await supabase.auth.updateUser({
          data: {
            preferences: payload,
            onboarded: true
          }
        })
        if (error) throw error
      }
      // Also save to local storage as backup/guest mode
      localStorage.setItem('flico_preferences', JSON.stringify(payload))
      
      router.push('/recommendations')
    } catch (error) {
      console.error('Error saving preferences:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    router.push('/recommendations')
  }

  return (
    <Layout title="Welcome to Flico">
      <div className="max-w-3xl mx-auto py-12 px-4">
        {/* Progress Bar */}
        <div className="w-full bg-gray-800 h-1.5 rounded-full mb-12 relative overflow-hidden">
          <div 
            className="absolute top-0 left-0 bg-gradient-to-r from-blue-600 to-cyan-500 h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: step === 1 ? '50%' : '100%' }}
          ></div>
        </div>

        <div className="text-center mb-12 space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-sm text-gray-500">{`Step ${step} of 3`}</div>
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            {step === 1 ? 'What do you like to watch?' : 'Where do you watch?'}
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            {step === 1 
              ? 'Select up to 5 genres to help tailor recommendations.' 
              : 'Select your streaming platforms (1–5).'}
          </p>
        </div>

        {step === 1 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {GENRES.map(genre => (
              <button
                key={genre.id}
                onClick={() => toggleSelection('genres', genre.id, 5)}
                className={`
                  relative group p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-3 overflow-hidden
                  ${selections.genres.includes(genre.id)
                    ? 'border-blue-500 bg-blue-600/10 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] transform scale-[1.02]'
                    : 'border-gray-800 bg-gray-900/40 text-gray-400 hover:border-gray-600 hover:bg-gray-800 hover:-translate-y-1'
                  }
                `}
              >
                {/* Background Gradient for flair */}
                <div className={`absolute inset-0 bg-gradient-to-br ${genre.bg} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                
                <span className="text-4xl transform group-hover:scale-110 transition-transform duration-300">{genre.emoji}</span>
                <span className="font-semibold text-lg z-10">{genre.label}</span>
                
                {/* Checkmark */}
                <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${selections.genres.includes(genre.id) ? 'bg-blue-500 border-blue-500 scale-100' : 'border-gray-600 scale-0 opacity-0'}`}>
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
              </button>
            ))}
            <div className="col-span-2 md:col-span-4 text-center text-sm text-gray-400">{`${selections.genres.length} / 5 selected`}</div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {SERVICES.map(service => (
              <button
                key={service.id}
                onClick={() => {
                  toggleSelection('platforms', service.id, 5)
                }}
                className={`
                  relative p-6 rounded-2xl border-2 transition-all duration-300 h-32 flex items-center justify-center
                  ${selections.platforms.includes(service.id)
                    ? `${service.color} bg-white/5 text-white shadow-lg transform scale-[1.02]`
                    : 'border-gray-800 bg-gray-900/40 text-gray-400 hover:border-gray-600 hover:bg-gray-800 hover:-translate-y-1'
                  }
                `}
              >
                <span className="font-bold text-xl tracking-wide">{service.label}</span>
                
                {/* Checkmark */}
                <div className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${selections.platforms.includes(service.id) ? 'bg-white text-black border-white scale-100' : 'border-gray-600 scale-0 opacity-0'}`}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
              </button>
            ))}
            <div className="col-span-2 md:col-span-3 text-center text-sm text-gray-400">{`${selections.platforms.length} / 5 selected`}</div>
          </div>
        )}

        <div className="mt-16 flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
          <div className="flex items-center gap-4">
            {step > 1 && (
              <button
                onClick={()=>setStep(step-1)}
                className="px-6 py-3 border border-gray-700 rounded-2xl text-gray-300 hover:text-white hover:bg-gray-800 transition"
              >
                ← Back
              </button>
            )}
            <button 
              onClick={step < 2 ? handleNext : handleFinish} 
              className="px-16 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-blue-900/40 hover:-translate-y-1 hover:shadow-blue-900/60 focus:ring-4 focus:ring-blue-500/30"
              disabled={loading || (step===2 && (selections.platforms.length < 1))}
            >
              {loading ? 'Saving Profile...' : (step < 2 ? 'Next Step →' : 'Finish & Explore')}
            </button>
          </div>
          <button 
            onClick={handleSkip}
            className="text-gray-500 hover:text-white font-medium transition-colors text-sm"
          >
            Skip personalization for now
          </button>
        </div>
      </div>
    </Layout>
  )
}
