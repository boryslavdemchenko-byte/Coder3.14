import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/Layout'

export default function About() {
  // Structured Data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About Flico",
    "description": "Learn about Flico, the ultimate platform for movie and TV show discovery, tracking, and AI-powered recommendations.",
    "mainEntity": {
      "@type": "Organization",
      "name": "Flico",
      "slogan": "Your Ultimate Watchlist Companion"
    }
  }

  const features = [
    {
      title: "Smart Discovery",
      description: "Stop scrolling and start watching. Our AI-powered engine learns your taste to suggest hidden gems and trending hits you'll actually love.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      title: "Universal Watchlist",
      description: "Keep track of everything in one place. Whether it's on Netflix, Disney+, or in theaters, add it to your Flico list and never forget a title again.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      )
    },
    {
      title: "Social Connection",
      description: "Movies are better together. Share your lists, see what friends are watching, and spark conversations about the stories that move you.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ]

  return (
    <Layout title="About Us - Flico">
      <Head>
        <title>About Us - Flico</title>
        <meta name="description" content="Discover Flico's mission to revolutionize how you find, track, and share movies and TV shows." />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-20">
          
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-gray-400 sm:text-6xl tracking-tight">
              Reimagining <br className="hidden sm:block" />
              Entertainment Discovery
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Flico is your ultimate companion for the streaming age. We combine powerful AI with sleek design to help you spend less time searching and more time watching.
            </p>
          </div>

          {/* Mission Card */}
          <div className="relative group rounded-3xl p-[1px] bg-gradient-to-br from-white/10 to-white/5 hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-500 shadow-2xl shadow-black/50">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
            
            <div className="relative bg-[#0a0a0a]/90 backdrop-blur-sm rounded-3xl p-8 sm:p-12 overflow-hidden">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-white">Our Mission</h2>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    In a world with endless content, finding what to watch shouldn't feel like a chore. We built Flico to bring clarity to the chaos. 
                  </p>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    Whether you're a casual viewer or a dedicated cinephile, our goal is to provide a seamless, personalized, and social experience that connects you with the stories that matter.
                  </p>
                </div>
                <div className="relative h-64 w-full rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden border border-white/10 flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-500">
                   {/* Abstract Visual Representation */}
                   <div className="absolute inset-0 bg-[url('/assets/grid-pattern.svg')] opacity-20"></div>
                   <div className="w-24 h-24 bg-blue-500/20 rounded-full blur-2xl absolute top-1/4 left-1/4 animate-pulse"></div>
                   <div className="w-32 h-32 bg-purple-500/20 rounded-full blur-3xl absolute bottom-1/4 right-1/4 animate-pulse delay-700"></div>
                   <div className="z-10 text-center">
                      <span className="text-5xl font-bold text-white/10 tracking-widest">FLICO</span>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group relative rounded-2xl p-[1px] bg-gradient-to-b from-white/10 to-transparent hover:from-blue-500/40 hover:to-purple-500/10 transition-all duration-300">
                <div className="h-full bg-[#0f0f0f] rounded-2xl p-8 hover:bg-[#151515] transition-colors duration-300">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-white mb-8">Ready to dive in?</h2>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold text-lg rounded-full hover:bg-gray-200 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
            >
              Start Exploring
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

        </div>
      </div>
    </Layout>
  )
}
