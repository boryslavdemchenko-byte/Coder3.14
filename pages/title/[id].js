import Header from '../../components/Header'
import { useRouter } from 'next/router'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useEffect, useState, useRef } from 'react'
import { addToWatchlist, removeFromWatchlist, fetchWatchlist } from '../../lib/watchlistClient'
import BackButton from '../../components/BackButton'
import * as tmdb from '../../lib/tmdb'
import Link from 'next/link'
import Toast from '../../components/Toast'

export default function Title() {
  const router = useRouter()
  const { id, type: typeParam } = router.query
  const supabase = useSupabaseClient()
  const user = useUser()
  
  // State
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [inWatchlist, setInWatchlist] = useState(false)
  const [wlLoading, setWlLoading] = useState(false)
  const [toastMsg, setToastMsg] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [showTrailer, setShowTrailer] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState(null)
  
  // Refs
  const headingRef = useRef(null)

  // Initial Load
  useEffect(() => {
    if (!id) return
    setLoading(true)
    tmdb.getTitleDetails(id, typeof typeParam === 'string' ? typeParam : undefined)
      .then(d => {
        setDetails(d)
        if (d?.videos?.length > 0) {
           const trailer = d.videos.find(v => v.type === 'Trailer') || d.videos[0]
           setSelectedVideo(trailer)
        }
        setLoading(false)
        headingRef.current?.focus()
        

      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [id, typeParam])

  // Watchlist Check
  useEffect(() => {
    if (!user || !id) {
      setInWatchlist(false)
      return
    }
    fetchWatchlist(supabase).then(items => {
      const ids = items.map(i => i.title.tmdbId)
      setInWatchlist(ids.includes(Number(id)))
    }).catch(() => setInWatchlist(false))
  }, [user, id, supabase])

  // Handlers
  const handleWatchlistToggle = async () => {
    if (!user) return router.push('/auth/login')
    setWlLoading(true)
    try {
      if (!inWatchlist) {
        await addToWatchlist(supabase, { 
          tmdbId: Number(id), 
          title: details?.title || '', 
          poster: details?.poster || null, 
          genre: (details?.genres || []).join(','), 
          year: details?.year || '', 
          type: details?.type 
        })
        setInWatchlist(true)
        setToastMsg('Added to Watchlist')
      } else {
        await removeFromWatchlist(supabase, Number(id))
        setInWatchlist(false)
        setToastMsg('Removed from Watchlist')
      }
    } catch (err) {
      setToastMsg('Failed to update watchlist')
    } finally {
      setWlLoading(false)
    }
  }

  const formatRuntime = (mins) => {
    if (!mins) return ''
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${h}h ${m}m`
  }

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
  }

  if (loading || !details) return (
    <div className="min-h-screen bg-[#141414]">
      <Header />
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  )

  const backdropUrl = details.backdrop || details.poster
  const typeLabel = details.type === 'movie' ? 'Movie' : 'Series'
  
  return (
    <div className="min-h-screen bg-[#141414] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      <Header />
      
      {/* Hero Section */}
      <div className="relative w-full min-h-[85vh] md:min-h-[75vh] bg-black transition-all duration-500 flex flex-col justify-end">
        {showTrailer && selectedVideo ? (
          <div className="absolute inset-0 z-50 animate-in fade-in zoom-in-95 duration-500">
             <iframe 
               src={`https://www.youtube.com/embed/${selectedVideo.key}?autoplay=1&rel=0&modestbranding=1`} 
               title="Trailer" 
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
               allowFullScreen
               className="w-full h-full"
             />
             <button 
               onClick={() => setShowTrailer(false)}
               className="absolute top-24 right-6 md:top-8 md:right-8 z-50 px-5 py-2.5 bg-black/60 hover:bg-red-600 backdrop-blur-md border border-white/10 rounded-full text-white font-bold transition-all flex items-center gap-2 group shadow-xl"
             >
               <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               Close Trailer
             </button>
          </div>
        ) : (
          <>
            {/* Backdrop */}
            <div className="absolute inset-0">
          <img 
            src={backdropUrl} 
            alt="Backdrop" 
            className="w-full h-full object-cover opacity-50 mask-image-gradient"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full h-full flex items-end pt-32 md:pt-48">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full grid md:grid-cols-[250px_1fr] lg:grid-cols-[300px_1fr] gap-8 md:gap-12 items-end pb-12">
            {/* Poster (Hidden on mobile hero, shown in body) */}
            <div className="hidden md:block relative w-full rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 group aspect-[2/3]">
              <img src={details.poster} alt={details.title} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
            </div>

            {/* Info */}
            <div className="space-y-4 md:space-y-6">
               <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-gray-300">
                  <span className="bg-white/10 backdrop-blur px-2 py-0.5 rounded text-white">{typeLabel}</span>
                  {details.certification && <span className="border border-gray-500 px-2 py-0.5 rounded text-gray-300">{details.certification}</span>}
                  <span>{details.year}</span>
                  {details.runtime && (
                    <>
                      <span className="w-1 h-1 bg-gray-500 rounded-full" />
                      <span>{formatRuntime(details.runtime)}</span>
                    </>
                  )}
               </div>

               <h1 ref={headingRef} className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
                 {details.title}
               </h1>

               {details.tagline && <p className="text-xl text-gray-400 italic font-light">"{details.tagline}"</p>}

               {/* Rating & Genres */}
               <div className="flex flex-wrap items-center gap-6">
                 {details.rating > 0 && (
                   <div className="flex items-center gap-2">
                     <svg className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                     <span className="text-2xl font-bold">{details.rating.toFixed(1)}</span>
                     <span className="text-xs text-gray-500 flex flex-col -mt-1">
                       <span>/10</span>
                       <span>{details.voteCount} votes</span>
                     </span>
                   </div>
                 )}
                 <div className="flex flex-wrap gap-2">
                   {details.genres.map(g => (
                     <span key={g} className="text-sm text-blue-400 hover:text-blue-300 transition cursor-pointer">#{g}</span>
                   ))}
                 </div>
               </div>

               {/* Actions */}
               <div className="flex flex-wrap items-center gap-4 pt-4">
                 {selectedVideo && (
                   <button 
                     onClick={() => setShowTrailer(true)}
                     className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-3 transition-all hover:scale-105 shadow-lg shadow-blue-600/20"
                   >
                     <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                     Watch Trailer
                   </button>
                 )}
                 <button 
                   onClick={handleWatchlistToggle}
                   disabled={wlLoading}
                   className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all border ${inWatchlist ? 'bg-green-600/20 border-green-500 text-green-500' : 'bg-white/10 border-white/10 hover:bg-white/20 text-white'}`}
                 >
                   {inWatchlist ? (
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                   ) : (
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                   )}
                   {inWatchlist ? 'Added to Watchlist' : 'Add to Watchlist'}
                 </button>
                 {/* Share */}
                 <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition" title="Share">
                   <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                 </button>
               </div>
            </div>
          </div>
        </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 md:gap-12">
        
        {/* Left Column */}
        <div className="space-y-12">
          
          {/* Overview */}
          <section>
            <h3 className="text-2xl font-bold mb-4">Overview</h3>
            <p className="text-gray-300 leading-relaxed text-lg">{details.overview}</p>
            {details.directors?.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-4 pt-6 border-t border-white/5">
                 {details.directors.map(d => (
                   <div key={d}>
                     <span className="block text-sm text-gray-500">Director</span>
                     <span className="font-medium">{d}</span>
                   </div>
                 ))}
              </div>
            )}
          </section>

          {/* Cast */}
          {details.cast?.length > 0 && (
            <section>
              <h3 className="text-2xl font-bold mb-6">Top Cast</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {details.cast.slice(0, 12).map(c => (
                  <div 
                    key={c.id} 
                    className="group w-full text-left"
                  >
                    <div className="aspect-[2/3] rounded-xl overflow-hidden bg-[#1f1f1f] mb-3 shadow-lg relative">
                      {c.profile ? (
                        <img src={c.profile} alt={c.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-base text-white truncate">{c.name}</div>
                    <div className="text-sm text-gray-400 truncate">{c.character}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Inline Actor Details Section - Removed */}
          
          {/* Media Tabs */}
          <section>
             <div className="flex items-center gap-8 border-b border-white/10 mb-6">
                <button 
                  onClick={() => setActiveTab('videos')}
                  className={`pb-4 text-lg font-medium transition ${activeTab === 'videos' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
                >
                  Videos <span className="text-xs bg-white/10 px-2 py-0.5 rounded ml-2">{details.videos.length}</span>
                </button>
                <button 
                  onClick={() => setActiveTab('images')}
                  className={`pb-4 text-lg font-medium transition ${activeTab === 'images' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
                >
                  Backdrops <span className="text-xs bg-white/10 px-2 py-0.5 rounded ml-2">{details.images.length}</span>
                </button>
             </div>

             {activeTab === 'videos' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {details.videos.map(v => (
                   <div key={v.id} className="group cursor-pointer" onClick={() => { 
                     setSelectedVideo(v); 
                     setShowTrailer(true); 
                     window.scrollTo({ top: 0, behavior: 'smooth' });
                   }}>
                      <div className="aspect-video bg-black/40 rounded-lg overflow-hidden relative border border-white/5 group-hover:border-blue-500/50 transition">
                         <img 
                           src={`https://img.youtube.com/vi/${v.key}/hqdefault.jpg`} 
                           alt={v.name} 
                           className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
                         />
                         <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center group-hover:scale-110 transition backdrop-blur-sm">
                              <svg className="w-5 h-5 fill-white ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            </div>
                         </div>
                      </div>
                      <h4 className="mt-2 font-medium text-sm text-gray-300 group-hover:text-blue-400 transition truncate">{v.name}</h4>
                      <p className="text-xs text-gray-500">{v.type}</p>
                   </div>
                 ))}
                 {details.videos.length === 0 && <p className="text-gray-500 italic">No videos available.</p>}
               </div>
             )}

             {activeTab === 'images' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {details.images.map((img, idx) => (
                   <div key={idx} className="aspect-video rounded-lg overflow-hidden border border-white/5 hover:border-white/20 transition">
                     <img src={img} alt="Backdrop" className="w-full h-full object-cover" loading="lazy" />
                   </div>
                 ))}
                 {details.images.length === 0 && <p className="text-gray-500 italic">No images available.</p>}
               </div>
             )}
          </section>
          
          {/* Similar / Recommendations */}
          <section>
            <h3 className="text-2xl font-bold mb-6">More Like This</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
               {[...details.recommendations, ...details.similar].slice(0, 10).map(item => (
                 <Link href={`/title/${item.id}?type=${item.type}`} key={item.id} className="group block">
                   <div className="aspect-[2/3] rounded-lg overflow-hidden bg-white/5 relative mb-2 shadow-lg ring-1 ring-white/5 group-hover:ring-blue-500/50 transition">
                      {item.poster ? (
                        <img src={item.poster} alt={item.title} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-gray-500 text-xs">
                           <span>No Image</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-1.5 py-0.5 rounded text-[10px] font-bold">
                        {item.rating?.toFixed(1) || 'NR'}
                      </div>
                   </div>
                   <h4 className="font-medium text-sm truncate group-hover:text-blue-400 transition">{item.title}</h4>
                   <p className="text-xs text-gray-500">{item.year}</p>
                 </Link>
               ))}
            </div>
            {details.recommendations.length === 0 && details.similar.length === 0 && (
               <p className="text-gray-500 italic">No similar titles found.</p>
            )}
          </section>

        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
           
           {/* Where to Watch */}
           <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/5">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                Where to Watch
              </h3>
              {details.watchProviders && (details.watchProviders.flatrate?.length > 0 || details.watchProviders.rent?.length > 0 || details.watchProviders.buy?.length > 0) ? (
                 <div className="space-y-4">
                    {details.watchProviders.flatrate?.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-400 mb-2 uppercase font-semibold">Stream</p>
                        <div className="flex flex-wrap gap-2">
                          {details.watchProviders.flatrate.map(p => (
                             <img key={p.name} src={p.logo} alt={p.name} title={p.name} className="w-10 h-10 rounded-lg" />
                          ))}
                        </div>
                      </div>
                    )}
                    {(details.watchProviders.rent?.length > 0 || details.watchProviders.buy?.length > 0) && (
                      <div>
                        <p className="text-xs text-gray-400 mb-2 uppercase font-semibold">Rent/Buy</p>
                        <div className="flex flex-wrap gap-2">
                          {[...details.watchProviders.rent, ...details.watchProviders.buy]
                            .filter((v,i,a)=>a.findIndex(t=>(t.name===v.name))===i) // unique
                            .slice(0, 5)
                            .map(p => (
                             <img key={p.name} src={p.logo} alt={p.name} title={p.name} className="w-10 h-10 rounded-lg" />
                          ))}
                        </div>
                      </div>
                    )}
                 </div>
              ) : (
                <p className="text-sm text-gray-500">No streaming information available for your region.</p>
              )}
           </div>

           {/* Facts */}
           <div className="space-y-4 text-sm">
             <h3 className="text-lg font-bold mb-2">Details</h3>
             
             {details.originalTitle && details.originalTitle !== details.title && (
               <div>
                 <span className="block text-gray-500">Original Title</span>
                 <span>{details.originalTitle}</span>
               </div>
             )}
             
             <div>
               <span className="block text-gray-500">Status</span>
               <span>{details.status}</span>
             </div>

             {details.budget > 0 && (
               <div>
                 <span className="block text-gray-500">Budget</span>
                 <span>{formatCurrency(details.budget)}</span>
               </div>
             )}
             
             {details.revenue > 0 && (
               <div>
                 <span className="block text-gray-500">Revenue</span>
                 <span>{formatCurrency(details.revenue)}</span>
               </div>
             )}

             {details.type === 'tv' && (
               <>
                 <div>
                   <span className="block text-gray-500">Seasons</span>
                   <span>{details.seasons}</span>
                 </div>
                 <div>
                   <span className="block text-gray-500">Episodes</span>
                   <span>{details.episodes}</span>
                 </div>
               </>
             )}
           </div>

           {/* External Links */}
           <div className="flex gap-4 pt-4 border-t border-white/10">
              {details.externalIds?.imdb_id && (
                <a href={`https://www.imdb.com/title/${details.externalIds.imdb_id}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#f5c518] transition" title="IMDb">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-3H9V9h2v4zm4 3h-2v-2h2v2zm0-3h-2V9h2v4z"/></svg>
                </a>
              )}
              {details.externalIds?.facebook_id && (
                <a href={`https://www.facebook.com/${details.externalIds.facebook_id}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1877F2] transition" title="Facebook">
                   <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                </a>
              )}
              {details.externalIds?.instagram_id && (
                <a href={`https://www.instagram.com/${details.externalIds.instagram_id}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#E1306C] transition" title="Instagram">
                   <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              )}
              {details.homepage && (
                 <a href={details.homepage} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition" title="Official Website">
                    <svg className="w-6 h-6 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                 </a>
              )}
           </div>

        </div>
      </main>


      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

            





    </div>
  )
}
