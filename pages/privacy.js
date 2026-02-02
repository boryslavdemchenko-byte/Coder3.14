import Layout from '../components/Layout'

export default function Privacy() {
  return (
    <Layout title="Privacy Policy - Flico">
      <div className="max-w-3xl mx-auto prose prose-invert">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-400 mb-4">1. Information We Collect</h2>
          <p className="text-gray-300 leading-relaxed">
            We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us. This may include your name, email address, and movie preferences.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-400 mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-300 leading-relaxed">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 text-gray-300 space-y-2 mt-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Personalize your experience and provide movie recommendations</li>
            <li>Send you technical notices and support messages</li>
            <li>Monitor and analyze trends and usage</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-400 mb-4">3. Cookies</h2>
          <p className="text-gray-300 leading-relaxed">
            We use cookies to help us understand how you interact with our website and to improve your experience. You can control cookies through your browser settings.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-400 mb-4">4. Contact Us</h2>
          <p className="text-gray-300 leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us at support@flico.app.
          </p>
        </section>
      </div>
    </Layout>
  )
}
