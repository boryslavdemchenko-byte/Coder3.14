import { findMovieOptions } from './movieLogic';

// AI-ready stubs. Future implementations can replace these with real AI calls.

export const PLANS = [
  {
    id: 'netflix-basic-ads',
    service: 'Netflix',
    label: 'Basic with Ads',
    price: 6.99,
    currency: 'USD',
    quality: '1080p',
    screens: 2,
    ads: true
  },
  {
    id: 'netflix-standard',
    service: 'Netflix',
    label: 'Standard',
    price: 15.49,
    currency: 'USD',
    quality: '1080p',
    screens: 2,
    ads: false
  },
  {
    id: 'netflix-premium',
    service: 'Netflix',
    label: 'Premium',
    price: 22.99,
    currency: 'USD',
    quality: '4K HDR',
    screens: 4,
    ads: false
  },
  {
    id: 'disney-standard-ads',
    service: 'Disney+',
    label: 'Standard with Ads',
    price: 7.99,
    currency: 'USD',
    quality: '1080p',
    screens: 2,
    ads: true
  },
  {
    id: 'disney-premium',
    service: 'Disney+',
    label: 'Premium',
    price: 13.99,
    currency: 'USD',
    quality: '4K HDR',
    screens: 4,
    ads: false
  },
  {
    id: 'prime-standard',
    service: 'Prime Video',
    label: 'Prime Video',
    price: 14.99,
    currency: 'USD',
    quality: '4K HDR',
    screens: 3,
    ads: false
  },
  {
    id: 'hbo-standard',
    service: 'Max',
    label: 'Standard with Ads',
    price: 9.99,
    currency: 'USD',
    quality: '1080p',
    screens: 2,
    ads: true
  },
  {
    id: 'hbo-ultimate',
    service: 'Max',
    label: 'Ultimate Ad-Free',
    price: 19.99,
    currency: 'USD',
    quality: '4K HDR',
    screens: 4,
    ads: false
  },
  {
    id: 'apple-standard',
    service: 'Apple TV+',
    label: 'Standard',
    price: 9.99,
    currency: 'USD',
    quality: '4K HDR',
    screens: 6,
    ads: false
  }
]

function normalizeProfile(input) {
  const budgetMax = typeof input.budgetMax === 'number' && input.budgetMax > 0 ? input.budgetMax : null
  const peopleCount = typeof input.peopleCount === 'number' && input.peopleCount > 0 ? input.peopleCount : 1
  const kids = !!input.kids
  const mainDevices = Array.isArray(input.mainDevices) ? input.mainDevices : []
  const wants4k = !!input.wants4k
  const hoursPerWeek = typeof input.hoursPerWeek === 'number' && input.hoursPerWeek > 0 ? input.hoursPerWeek : 5
  const contentPrefs = Array.isArray(input.contentPrefs) ? input.contentPrefs : []
  const currentServices = Array.isArray(input.currentServices) ? input.currentServices : []
  const adsPreference = input.adsPreference === 'no-ads' ? 'no-ads' : input.adsPreference === 'ads-ok' ? 'ads-ok' : 'flexible'
  return {
    budgetMax,
    peopleCount,
    kids,
    mainDevices,
    wants4k,
    hoursPerWeek,
    contentPrefs,
    currentServices,
    adsPreference
  }
}

function scorePlan(plan, profile) {
  let score = 0
  if (profile.budgetMax != null) {
    if (plan.price <= profile.budgetMax) {
      score += 3
    } else if (plan.price <= profile.budgetMax + 5) {
      score += 1
    } else {
      score -= 5
    }
  }
  if (profile.wants4k) {
    if (plan.quality.includes('4K')) {
      score += 3
    } else {
      score -= 2
    }
  } else {
    if (plan.quality === '1080p') {
      score += 1
    }
  }
  if (plan.screens >= profile.peopleCount) {
    score += 3
  } else if (plan.screens >= Math.ceil(profile.peopleCount / 2)) {
    score += 1
  } else {
    score -= 1
  }
  if (profile.adsPreference === 'no-ads') {
    if (plan.ads) score -= 3
    else score += 2
  } else if (profile.adsPreference === 'ads-ok') {
    if (plan.ads) score += 1
  } else {
    if (!plan.ads) score += 1
  }
  const prefs = profile.contentPrefs || []
  if (prefs.length > 0) {
    if (prefs.includes('kids') && plan.service === 'Disney+') score += 4
    if (prefs.includes('sports') && plan.service === 'Prime Video') score += 2
    if (prefs.includes('anime') && plan.service === 'Netflix') score += 2
    if (prefs.includes('movies') && (plan.service === 'Netflix' || plan.service === 'Prime Video' || plan.service === 'Max')) score += 2
    if (prefs.includes('series') && (plan.service === 'Netflix' || plan.service === 'Disney+' || plan.service === 'Max')) score += 2
    if (prefs.includes('reality') && plan.service === 'Netflix') score += 1
  }
  if (profile.hoursPerWeek >= 15) {
    if (!plan.ads) score += 2
  }
  if (profile.currentServices && profile.currentServices.length > 0) {
    const already = profile.currentServices.map(s => s.toLowerCase())
    if (already.includes(plan.service.toLowerCase())) score += 1
  }
  return score
}

function buildExplanation(best, alternatives, profile) {
  const lines = []
  if (profile.budgetMax != null) {
    lines.push(
      `Budget: your limit is about $${profile.budgetMax.toFixed(0)} per month, and this plan costs $${best.price.toFixed(2)} ${best.currency}.`
    )
  } else {
    lines.push(
      `Budget: you did not set a strict limit, so recommendations prioritize overall value instead of the absolute lowest price.`
    )
  }
  if (profile.wants4k) {
    lines.push(`Quality: you prefer 4K/HDR, and this plan delivers ${best.quality}, which fits big-screen viewing best.`)
  } else {
    lines.push(`Quality: HD is enough for you, and this plan offers ${best.quality}, which balances quality and cost.`)
  }
  lines.push(
    `Screens: you mentioned about ${profile.peopleCount} people; this plan includes ${best.screens} simultaneous screens so multiple people can watch without conflicts.`
  )
  if (profile.adsPreference === 'no-ads') {
    if (best.ads) {
      lines.push(`Ads: your strong preference is to avoid ads, so ad-free alternatives were prioritized even if slightly more expensive.`)
    } else {
      lines.push(`Ads: you prefer ad-free viewing, and this plan is ad-free, matching that preference.`)
    }
  } else if (profile.adsPreference === 'ads-ok') {
    lines.push(`Ads: you are open to ads to save money, so ad-supported plans with strong value are considered.`)
  } else {
    lines.push(`Ads: you are flexible about ads, so both ad-free and ad-supported options are compared on value.`)
  }
  if (profile.contentPrefs && profile.contentPrefs.length > 0) {
    const joined = profile.contentPrefs.join(', ')
    lines.push(`Content: your main interests are ${joined}, so platforms strong in those areas were weighted higher.`)
  }
  if (alternatives.length > 0) {
    const altLabels = alternatives.map(p => `${p.service} ${p.label}`).join('; ')
    lines.push(`Alternatives: you could also consider ${altLabels} if you decide to adjust budget or prioritize different content.`)
  }
  return lines
}

export async function getRecommendations(preferences) {
  return { source: 'stub', preferences }
}

export async function getNewReleases(region) {
  return { source: 'stub', region }
}

export async function getBestPlatform(watchlist, region) {
  return { source: 'stub', watchlistCount: Array.isArray(watchlist) ? watchlist.length : 0, region }
}

export async function getSubscriptionAdvice(rawProfile) {
  const profile = normalizeProfile(rawProfile || {})
  const scored = PLANS.map(plan => ({
    plan,
    score: scorePlan(plan, profile)
  }))
    .filter(entry => entry.score > -5)
    .sort((a, b) => b.score - a.score)
  if (scored.length === 0) {
    return {
      bestPlan: null,
      alternatives: [],
      explanation: ['No suitable plans were found within the provided constraints. Consider increasing budget or relaxing requirements.'],
      finalRecommendation: 'No clear recommendation can be made with the current inputs.'
    }
  }
  const best = scored[0].plan
  const alternatives = scored.slice(1, 3).map(entry => entry.plan)
  const explanation = buildExplanation(best, alternatives, profile)
  const finalRecommendation = `Overall, the best fit for you is ${best.service} ${best.label} at $${best.price.toFixed(
    2
  )} per month, because it balances your budget, desired quality, number of screens, and viewing preferences better than the alternatives.`
  return {
    bestPlan: best,
    alternatives,
    explanation,
    finalRecommendation
  }
}

export async function getMovieRecommendation(movieTitle, country, budget, numMovies = 1) {
  // Simulate AI delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return findMovieOptions(movieTitle, country, budget, numMovies);
}
