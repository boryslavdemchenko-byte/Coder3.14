import Link from 'next/link'

export default function BackButton({ href = "/", label = "Back to Home" }) {
  return (
    <Link 
      href={href} 
      className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="20" 
        height="20" 
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
      <span className="font-medium">{label}</span>
    </Link>
  )
}
