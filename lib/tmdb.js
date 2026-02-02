const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'
const IMG_BASE = 'https://image.tmdb.org/t/p/w500'
const IMG_ORIGINAL = 'https://image.tmdb.org/t/p/original'

async function get(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`)
  url.searchParams.set('api_key', API_KEY || '')
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
  })
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`TMDB ${path} ${res.status}`)
  return res.json()
}

function mapItem(it) {
  const title = it.title || it.name || ''
  const poster = it.poster_path ? `${IMG_BASE}${it.poster_path}` : null
  const backdrop = it.backdrop_path ? `${IMG_BASE}${it.backdrop_path}` : null
  const year = (it.release_date || it.first_air_date || '').slice(0, 4) || ''
  const genreIds = Array.isArray(it.genre_ids) ? it.genre_ids : []
  const rating = typeof it.vote_average === 'number' ? it.vote_average : null
  const mediaType = it.media_type || (it.title ? 'movie' : 'tv')
  return { 
    id: it.id, 
    title, 
    poster, 
    backdrop,
    posterPath: it.poster_path, 
    year, 
    genreIds, 
    rating,
    type: mediaType,
    overview: it.overview || ''
  }
}

export async function searchMulti(query) {
  const data = await get('/search/multi', { query })
  const list = (data.results || []).filter(r => r.media_type === 'movie' || r.media_type === 'tv')
  return list.map(it => {
    const base = mapItem(it)
    const releaseDate = base.type === 'movie' ? (it.release_date || '') : (it.first_air_date || '')
    return { ...base, releaseDate }
  })
}

export async function getTrending() {
  const fetchPages = async (path, pages) => {
    const promises = []
    for (let i = 1; i <= pages; i++) {
      promises.push(get(path, { page: i }))
    }
    const responses = await Promise.all(promises)
    return responses.flatMap(r => r.results || [])
  }

  const results = await fetchPages('/trending/all/day', 5)
  const list = results.filter(r => r.media_type === 'movie' || r.media_type === 'tv')
  
  // Deduplicate by ID
  const uniqueList = Array.from(new Map(list.map(item => [item.id, item])).values())

  return uniqueList.map(it => {
    const base = mapItem(it)
    const releaseDate = base.type === 'movie' ? (it.release_date || '') : (it.first_air_date || '')
    const genre = Array.isArray(it.genre_ids) ? it.genre_ids.join(',') : ''
    return { ...base, releaseDate, genre }
  })
}

export async function getNewReleases() {
  const fetchPages = async (path, pages) => {
    const promises = []
    for (let i = 1; i <= pages; i++) {
      promises.push(get(path, { page: i }))
    }
    const responses = await Promise.all(promises)
    return responses.flatMap(r => r.results || [])
  }

  const [movies, tv] = await Promise.all([
    fetchPages('/movie/now_playing', 10),
    fetchPages('/tv/airing_today', 5)
  ])

  const mItems = movies.map(it => ({
    ...mapItem(it),
    type: 'movie',
    releaseDate: it.release_date || '',
    genre: Array.isArray(it.genre_ids) ? it.genre_ids.join(',') : ''
  }))
  const tItems = tv.map(it => ({
    ...mapItem(it),
    type: 'tv',
    releaseDate: it.first_air_date || '',
    genre: Array.isArray(it.genre_ids) ? it.genre_ids.join(',') : ''
  }))
  
  const allItems = [...mItems, ...tItems]
  const uniqueItems = Array.from(new Map(allItems.map(item => [`${item.type}-${item.id}`, item])).values())
  return uniqueItems
}

export async function getUpcoming() {
  const fetchPages = async (path, pages) => {
    const promises = []
    for (let i = 1; i <= pages; i++) {
      promises.push(get(path, { page: i }))
    }
    const responses = await Promise.all(promises)
    return responses.flatMap(r => r.results || [])
  }

  const [movies, tv] = await Promise.all([
    fetchPages('/movie/upcoming', 10),
    fetchPages('/tv/on_the_air', 5)
  ])

  const mItems = movies.map(it => ({
    ...mapItem(it),
    type: 'movie',
    releaseDate: it.release_date || '',
    genre: Array.isArray(it.genre_ids) ? it.genre_ids.join(',') : ''
  }))
  const tItems = tv.map(it => ({
    ...mapItem(it),
    type: 'tv',
    releaseDate: it.first_air_date || '',
    genre: Array.isArray(it.genre_ids) ? it.genre_ids.join(',') : ''
  }))
  
  const allItems = [...mItems, ...tItems]
  const uniqueItems = Array.from(new Map(allItems.map(item => [`${item.type}-${item.id}`, item])).values())
  return uniqueItems
}

export async function getTitleDetails(id, type) {
  const append = 'credits,videos,images,recommendations,similar,external_ids,watch/providers,release_dates,content_ratings'
  let data
  let finalType = type

  // Try to fetch as movie first if type is undefined, then fallback to tv
  if (!finalType) {
    try {
      data = await get(`/movie/${id}`, { append_to_response: append })
      finalType = 'movie'
    } catch {
      data = await get(`/tv/${id}`, { append_to_response: append })
      finalType = 'tv'
    }
  } else {
    data = await get(`/${finalType}/${id}`, { append_to_response: append })
  }

  if (!data) return null

  // Process Certification
  let certification = ''
  if (finalType === 'movie') {
    const releases = data.release_dates?.results || []
    const usRelease = releases.find(r => r.iso_3166_1 === 'US')
    certification = usRelease?.release_dates?.[0]?.certification || ''
  } else {
    const ratings = data.content_ratings?.results || []
    const usRating = ratings.find(r => r.iso_3166_1 === 'US')
    certification = usRating?.rating || ''
  }

  // Process Director/Creator
  const directors = finalType === 'movie' 
    ? data.credits?.crew?.filter(c => c.job === 'Director').map(c => c.name) 
    : data.created_by?.map(c => c.name)

  // Process Cast
  const cast = (data.credits?.cast || []).slice(0, 10).map(c => ({
    id: c.id,
    name: c.name,
    character: c.character,
    profile: c.profile_path ? `${IMG_BASE}${c.profile_path}` : null
  }))

  // Process Videos
  const videos = (data.videos?.results || [])
    .filter(v => v.site === 'YouTube')
    .map(v => ({
      id: v.id,
      key: v.key,
      name: v.name,
      type: v.type
    }))

  // Process Images
  const backdrops = (data.images?.backdrops || []).slice(0, 10).map(i => `${IMG_ORIGINAL}${i.file_path}`)
  
  // Process Watch Providers
  const providers = data['watch/providers']?.results?.US
  const watchProviders = {
    flatrate: (providers?.flatrate || []).map(p => ({ name: p.provider_name, logo: `${IMG_BASE}${p.logo_path}` })),
    rent: (providers?.rent || []).map(p => ({ name: p.provider_name, logo: `${IMG_BASE}${p.logo_path}` })),
    buy: (providers?.buy || []).map(p => ({ name: p.provider_name, logo: `${IMG_BASE}${p.logo_path}` }))
  }

  // Process Recommendations & Similar
  const recommendations = (data.recommendations?.results || []).map(item => mapItem({ ...item, media_type: finalType }))
  const similar = (data.similar?.results || []).map(item => mapItem({ ...item, media_type: finalType }))

  return {
    id: data.id,
    type: finalType,
    title: data.title || data.name,
    originalTitle: data.original_title || data.original_name,
    tagline: data.tagline,
    overview: data.overview,
    status: data.status,
    poster: data.poster_path ? `${IMG_BASE}${data.poster_path}` : null,
    backdrop: data.backdrop_path ? `${IMG_ORIGINAL}${data.backdrop_path}` : null,
    year: (data.release_date || data.first_air_date || '').slice(0, 4),
    releaseDate: data.release_date || data.first_air_date,
    runtime: data.runtime || (data.episode_run_time?.[0]),
    genres: (data.genres || []).map(g => g.name),
    rating: data.vote_average,
    voteCount: data.vote_count,
    certification,
    directors: directors || [],
    cast,
    videos,
    images: backdrops,
    watchProviders,
    recommendations,
    similar,
    externalIds: data.external_ids,
    homepage: data.homepage,
    budget: data.budget,
    revenue: data.revenue,
    seasons: data.number_of_seasons,
    episodes: data.number_of_episodes,
    nextEpisode: data.next_episode_to_air
  }
}

export async function getTitleCertification(id, type) {
  // Kept for compatibility, though getTitleDetails handles it now
  if (type === 'movie') {
    try {
      const certs = await get(`/movie/${id}/release_dates`)
      return certs.results?.find(r => r.iso_3166_1 === 'US')?.release_dates?.[0]?.certification || ''
    } catch { return '' }
  }
  try {
    const certs = await get(`/tv/${id}/content_ratings`)
    return certs.results?.find(r => r.iso_3166_1 === 'US')?.rating || ''
  } catch { return '' }
}

export async function getPersonDetails(id) {
  try {
    const p = await get(`/person/${id}`)
    
    // Get external IDs for social media
    let externalIds = {}
    try {
      externalIds = await get(`/person/${id}/external_ids`)
    } catch {}

    // Get combined credits for notable works
    let credits = {}
    try {
      credits = await get(`/person/${id}/combined_credits`)
    } catch {}

    // Sort credits by popularity and take top 5
    const notable = (credits.cast || [])
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 5)
      .map(c => ({
         id: c.id,
         title: c.title || c.name,
         year: (c.release_date || c.first_air_date || '').slice(0, 4),
         type: c.media_type
      }))

    return {
      id: p.id,
      name: p.name,
      biography: p.biography || 'No biography available.',
      birthday: p.birthday,
      deathday: p.deathday,
      place_of_birth: p.place_of_birth,
      profile_path: p.profile_path ? `${IMG_BASE}${p.profile_path}` : null,
      notable_works: notable,
      social: {
        instagram: externalIds.instagram_id,
        twitter: externalIds.twitter_id,
        facebook: externalIds.facebook_id,
        imdb: externalIds.imdb_id
      }
    }
  } catch (e) {
    console.error('getPersonDetails error', e)
    return null
  }
}

export async function getWatchProviders(id, type, region = 'US') {
  const path = type === 'tv' ? `/tv/${id}/watch/providers` : `/movie/${id}/watch/providers`
  const data = await get(path)
  const r = data.results?.[region]
  const list = r?.flatrate || r?.ads || r?.free || []
  return (list || []).map(p => ({ id: p.provider_id, name: p.provider_name, logo: p.logo_path ? `${IMG_BASE}${p.logo_path}` : null }))
}

export async function getTitleVideos(id, type) {
  // Kept for compatibility
  const details = await getTitleDetails(id, type)
  const trailers = details?.videos?.filter(v => v.type === 'Trailer') || []
  return trailers[0] || details?.videos?.[0] || null
}

export async function getCalendarData(region = 'US') {
  const upcoming = await getUpcoming()
  const byDate = {}
  for (const it of upcoming) {
    const d = it.releaseDate || 'Unknown'
    if (d === 'Unknown') continue
    if (!byDate[d]) byDate[d] = []
    byDate[d].push(it)
  }
  const entries = Object.entries(byDate).map(([date, items]) => ({ date, items }))
  entries.sort((a, b) => (a.date > b.date ? 1 : -1))
  return entries
}
