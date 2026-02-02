import { useState, useEffect, useRef } from 'react'
import Layout from '../components/Layout'
import { getSubscriptionAdvice, getMovieRecommendation } from '../lib/ai'
import { MOVIE_DATA } from '../lib/movieLogic'

// Known entity lists for "NER" (Named Entity Recognition) simulation
const KNOWN_MOVIES = Object.values(MOVIE_DATA).map(m => m.title.toLowerCase())
const KNOWN_COUNTRIES = ['us', 'usa', 'united states', 'uk', 'united kingdom', 'britain']

export default function Advisor() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [currentThought, setCurrentThought] = useState('')
  const messagesEndRef = useRef(null)

  // Combined Context State (No rigid "mode" or "step")
  const [context, setContext] = useState({
    intent: null, // 'movie_finder' | 'advisor' | null
    // Movie Finder Slots
    movieTitle: null,
    country: null,
    budget: null,
    // Advisor Slots
    peopleCount: null,
    kids: null,
    wants4k: null,
    hoursPerWeek: null,
    contentPrefs: [],
    currentServices: [],
    adsPreference: null
  })

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentThought, isThinking])

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  function addMessage(role, text, thoughts = []) {
    setMessages(prev => [...prev, { role, text, thoughts }])
  }

  async function think(steps) {
    setIsThinking(true)
    for (const s of steps) {
      setCurrentThought(s)
      await new Promise(r => setTimeout(r, 600 + Math.random() * 600))
    }
    setIsThinking(false)
    setCurrentThought('')
  }

  // --- NLP / Intent Extraction Helpers ---

  function detectIntent(text, context) {
    const lower = text.toLowerCase()
    
    // 1. Explicit Movie Lookup (User mentions a specific movie title)
    // Heuristic: Matches known titles OR typical "watch [Title]" patterns
    if (KNOWN_MOVIES.some(m => lower.includes(m))) return 'movie_finder'
    
    // 2. General Platform Comparison / Advice (User asks about platforms generally)
    if (
      (lower.includes('which') || lower.includes('best') || lower.includes('cheap') || lower.includes('worth')) &&
      (lower.includes('platform') || lower.includes('service') || lower.includes('streaming') || lower.includes('netflix') || lower.includes('hbo') || lower.includes('prime'))
    ) {
      // If they also mention a movie, it might be specific, but if just platforms -> general
      return 'general_comparison'
    }

    // 3. Subscription Planning
    if (lower.includes('plan') || lower.includes('subscription') || lower.includes('bundle')) {
      return 'advisor'
    }

    // 4. Movie Finder (General intent to watch something)
    if (lower.includes('watch') || lower.includes('find') || lower.includes('movie') || lower.includes('stream')) {
      return 'movie_finder'
    }

    return null
  }

  function extractEntities(text, currentContext) {
    const lower = text.toLowerCase()
    const updates = {}

    // 1. Detect Intent if not set
    // Refined logic: Use separate detectIntent function
    const detectedIntent = detectIntent(text, currentContext)
    if (detectedIntent && !currentContext.intent) {
       updates.intent = detectedIntent
    }

    // 2. Extract Movie Title (heuristic: match known DB titles)
    if (!currentContext.movieTitle) {
      for (const title of KNOWN_MOVIES) {
        if (lower.includes(title)) {
          updates.movieTitle = title // Normalized key is usually title.toLowerCase() but we store display title or key? Let's match logic.
          // In movieLogic, keys are lowercased.
          break
        }
      }
    }

    // 3. Extract Country
    if (!currentContext.country) {
      if (lower.includes('uk') || lower.includes('united kingdom') || lower.includes('britain')) updates.country = 'UK'
      else if (lower.includes('us') || lower.includes('usa') || lower.includes('united states') || lower.includes('america')) updates.country = 'US'
    }

    // 4. Extract Budget (look for currency or standalone numbers)
    // Avoid confusing "4k" or "1 movie" with budget. Look for $ symbol or "dollars" or "pounds" or just a number if context implies.
    const budgetMatch = text.match(/(\$|£|€)?\s?(\d+)(\s?(dollars|pounds|bucks))?/)
    if (budgetMatch) {
       // Naive: take the number. If it's "4k", we might be wrong. Check surrounding.
       // If text says "4k", regex `\d+` matches 4.
       // Let's be stricter: require currency symbol OR keywords OR be in a "asking for budget" context (handled later).
       // For now, if user explicitly types "$15" or "15 dollars", capture it.
       if (budgetMatch[1] || budgetMatch[3]) {
          updates.budget = parseFloat(budgetMatch[2])
       } else if (!currentContext.budget && /^\d+$/.test(text.trim())) {
          // If message is JUST a number, assume it's the answer to a question (likely budget or people)
          updates.budget = parseFloat(text.trim())
       }
    }

    // 5. Advisor specific entities
    if (lower.includes('kid') || lower.includes('family')) updates.kids = true
    if (lower.includes('4k') || lower.includes('uhd')) updates.wants4k = true
    if (lower.includes('hd') && !lower.includes('uhd')) updates.wants4k = false
    
    return updates
  }

  // --- Main Message Handler ---
  async function handleUserMessage(userText) {
    const trimmed = userText.trim()
    if (!trimmed || isThinking) return

    addMessage('user', trimmed)

    // 0. Handle simple greetings
    const lower = trimmed.toLowerCase()
    const greetings = ['hi', 'hello', 'hey', 'yo', 'greetings']
    if (greetings.includes(lower.replace(/[^\w\s]/gi, ''))) {
      await think(['Processing greeting...'])
      addMessage('ai', "Hey.", [])
      return
    }

    // 1. Extract new info
    const updates = extractEntities(trimmed, context)
    
    // If we just found the intent, we might want to prioritize that logic
    const nextContext = { ...context, ...updates }
    
    // Special case: If user answers a specific question (e.g. "Just me" -> peopleCount=1), handle that if context implies.
    // Refinement: If budget was just extracted, use it.
    
    setContext(nextContext)

    // 2. Decide response based on state
    if (!nextContext.intent) {
      // Check if this looks like an answer to a pending question?
      // For now, if no intent and no entities, and not a number, it might be unrelated.
      
      // If user typed a number but we didn't have a context for it, it's ambiguous.
      // But let's check for unrelated topics.
      const isUnrelated = !nextContext.movieTitle && !nextContext.country && !nextContext.budget && 
                          !['movie', 'watch', 'stream', 'plan', 'subscription', 'cost', 'price', 'recommend', 'netflix', 'hbo', 'hulu', 'disney', 'prime', 'apple', 'peacock', 'paramount'].some(k => lower.includes(k))
      
      if (isUnrelated && !updates.budget && !updates.peopleCount) { // budget/peopleCount might be just numbers
        await think(['Analyzing intent...'])
        addMessage('ai', "Tell me a bit more — what movie are you thinking about?", ['Scope limit'])
        return
      }

      await think(['Analyzing intent...'])
      // Ambiguous. Ask clarifying question.
      addMessage('ai', "What are you trying to figure out?", ['Intent unclear'])
      return
    }

    if (nextContext.intent === 'movie_finder') {
      await handleMovieFinderFlow(nextContext, trimmed)
    } else if (nextContext.intent === 'general_comparison') {
      await handleGeneralComparison(nextContext, trimmed)
    } else {
      await handleAdvisorFlow(nextContext, trimmed)
    }
  }

  // --- Conversational Flow Logic ---

  async function handleGeneralComparison(ctx, lastInput) {
    // If they ask for a comparison, we don't need a movie title.
    // We just answer directly.
    
    // Check if country is known, as it affects the answer
    if (!ctx.country) {
      await think(['Checking regional differences...'])
      addMessage('ai', "If you're looking for the cheapest platform with the biggest catalog, Prime Video usually wins on value. Netflix is pricier but has more originals.\n\nWhich country are you in? Prices and libraries change a lot by region.", [])
      // We set context.country to null, so next input can fill it?
      // Actually, we just asked a question. Next input will go to handleUserMessage -> extractEntities -> update country -> re-enter flow.
      return
    }

    // If we have country, give specific advice
    await think(['Analyzing platform data...'])
    let msg = ''
    if (ctx.country === 'US') {
       msg = "In the US, **Prime Video** ($14.99/mo) offers the most movies for the price. **Netflix** Standard is $15.49 but has better exclusives. **Disney+** ($13.99) is great for franchises."
    } else if (ctx.country === 'UK') {
       msg = "In the UK, **Prime Video** (£8.99/mo) is a strong value. **Netflix** starts around £10.99. **Disney+** is £7.99."
    } else {
       msg = `In ${ctx.country}, prices vary, but **Prime Video** is generally the volume leader, while **Netflix** leads in originals.`
    }
    
    addMessage('ai', msg, [])
    // Clear intent so they can ask something else? 
    // Or keep it. Let's keep it for now.
  }

  async function handleMovieFinderFlow(ctx, lastInput) {
    // Check missing slots in order of importance
    
    // 1. Movie Title
    if (!ctx.movieTitle) {
      await think(['Checking movie database...'])
      addMessage('ai', "What movie would you like to watch?", ['Missing: Title'])
      return
    }

    // 2. Country
    if (!ctx.country) {
      await think(['Checking regional availability...'])
      addMessage('ai', "Which country are you in?", ['Missing: Country'])
      return
    }

    // 3. Budget
    if (!ctx.budget) {
      // If the last input was just the country, ask for budget.
      const num = parseFloat(lastInput)
      if (!isNaN(num) && num > 0 && num < 1000) {
        ctx.budget = num
        setContext(prev => ({ ...prev, budget: num }))
      } else {
        await think(['Checking price constraints...'])
        addMessage('ai', "What's your budget?", ['Missing: Budget'])
        return
      }
    }

    // 4. All set -> Generate Result
    await generateMovieResult(ctx)
  }

  async function generateMovieResult(ctx) {
    await think(['Comparing options...', 'Checking budget...', 'Formulating response...'])
    
    const result = await getMovieRecommendation(ctx.movieTitle, ctx.country, ctx.budget)
    
    if (result.error) {
       let reply = ''
       if (result.error === 'not_found') reply = `I don't have "${ctx.movieTitle}" listed yet. I mostly know about Inception, Dune, and The Matrix.`
       else if (result.error === 'budget_too_low') reply = `You might need a bit more than $${ctx.budget}. The cheapest option for ${ctx.movieTitle} in the ${ctx.country} is around $${result.message.split('cheapest is ')[1]}`
       else if (result.error === 'region_not_supported') reply = `I don't have data for ${ctx.country} yet. Try US or UK.`
       else reply = result.message
       
       addMessage('ai', reply, ['Error: ' + result.error])
       return
    }

    // Natural Language Summary
    const best = result.stats.cheapest
    const saved = result.stats.savings
    
    let msg = `Here's the deal for **${result.movie}** in the **${result.country}**.\n\n`
    
    if (best.type === 'rent') {
       msg += `Renting on **${best.platform}** is your best bet at $${best.cost.toFixed(2)}. `
       if (saved) msg += `It's cheaper than buying or subscribing right now. `
    } else if (best.type === 'subscription') {
       msg += `Using **${best.platform}** ($${best.cost.toFixed(2)}) makes the most sense if you're planning to watch more than one movie. `
    } else {
       msg += `You can watch it on **${best.platform}** for $${best.cost.toFixed(2)}. `
    }

    if (result.stats.breakEven) {
      msg += `\n\nJust so you know, ${result.stats.breakEven.toLowerCase()}.`
    }

    addMessage('ai', msg, ['Recommendation ready'])
  }

  async function handleAdvisorFlow(ctx, lastInput) {
    // Similar slot-filling for advisor...
    
    if (!ctx.budget) {
       // Check if last input was a number
       const num = parseFloat(lastInput)
       if (!isNaN(num)) {
         ctx.budget = num
         setContext(prev => ({ ...prev, budget: num }))
       } else {
         await think(['Analyzing budget...'])
         addMessage('ai', "What's your monthly budget?", ['Missing: Budget'])
         return
       }
    }

    if (!ctx.peopleCount) {
       if (lastInput.includes('just me') || lastInput.includes('1')) {
          ctx.peopleCount = 1
          setContext(prev => ({ ...prev, peopleCount: 1 }))
       } else {
          await think(['Checking household size...'])
          addMessage('ai', "How many people?", ['Missing: People'])
          return
       }
    }

    if (!ctx.wants4k && !lastInput.includes('hd') && !lastInput.includes('4k')) {
       addMessage('ai', "Do you need 4K?", ['Missing: Quality'])
       return
    }

    // If we get here, we have enough for a basic recommendation
    await think(['Generating plan...'])
    const advice = await getSubscriptionAdvice({ budgetMax: ctx.budget, peopleCount: ctx.peopleCount || 1, wants4k: ctx.wants4k || false })
    
    addMessage('ai', `You should go with **${advice.bestPlan.service} ${advice.bestPlan.label}**. It fits your $${ctx.budget} budget.`, ['Plan generated'])
  }

  function handleSubmit(e) {
    e.preventDefault()
    const text = input
    setInput('')
    handleUserMessage(text)
  }

  return (
    <Layout title="FLICO - Movie & Series Expert">
      <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
        <div className="mb-4 text-center">
          <h1 className="text-3xl font-bold text-white mb-1">
            FLICO
          </h1>
          <p className="text-gray-400 text-sm">
            Movie & Series Expert AI
          </p>
        </div>

        <div className="flex-1 card flex-col overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex flex-col ${m.role === 'ai' ? 'items-start' : 'items-end'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-md ${
                  m.role === 'ai'
                    ? 'bg-gray-800/80 border border-gray-700 text-gray-100 backdrop-blur-sm'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {/* Thoughts - subtle */}
                {/* REMOVED VISIBLE "THINKING" LABEL PER USER REQUEST */}
                
                <div className="whitespace-pre-wrap">
                  {m.text.split('**').map((part, i) => 
                    i % 2 === 1 ? <span key={i} className="font-bold text-blue-200">{part}</span> : part
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Thinking Indicator */}
          {isThinking && (
            <div className="flex items-start">
              <div className="max-w-[85%] rounded-2xl px-5 py-3 text-sm bg-gray-900/50 border border-gray-800 text-gray-400 flex items-center gap-3">
                 <div className="flex space-x-1">
                   <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                   <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                   <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                 </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-3 relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 rounded-2xl bg-gray-900/80 border border-gray-700 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={isThinking || !input.trim()}
            className="absolute right-2 p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 disabled:opacity-0 transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </form>
      </div>
    </Layout>
  )
}

