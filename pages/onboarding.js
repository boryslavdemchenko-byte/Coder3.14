import { useRouter } from 'next/router'
import { useSupabaseClient, useUser } from './_app'
import Layout from '../components/Layout'
import MoviePreferenceQuiz from '../components/quiz/MoviePreferenceQuiz'
import { useState } from 'react'

export default function Onboarding() {
  const router = useRouter()
  const user = useUser()
  const supabase = useSupabaseClient()
  const [loading, setLoading] = useState(false)

  const handleFinish = async (results) => {
    // If results is null, user skipped
    setLoading(true)
    try {
      if (user) {
        // Save quiz results if available, otherwise just mark onboarded
        const updateData = { onboarded: true }
        if (results) {
            updateData.quiz_results = results
            updateData.archetype = results.primary?.id
        }
        
        const { error } = await supabase.auth.updateUser({
          data: updateData
        })
        if (error) throw error
      }
      
      if (results) {
          localStorage.setItem('flico_quiz_results', JSON.stringify(results))
      }
      
      router.push('/recommendations')
    } catch (error) {
      console.error('Error completing onboarding:', error)
      // Even if error, try to redirect
      router.push('/recommendations')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Welcome to Flico" hideHeader={true}>
      <div className="min-h-screen bg-black text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
            <MoviePreferenceQuiz onFinish={handleFinish} />
        </div>
      </div>
    </Layout>
  )
}
