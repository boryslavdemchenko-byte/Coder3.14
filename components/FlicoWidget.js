import { useState, useRef, useEffect } from 'react'
import { useUser } from '@supabase/auth-helpers-react'
import AuthModal from './AuthModal'

const SYSTEM_PROMPT = `
You are a friendly AI assistant that helps users discover movies and TV series.
You give recommendations, explain plots without spoilers, suggest similar titles,
and help users decide what to watch based on mood, genre, or platform.
You speak clearly, casually, and like ChatGPT.
`

export default function FlicoWidget() {
  const user = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [hasOpenedBefore, setHasOpenedBefore] = useState(false)
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  
  // Initialize with System Prompt
  const [messages, setMessages] = useState([
    { role: "system", content: SYSTEM_PROMPT }
  ])

  const messagesEndRef = useRef(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages, isOpen, isThinking])

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  function toggleWidget() {
    if (!user) {
      setAuthModalOpen(true)
      return
    }

    if (!isOpen && !hasOpenedBefore) {
      setHasOpenedBefore(true)
      // Initial greeting
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Hey! I can help you find movies, series, or streaming deals. Ask me anything! 🍿" }
      ])
    }
    setIsOpen(!isOpen)
  }

  async function handleUserMessage(text) {
    if (!text.trim() || isThinking) return

    const newMsg = { role: "user", content: text }
    // Optimistically update UI
    const updatedMessages = [...messages, newMsg]
    setMessages(updatedMessages)
    setInput('')
    setIsThinking(true)

    try {
      const res = await fetch('/api/flico-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages })
      })
      
      const data = await res.json()
      
      if (data.reply) {
        setMessages(prev => [...prev, data.reply])
      } else {
        throw new Error("No reply")
      }
    } catch (error) {
      console.error(error)
      setMessages(prev => [...prev, { role: "assistant", content: "I'm having a bit of trouble connecting. Please try again!" }])
    } finally {
      setIsThinking(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    handleUserMessage(input)
  }

  function handleSuggestion(text) {
    handleUserMessage(text)
  }

  const SUGGESTIONS = [
    "Recommend a sci-fi movie",
    "What's trending on Netflix?",
    "Is Breaking Bad worth it?"
  ]

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[400px] h-[600px] bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-gray-800/90 backdrop-blur px-4 py-3 border-b border-gray-700 flex items-center gap-3">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-lg shadow-lg shadow-blue-900/20">
               🎬
             </div>
             <div>
               <h3 className="text-white font-bold text-sm">FLICO AI</h3>
               <p className="text-gray-400 text-xs">Movie & Series Expert</p>
             </div>
             <button 
               onClick={toggleWidget}
               className="ml-auto text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-700 transition-colors"
             >
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                 <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
               </svg>
             </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-900/50">
            {messages.filter(m => m.role !== 'system').map((m, idx) => (
              <div key={idx} className={`flex flex-col ${m.role === 'assistant' ? 'items-start' : 'items-end'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                    m.role === 'assistant'
                      ? 'bg-gray-800 border border-gray-700 text-gray-100'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  <div className="whitespace-pre-wrap">
                    {m.content.split('**').map((part, i) => 
                      i % 2 === 1 ? <span key={i} className="font-bold text-blue-200">{part}</span> : part
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Suggestions (Only show if history is just system + greeting) */}
            {messages.filter(m => m.role !== 'system').length === 1 && (
               <div className="flex flex-wrap gap-2 mt-2">
                 {SUGGESTIONS.map(s => (
                   <button 
                     key={s}
                     onClick={() => handleSuggestion(s)}
                     className="text-xs bg-gray-800 hover:bg-gray-700 text-blue-300 border border-gray-700 px-3 py-1.5 rounded-full transition-colors"
                   >
                     {s}
                   </button>
                 ))}
               </div>
            )}

            {isThinking && (
              <div className="flex items-start">
                 <div className="bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 bg-gray-800/50 border-t border-gray-700">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about movies..."
                className="w-full bg-gray-900 text-white pl-4 pr-12 py-3 rounded-xl border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm shadow-inner transition-all placeholder-gray-500"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isThinking}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-lg shadow-blue-900/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                </svg>
              </button>
            </div>
            <div className="text-center mt-2">
              <p className="text-[10px] text-gray-500">Powered by OpenAI • Flico AI</p>
            </div>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={toggleWidget}
        className="group flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xl shadow-blue-900/40 transition-all hover:scale-105 active:scale-95 h-14 min-w-[3.5rem] px-0 hover:px-5"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        ) : (
          <>
            <span className="text-2xl group-hover:animate-pulse">🎬</span>
            <span className="max-w-0 overflow-hidden group-hover:max-w-[100px] transition-all duration-500 ease-out whitespace-nowrap text-sm font-bold ml-0 group-hover:ml-2 opacity-0 group-hover:opacity-100">
              Ask FLICO
            </span>
          </>
        )}
      </button>
    </div>
  )
}
