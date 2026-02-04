// PURE CHAT AI - Logic-based conversational AI
// Ported from Python to JavaScript for Flico

const GREETINGS = [
  "hello", "hi", "hey", "yo", "what's up", "greetings", "good morning", "good evening"
];

const GREETING_RESPONSES = [
  "Hey! I'm Flico. What’s on your mind?",
  "Hi there 🙂 How can I help you find a movie today?",
  "Hello! Let’s talk movies.",
  "Hey! Ready to discover something new?"
];

// Expanded Knowledge Base
const KNOWLEDGE_BASE = [
  // --- Streaming Services & Pricing ---
  {
    keywords: ["cheapest", "cost", "price", "streaming service", "subscription", "how much", "expensive"],
    response: "Here's a quick breakdown of major streaming services (prices may vary):\n\n" +
              "- **Apple TV+**: ~$9.99/mo (Best value for high-quality originals)\n" +
              "- **Amazon Prime Video**: Included with Prime ($14.99/mo) or ~$8.99/mo standalone\n" +
              "- **Disney+**: ~$7.99/mo (with ads) or ~$13.99/mo (no ads)\n" +
              "- **Netflix**: Starts at ~$6.99/mo (Standard with ads), up to ~$22.99/mo (Premium)\n" +
              "- **Hulu**: ~$7.99/mo (ads) or ~$17.99/mo (no ads)\n" +
              "- **Max (HBO)**: ~$9.99/mo (ads) or ~$16.99/mo (no ads)\n\n" +
              "If you're looking for the absolute cheapest, **Netflix Standard with Ads** or **Hulu (Ads)** are strong contenders, though **Apple TV+** offers great quality for a lower mid-tier price."
  },
  {
    keywords: ["netflix", "what is on netflix"],
    response: "Netflix is the giant of streaming. It has massive hits like 'Stranger Things', 'Squid Game', and 'The Crown'. It offers a huge library of movies, TV shows, and documentaries."
  },
  {
    keywords: ["disney", "disney plus", "disney+"],
    response: "Disney+ is the home of Disney, Pixar, Marvel, Star Wars, and National Geographic. If you love superheroes, animated classics, or The Mandalorian, this is the one for you."
  },
  {
    keywords: ["hbo", "max", "hbo max"],
    response: "Max (formerly HBO Max) is known for prestige TV. Think 'Game of Thrones', 'Succession', 'The Last of Us', plus the entire Warner Bros. movie library."
  },
  {
    keywords: ["prime", "amazon prime"],
    response: "Prime Video has great originals like 'The Boys' and 'Reacher', plus a massive library of movies to rent or buy. It's often included with your Amazon Prime shipping membership."
  },
  {
    keywords: ["apple", "apple tv"],
    response: "Apple TV+ focuses on quality over quantity. They have fewer shows, but they are high budget and star-studded. 'Ted Lasso', 'Severance', and 'Foundation' are must-watches."
  },

  // --- Genres & Recommendations ---
  { 
    keywords: ["recommend", "suggest", "movie", "watch", "looking for", "find me"], 
    response: "I can definitely help with that! What kind of mood are you in? Or do you have a favorite genre?" 
  },
  { 
    keywords: ["action", "thriller", "adventure", "explosion", "fight"], 
    response: "Ooh, looking for some excitement? I'd recommend 'Mad Max: Fury Road', 'John Wick', 'Mission: Impossible', or 'Top Gun: Maverick'. High-octane stuff!" 
  },
  { 
    keywords: ["comedy", "funny", "laugh", "humor", "hilarious"], 
    response: "Need a laugh? 'Superbad', 'The Grand Budapest Hotel', 'Palm Springs', or 'Game Night' are great choices." 
  },
  { 
    keywords: ["drama", "sad", "emotional", "cry", "tearjerker"], 
    response: "Sometimes a good cry helps. 'The Shawshank Redemption', 'Parasite', 'Aftersun', or 'Past Lives' might be what you need." 
  },
  { 
    keywords: ["sci-fi", "science fiction", "space", "future", "alien"], 
    response: "Space... the final frontier. You can't go wrong with 'Interstellar', 'Dune', 'Blade Runner 2049', or 'Arrival'." 
  },
  { 
    keywords: ["horror", "scary", "spooky", "fear", "terrifying"], 
    response: "Brave soul! 'Hereditary', 'The Shining', 'Talk to Me', or 'Barbarian' will keep you up at night." 
  },
  {
    keywords: ["romance", "love", "date", "romantic"],
    response: "Feeling romantic? 'La La Land', 'Before Sunrise', 'About Time', or 'The Notebook' are perfect for that."
  },
  {
    keywords: ["family", "kid", "children", "animated", "cartoon"],
    response: "For a family movie night, I suggest 'Spider-Man: Into the Spider-Verse', 'Paddington 2', 'The Incredibles', or 'Coco'."
  }
];

const UNKNOWN_RESPONSES = [
  "I'm not 100% sure about that specific detail, but I can help you find movies, compare streaming services, or suggest something based on your mood.",
  "That's a bit outside my movie knowledge, but ask me about genres, actors, or where to watch your favorite films!",
  "I'm still learning! Try asking me for a recommendation, or ask 'what's the cheapest streaming service?'",
  "I didn't quite catch that. Could you rephrase? I'm best at movie recommendations and streaming advice."
];

export class PureChatAI {
  constructor() {
    // Stateless logic for now
  }

  _clean(text) {
    return (text || "").toLowerCase().replace(/[^\w\s]/g, "");
  }

  _isGreeting(text) {
    const words = text.split(' ');
    return GREETINGS.some(g => text.includes(g)) && words.length < 5;
  }

  _findPatternResponse(text) {
    // Improved matching: Checks if ALL keywords in a set are present, or at least one strong keyword
    // For now, we stick to "some" for flexibility, but we prioritize longer keyword matches if we were sorting.
    
    // Simple priority: First match wins. Order KNOWLEDGE_BASE carefully.
    for (const entry of KNOWLEDGE_BASE) {
      if (entry.keywords.some(k => text.includes(k))) {
        return entry.response;
      }
    }
    return null;
  }

  reply(messages) {
    // Get the last user message
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    const userText = lastUserMessage ? lastUserMessage.content : "";
    const cleanText = this._clean(userText);

    // 1. Identity & Meta
    if (cleanText.includes("your name") || cleanText.includes("who are you")) {
      return "I don’t have a human name, but I’m Flico — your AI assistant built to help you discover great movies.";
    }
    if (cleanText.includes("how are you")) {
      return "I’m doing well — focused and ready to help you find your next watch.";
    }
    if (cleanText.includes("what can you do")) {
      return "I can chat with you, remember context, explain ideas, and help you decide what to watch based on your mood.";
    }
    if (cleanText.includes("why")) {
      return "That’s a good question. Usually, the reason depends on context. Can you be more specific?";
    }
    
    // 2. Greetings
    if (this._isGreeting(cleanText)) {
      return this._randomChoice(GREETING_RESPONSES);
    }

    // 3. Knowledge Base Patterns
    const patternResponse = this._findPatternResponse(cleanText);
    if (patternResponse) {
      return patternResponse;
    }

    // 4. Fallback
    return this._randomChoice(UNKNOWN_RESPONSES);
  }

  _randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}
