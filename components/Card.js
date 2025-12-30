import Link from 'next/link'
export default function Card({item, inWatchlist=false, onToggleWatchlist}){
  return (
    <div className="card flex gap-4">
      <img src={item.poster || '/assets/poster-placeholder.svg'} alt={item.title || 'Poster'} loading="lazy" className="w-24 h-36 object-cover rounded" />
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-semibold">{item.title}</div>
            <div className="small-muted">{item.genre} · {item.year}</div>
          </div>
          <div className="pill" aria-hidden>{item.match}%</div>
        </div>
        <div className="mt-4 flex gap-2">
          <Link href={`/title/${item.id}`} className="px-3 py-2 border rounded text-sm" style={{borderColor:'var(--border)'}}>Info</Link>
          <button aria-pressed={inWatchlist} onClick={()=>onToggleWatchlist && onToggleWatchlist(item)} className={`px-3 py-2 rounded text-sm ${inWatchlist ? 'bg-white border text-accent' : 'bg-accent text-white'}`}>
            {inWatchlist ? 'Added' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}
