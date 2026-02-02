const API_KEY = '3fcdc1a5e071f1a37ea92cde95d2faf5';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

async function get(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set('api_key', API_KEY || '');
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });
  console.log(`Fetching: ${url.toString()}`);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB ${path} ${res.status}`);
  return res.json();
}

function mapItem(it) {
  const title = it.title || it.name || '';
  const poster = it.poster_path ? `${IMG_BASE}${it.poster_path}` : null;
  return { id: it.id, title, poster, poster_path: it.poster_path };
}

async function getUpcoming() {
  try {
    console.log('Fetching upcoming movies...');
    const movies = await get('/movie/upcoming');
    console.log(`Got ${movies.results?.length} movies`);
    
    console.log('Fetching on_the_air tv...');
    const tv = await get('/tv/on_the_air');
    console.log(`Got ${tv.results?.length} TV shows`);

    const mItems = (movies.results || []).map(it => ({
      ...mapItem(it),
      type: 'movie',
    }));
    
    const tItems = (tv.results || []).map(it => ({
      ...mapItem(it),
      type: 'tv',
    }));

    const all = [...mItems, ...tItems];
    console.log('--- Sample Items ---');
    all.slice(0, 5).forEach(item => {
      console.log(`Title: ${item.title}`);
      console.log(`Poster: ${item.poster}`);
      console.log(`Poster Path: ${item.poster_path}`);
      console.log('---');
    });
  } catch (e) {
    console.error('Error:', e);
  }
}

getUpcoming();
