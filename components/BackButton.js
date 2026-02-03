import Link from 'next/link'

export default function BackButton({ href = "/", label = "Home" }) {
  return (
    <Link 
      href={href} 
      className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all rounded-full group border border-white/5 hover:border-white/20"
      aria-label="Go back to home"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="18" 
        height="18" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="group-hover:-translate-x-1 transition-transform"
      >
        <path d="M19 12H5"/>
        <path d="M12 19l-7-7 7-7"/>
      </svg>
      <span className="font-medium text-sm">{label}</span>
    </Link>
  )
}
