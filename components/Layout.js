import Head from 'next/head'
import Header from './Header'
import Footer from './Footer'
import CookieConsent from './CookieConsent'
import FlicoWidget from './FlicoWidget'

export default function Layout({ children, title = 'Flico - Your Ultimate Movie Tracker', background = 'bg-[var(--bg)]' }) {
  return (
    <div className={`min-h-screen ${background} text-[var(--text-primary)] flex flex-col font-sans selection:bg-blue-500/30`}>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
        {children}
      </main>

      <Footer />

      <CookieConsent />
      <FlicoWidget />
    </div>
  )
}
