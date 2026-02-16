
export const ARCHETYPES = {
  ADRENALINE_JUNKIE: {
    id: 'adrenaline_junkie',
    label: 'The Adrenaline Junkie',
    description: 'You live for the thrill. Explosions, car chases, and high-stakes tension are your bread and butter.',
    genres: ['Action', 'Adventure', 'Thriller'],
    tmdbGenreIds: [28, 12, 53]
  },
  INTELLECTUAL: {
    id: 'intellectual',
    label: 'The Intellectual',
    description: 'You seek depth and meaning. Complex narratives, documentaries, and thought-provoking indie films are your go-to.',
    genres: ['Documentary', 'Drama', 'History'],
    tmdbGenreIds: [99, 18, 36]
  },
  ESCAPIST: {
    id: 'escapist',
    label: 'The Escapist',
    description: 'Reality is overrated. You prefer to be transported to other worlds through sci-fi, fantasy, and animation.',
    genres: ['Science Fiction', 'Fantasy', 'Animation'],
    tmdbGenreIds: [878, 14, 16]
  },
  ROMANTIC: {
    id: 'romantic',
    label: 'The Romantic',
    description: 'You believe in love and happy endings. Heartwarming stories and emotional connections drive your viewing choices.',
    genres: ['Romance', 'Comedy', 'Drama'],
    tmdbGenreIds: [10749, 35, 18]
  },
  VISIONARY: {
    id: 'visionary',
    label: 'The Visionary',
    description: 'You appreciate the art of filmmaking. Unique visuals, experimental storytelling, and psychological depth fascinate you.',
    genres: ['Mystery', 'Horror', 'Art House'],
    tmdbGenreIds: [9648, 27] // Art House isn't a direct TMDB genre, but Mystery/Horror fit well.
  },
  CLASSICIST: {
    id: 'classicist',
    label: 'The Classicist',
    description: 'Old is gold. You appreciate the golden age of cinema, westerns, and timeless storytelling.',
    genres: ['Classic', 'Western', 'War'],
    tmdbGenreIds: [37, 10752] // Classic isn't a genre ID, will handle by year filtering maybe?
  }
};

export const PLATFORMS = {
  NETFLIX: { id: 'netflix', label: 'Netflix', color: '#E50914', tmdbProviderId: 8 },
  HBO_MAX: { id: 'hbo_max', label: 'HBO Max', color: '#5822b4', tmdbProviderId: 384 },
  DISNEY_PLUS: { id: 'disney_plus', label: 'Disney+', color: '#113CCF', tmdbProviderId: 337 },
  PRIME_VIDEO: { id: 'prime_video', label: 'Prime Video', color: '#00A8E1', tmdbProviderId: 119 },
  HULU: { id: 'hulu', label: 'Hulu', color: '#1CE783', tmdbProviderId: 15 },
  APPLE_TV: { id: 'apple_tv', label: 'Apple TV+', color: '#A3AAAE', tmdbProviderId: 350 }
};

export const QUESTIONS = [
  {
    id: 1,
    text: "It's Friday night. What's the vibe?",
    options: [
      { text: "Edge of my seat, popcorn flying everywhere.", weights: { adrenaline_junkie: 5, escapist: 2, netflix: 3 } },
      { text: "A glass of wine and a film that makes me think.", weights: { intellectual: 5, visionary: 3, hbo_max: 3, apple_tv: 2 } },
      { text: "Cozy blanket, tissues, and all the feels.", weights: { romantic: 5, classicist: 2, hulu: 3 } },
      { text: "Transport me to another galaxy, please.", weights: { escapist: 5, visionary: 2, disney_plus: 4 } }
    ]
  },
  {
    id: 2,
    text: "Pick a visual aesthetic:",
    options: [
      { text: "Neon lights, dystopian cities, futuristic tech.", weights: { escapist: 4, visionary: 3, netflix: 2 } },
      { text: "Gritty realism, natural lighting, raw emotion.", weights: { intellectual: 4, visionary: 2, hbo_max: 3 } },
      { text: "Epic landscapes, battlefields, grand vistas.", weights: { adrenaline_junkie: 3, classicist: 3, prime_video: 3 } },
      { text: "Warm colors, charming towns, golden hour.", weights: { romantic: 4, classicist: 2, hulu: 2 } }
    ]
  },
  {
    id: 3,
    text: "How do you handle subtitles?",
    options: [
      { text: "Love them! Opens up a world of cinema.", weights: { intellectual: 5, visionary: 3, mubi: 5 } }, // Mubi isn't a main platform, map to HBO/Apple
      { text: "I don't mind them if the story is good.", weights: { intellectual: 2, adrenaline_junkie: 1, netflix: 2 } },
      { text: "I prefer to watch things in my own language.", weights: { escapist: 2, romantic: 2, disney_plus: 2 } },
      { text: "Only for anime.", weights: { escapist: 3, hulu: 2 } }
    ]
  },
  {
    id: 4,
    text: "Which plot device hooks you instantly?",
    options: [
      { text: "A 'whodunit' murder mystery with a twist.", weights: { intellectual: 3, visionary: 3, hbo_max: 2 } },
      { text: "A hero's journey against impossible odds.", weights: { adrenaline_junkie: 3, escapist: 3, disney_plus: 3 } },
      { text: "A forbidden love affair.", weights: { romantic: 5, classicist: 1, netflix: 2 } },
      { text: "A mind-bending concept that breaks reality.", weights: { visionary: 5, intellectual: 2, apple_tv: 3 } }
    ]
  },
  {
    id: 5,
    text: "Choose a movie snack:",
    options: [
      { text: "Nachos with extra jalapeños.", weights: { adrenaline_junkie: 2, netflix: 2 } },
      { text: "Artisanal cheese board.", weights: { intellectual: 3, apple_tv: 3 } },
      { text: "Classic buttered popcorn.", weights: { classicist: 4, romantic: 1, prime_video: 1 } },
      { text: "Candy / Sweets.", weights: { escapist: 2, disney_plus: 2 } }
    ]
  },
  {
    id: 6,
    text: "What's your biggest movie turn-off?",
    options: [
      { text: "Predictable, cheesy dialogue.", weights: { intellectual: 3, visionary: 2 } },
      { text: "Slow pacing with nothing happening.", weights: { adrenaline_junkie: 4, escapist: 2 } },
      { text: "Too much gore or violence.", weights: { romantic: 4, classicist: 2 } },
      { text: "Confusing plots that make no sense.", weights: { classicist: 3, romantic: 1 } }
    ]
  },
  {
    id: 7,
    text: "Pick a decade to live in:",
    options: [
      { text: "The Roaring 20s or Golden 50s.", weights: { classicist: 5, romantic: 2 } },
      { text: "The 80s – neon, synth, and blockbusters.", weights: { escapist: 3, adrenaline_junkie: 2, netflix: 3 } },
      { text: "The Future (3000+).", weights: { visionary: 4, escapist: 4, apple_tv: 2 } },
      { text: "Right now is fine.", weights: { intellectual: 2, hbo_max: 1 } }
    ]
  },
  {
    id: 8,
    text: "Who is your ideal protagonist?",
    options: [
      { text: "The rugged anti-hero with a dark past.", weights: { adrenaline_junkie: 3, visionary: 2, prime_video: 2 } },
      { text: "The brilliant detective or scientist.", weights: { intellectual: 4, visionary: 1, hbo_max: 2 } },
      { text: "The charming underdog looking for love.", weights: { romantic: 5, hulu: 2 } },
      { text: "The chosen one with magical abilities.", weights: { escapist: 5, disney_plus: 4 } }
    ]
  },
  {
    id: 9,
    text: "Streaming habit:",
    options: [
      { text: "Binge-watch an entire season in a weekend.", weights: { netflix: 5, hulu: 3 } },
      { text: "Watch one high-quality episode a week.", weights: { hbo_max: 5, apple_tv: 4 } },
      { text: "Rent the latest theatrical release.", weights: { prime_video: 4, apple_tv: 2 } },
      { text: "Rewatch my childhood favorites.", weights: { disney_plus: 5, classicist: 2 } }
    ]
  },
  {
    id: 10,
    text: "Opinion on black and white movies?",
    options: [
      { text: "Masterpieces of light and shadow.", weights: { classicist: 5, visionary: 3, intellectual: 2 } },
      { text: "Boring. I need color.", weights: { adrenaline_junkie: 2, escapist: 2 } },
      { text: "Depends on the movie.", weights: { intellectual: 1, romantic: 1 } },
      { text: "Only if it's 'The Artist' or 'Schindler's List'.", weights: { intellectual: 2, hbo_max: 1 } }
    ]
  },
  {
    id: 11,
    text: "You have 2 hours free. What do you watch?",
    options: [
      { text: "A high-octane action flick.", weights: { adrenaline_junkie: 5, prime_video: 2 } },
      { text: "A deep documentary about nature or society.", weights: { intellectual: 4, netflix: 2 } },
      { text: "A feel-good animated movie.", weights: { escapist: 3, disney_plus: 4, romantic: 1 } },
      { text: "An intense psychological thriller.", weights: { visionary: 4, hbo_max: 3 } }
    ]
  },
  {
    id: 12,
    text: "Final question: Why do you watch movies?",
    options: [
      { text: "To feel excitement and adrenaline.", weights: { adrenaline_junkie: 5 } },
      { text: "To escape my daily life.", weights: { escapist: 5, fantasy: 2 } },
      { text: "To learn and understand the world.", weights: { intellectual: 5 } },
      { text: "To feel deep emotions and connection.", weights: { romantic: 4, classicist: 2 } }
    ]
  }
];
