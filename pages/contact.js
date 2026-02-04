import { useState } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'

export default function Contact() {
  const email = "hello.flico.mv@outlook.com"
  const [copied, setCopied] = useState(false)

  const handleCopy = (e) => {
    // We don't preventDefault so the mailto link still works
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // Structured Data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact Flico",
    "description": "Contact Flico support for feedback, inquiries, or assistance.",
    "mainEntity": {
      "@type": "Organization",
      "name": "Flico",
      "email": email,
      "contactPoint": {
        "@type": "ContactPoint",
        "email": email,
        "contactType": "customer support"
      }
    }
  }

  return (
    <Layout title="Contact Us - Flico">
      <Head>
        <title>Contact Us - Flico</title>
        <meta name="description" content="Get in touch with Flico support. We are here to help with any questions or feedback." />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <div className="min-h-[60vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full space-y-8">
          
          {/* Header Section */}
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 sm:text-5xl tracking-tight mb-4">
              Get in Touch
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              We’d love to hear from you. Whether you have a question about features, feedback, or need support, our team is ready to answer all your questions.
            </p>
          </div>

          {/* Contact Card */}
          <div className="mt-10">
            <div className="relative group rounded-2xl p-[1px] bg-gradient-to-r from-white/10 to-white/5 hover:from-blue-500/50 hover:to-purple-500/50 transition-all duration-300 shadow-2xl shadow-black/50">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
              
              <div className="relative bg-[#0a0a0a] rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
                
                {/* Decorative Background Element */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
                
                <div className="flex items-center gap-6 z-10">
                  <div className="flex-shrink-0 bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  
                  <div className="text-left">
                    <h2 className="text-xl font-semibold text-white">Email Support</h2>
                    <p className="text-gray-400 mt-1">Our team typically responds within 24 hours.</p>
                  </div>
                </div>

                <a 
                  href={`mailto:${email}`}
                  onClick={handleCopy}
                  className={`z-10 flex items-center gap-2 px-6 py-3 font-bold rounded-xl transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white ${
                    copied 
                      ? 'bg-green-500 text-white hover:bg-green-600' 
                      : 'bg-white text-black hover:bg-gray-200'
                  }`}
                  aria-label={`Send an email to ${email}`}
                >
                  <span>{copied ? 'Copied to Clipboard!' : email}</span>
                  {copied ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  )}
                </a>
              </div>
            </div>
          </div>

          {/* Additional Info / Footer text */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              By contacting us, you agree to our <span className="text-gray-400 hover:text-white cursor-pointer transition-colors">Terms of Service</span> and <span className="text-gray-400 hover:text-white cursor-pointer transition-colors">Privacy Policy</span>.
            </p>
          </div>

        </div>
      </div>
    </Layout>
  )
}
