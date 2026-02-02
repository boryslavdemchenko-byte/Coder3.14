
// Mock database of movies and their availability
export const MOVIE_DATA = {
  "inception": {
    title: "Inception",
    year: 2010,
    regions: {
      "US": [
        { platform: "Netflix", type: "subscription", cost: 15.49 },
        { platform: "HBO Max", type: "subscription", cost: 15.99 },
        { platform: "Apple TV", type: "rent", cost: 3.99 },
        { platform: "Prime Video", type: "buy", cost: 14.99 }
      ],
      "UK": [
        { platform: "Sky Go", type: "subscription", cost: 25.00 },
        { platform: "Apple TV", type: "rent", cost: 3.49 }
      ]
    }
  },
  "the matrix": {
    title: "The Matrix",
    year: 1999,
    regions: {
      "US": [
        { platform: "HBO Max", type: "subscription", cost: 15.99 },
        { platform: "Peacock", type: "subscription", cost: 5.99 },
        { platform: "Prime Video", type: "rent", cost: 3.99 }
      ],
      "UK": [
        { platform: "Netflix", type: "subscription", cost: 10.99 },
        { platform: "Prime Video", type: "rent", cost: 3.49 }
      ]
    }
  },
  "interstellar": {
    title: "Interstellar",
    year: 2014,
    regions: {
      "US": [
        { platform: "Paramount+", type: "subscription", cost: 5.99 },
        { platform: "Prime Video", type: "subscription", cost: 14.99 },
        { platform: "Apple TV", type: "rent", cost: 3.99 }
      ],
      "UK": [
        { platform: "Sky Go", type: "subscription", cost: 25.00 },
        { platform: "Apple TV", type: "rent", cost: 3.49 }
      ]
    }
  },
  "dune": {
    title: "Dune: Part One",
    year: 2021,
    regions: {
      "US": [
        { platform: "HBO Max", type: "subscription", cost: 15.99 },
        { platform: "Hulu", type: "subscription", cost: 7.99 },
        { platform: "Apple TV", type: "rent", cost: 5.99 }
      ],
      "UK": [
        { platform: "Netflix", type: "subscription", cost: 10.99 }
      ]
    }
  }
};

export function findMovieOptions(movieTitle, countryCode, budgetMax, numMovies = 1) {
  const normalizedTitle = movieTitle.toLowerCase().trim();
  const movie = MOVIE_DATA[normalizedTitle];

  if (!movie) {
    return { error: "not_found", message: `I currently don't have data for "${movieTitle}". Try "Inception", "The Matrix", "Interstellar", or "Dune".` };
  }

  const regionData = movie.regions[countryCode.toUpperCase()];
  if (!regionData) {
    return { error: "region_not_supported", message: `I have data for ${movie.title}, but not for region "${countryCode}". Try "US" or "UK".` };
  }

  // Filter by budget
  const validOptions = regionData.filter(opt => {
    // For subscription, monthly cost must be <= budget
    // For rent/buy, one-time cost must be <= budget (assuming user has that budget available now)
    return opt.cost <= budgetMax;
  });

  if (validOptions.length === 0) {
    return { 
      error: "budget_too_low", 
      message: `I found options for ${movie.title} in ${countryCode}, but they all exceed your budget of $${budgetMax}. The cheapest is ${Math.min(...regionData.map(o => o.cost)).toFixed(2)}.` 
    };
  }

  // Calculate total costs for comparison
  const optionsWithComparison = validOptions.map(opt => {
    let totalCost = 0;
    let breakEvenMsg = null;

    if (opt.type === 'subscription') {
      totalCost = opt.cost; // Monthly cost covers infinite movies
      // Break-even logic
      const rentOption = validOptions.find(o => o.type === 'rent');
      if (rentOption) {
        const breakEvenCount = Math.ceil(opt.cost / rentOption.cost);
        breakEvenMsg = `Subscription becomes cheaper if you watch ${breakEvenCount}+ movies/month`;
      }
    } else {
      totalCost = opt.cost * numMovies; // Rent/Buy * number of movies
    }

    return { ...opt, totalCost, breakEvenMsg };
  });

  // Sort by Total Cost ascending
  optionsWithComparison.sort((a, b) => a.totalCost - b.totalCost);

  const bestOption = optionsWithComparison[0];
  const nextOption = optionsWithComparison[1];

  let savingsMsg = null;
  if (nextOption) {
    const diff = nextOption.totalCost - bestOption.totalCost;
    savingsMsg = `Save $${diff.toFixed(2)} vs ${nextOption.platform} (${nextOption.type})`;
  }

  // Construct explanation
  let recommendationText = "";
  if (numMovies === 1 && bestOption.type === 'rent') {
    recommendationText = `Since you're only watching 1 movie, renting on ${bestOption.platform} is the cheapest option.`;
  } else if (bestOption.type === 'subscription') {
    recommendationText = `With ${numMovies} movie(s) in mind (or general usage), ${bestOption.platform} subscription offers the best value.`;
  } else {
    recommendationText = `${bestOption.platform} (${bestOption.type}) is your most improved option within budget.`;
  }

  return {
    movie: movie.title,
    country: countryCode.toUpperCase(),
    options: optionsWithComparison,
    stats: {
      cheapest: bestOption,
      savings: savingsMsg,
      breakEven: bestOption.breakEvenMsg
    },
    recommendation: recommendationText
  };
}
