
import fs from 'fs';
import path from 'path';

// Load env vars
try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
      const [key, val] = line.split('=');
      if (key && val && !process.env[key]) {
        process.env[key.trim()] = val.trim();
      }
    });
  }
} catch (e) {
  console.error('Error loading .env.local:', e);
}

// Mock fetch if needed, but we want real integration test so we use native fetch (Node 18+)
// Next.js polyfills fetch, but in raw node script we rely on Node's fetch.

// We need to import the module. Since it uses ES modules (export async function), 
// and the project is likely setup for Next.js (which handles transpilation), 
// running this directly with `node` might fail if package.json doesn't have "type": "module".
// Let's check package.json first. 
// If it's not "type": "module", we might need to use `esm` or rename to .mjs.
// Safest is to create a .mjs file.

const run = async () => {
  try {
    // We will dynamically import the library file. 
    // However, the library file might import other things.
    // lib/tmdb.js only imports process.env.
    
    // We need to verify if we can import it.
    // Since I can't easily change the project config, I will copy the logic of tmdb.js into this script 
    // to test the logic isolation, OR I will try to import it.
    // Importing is better to test the actual file.
    
    // Let's try to import the file using the path.
    const tmdb = await import('./lib/tmdb.js');
    
    console.log('--- Testing getTrending ---');
    const trending = await tmdb.getTrending();
    console.log(`Fetched ${trending.length} trending items`);
    if (trending.length > 0) {
        console.log('Sample item:', JSON.stringify(trending[0], null, 2));
    }
    const trendingIds = new Set(trending.map(i => `${i.type}-${i.id}`));
    if (trendingIds.size !== trending.length) {
        console.error(`WARNING: Duplicate items found in Trending! ${trending.length} items vs ${trendingIds.size} unique keys`);
    } else {
        console.log('PASSED: No duplicates in Trending');
    }

    console.log('\n--- Testing getNewReleases ---');
    const newReleases = await tmdb.getNewReleases();
    console.log(`Fetched ${newReleases.length} new releases`);
    const newReleasesIds = new Set(newReleases.map(i => `${i.type}-${i.id}`));
    if (newReleasesIds.size !== newReleases.length) {
        console.error(`WARNING: Duplicate items found in New Releases! ${newReleases.length} items vs ${newReleasesIds.size} unique keys`);
    } else {
        console.log('PASSED: No duplicates in New Releases');
    }
    
    console.log('\n--- Testing getUpcoming ---');
    const upcoming = await tmdb.getUpcoming();
    console.log(`Fetched ${upcoming.length} upcoming items`);
    const upcomingIds = new Set(upcoming.map(i => `${i.type}-${i.id}`));
    if (upcomingIds.size !== upcoming.length) {
        console.error(`WARNING: Duplicate items found in Upcoming! ${upcoming.length} items vs ${upcomingIds.size} unique keys`);
    } else {
        console.log('PASSED: No duplicates in Upcoming');
    }

  } catch (err) {
    console.error('Test FAILED:', err);
  }
};

run();
