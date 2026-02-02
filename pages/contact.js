import Layout from '../components/Layout'

export default function Contact() {
  return (
    <Layout title="Contact - Flico">
      <div className="max-w-3xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-white mb-4">Contact</h1>
        <p className="text-gray-400 mb-6">We’d love to hear from you. Send feedback or support requests via email.</p>
        <div className="card flex-col">
          <p className="text-gray-300">Email: support@flico.example</p>
        </div>
      </div>
    </Layout>
  )
}
