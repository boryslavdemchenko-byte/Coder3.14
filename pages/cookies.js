import Layout from '../components/Layout'
import Link from 'next/link'

export default function Cookies() {
  return (
    <Layout title="Cookies - Flico">
      <div className="max-w-3xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-white mb-4">Cookie Policy</h1>
        <p className="text-gray-400 mb-6">
          We use cookies to improve functionality and provide personalized recommendations. 
          Review our <Link href="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</Link> for details.
        </p>
      </div>
    </Layout>
  )
}
