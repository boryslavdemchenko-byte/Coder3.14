import Layout from '../components/Layout'
import Link from 'next/link'

export default function About() {
  return (
    <Layout title="About - Flico">
      <div className="max-w-3xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-white mb-4">About Flico</h1>
        <p className="text-gray-400 mb-6">
          Flico is your personal cinematic companion. Track what you watch, discover new favorites,
          and make better decisions about where to stream.
        </p>
        <p className="text-gray-400">
          Built with a focus on privacy, accessibility, and a clean user experience.
          Have feedback? <Link href="/contact" className="text-blue-400 hover:text-blue-300">Contact us</Link>.
        </p>
      </div>
    </Layout>
  )
}
