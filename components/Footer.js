import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-800 bg-black/60 backdrop-blur-xl pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        {/* Brand */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">Flico</span>
          </Link>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Your personal cinematic companion. Track what you watch, discover new favorites, and share your passion for movies.
          </p>
        </div>

        {/* Explore */}
        <div>
          <h3 className="text-white font-bold mb-6">Explore</h3>
          <ul className="space-y-3 text-sm text-gray-400">
            <li><Link href="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
            <li><Link href="/recommendations" className="hover:text-blue-400 transition-colors">Recommendations</Link></li>
            <li><Link href="/watchlist" className="hover:text-blue-400 transition-colors">Your Watchlist</Link></li>
            <li><Link href="/new-releases" className="hover:text-blue-400 transition-colors">New Releases</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="text-white font-bold mb-6">Company</h3>
          <ul className="space-y-3 text-sm text-gray-400">
            <li><Link href="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
            <li><a href="https://donate.stripe.com/test_00w8wI2Sx6Kb6OU93X6Na00" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">Support Flico</a></li>
            <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Contact</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-white font-bold mb-6">Legal</h3>
          <ul className="space-y-3 text-sm text-gray-400">
            <li><Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
            <li><Link href="/cookies" className="hover:text-blue-400 transition-colors">Cookie Policy</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-gray-500 text-sm">
          &copy; {currentYear} Flico. All rights reserved.
        </p>
        <div className="flex gap-6">
          <a href="#" className="text-gray-500 hover:text-white transition-colors" aria-label="GitHub">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path></svg>
          </a>
        </div>
      </div>
    </footer>
  )
}
