import { useState, useRef, useEffect } from 'react'
import { useUser } from '@supabase/auth-helpers-react'
import ReactMarkdown from 'react-markdown'
import AuthModal from './AuthModal'

const SYSTEM_PROMPT = `
You are a friendly AI assistant that helps users discover movies and TV series.
You give recommendations, explain plots without spoilers, suggest similar titles,
and help users decide what to watch based on mood, genre, or platform.
You speak clearly, casually, and like ChatGPT.
`

export default function FlicoWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "assistant", content: "Hey! I'm Flico. Looking for a movie recommendation?" }
  ])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const user = useUser()

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen, isThinking])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isThinking) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, isThinking])

  function toggleWidget() {
    setIsOpen(!isOpen)
  }

  function handleClearChat() {
    setMessages([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "assistant", content: "Chat cleared. What can I help you find now?" }
    ])
  }

  async function handleUserMessage(text) {
    if (!text.trim() || isThinking) return

    const newMsg = { role: "user", content: text }
    // Optimistically update UI
    const updatedMessages = [...messages, newMsg]
    setMessages(updatedMessages)
    setInput('')
    setIsThinking(true)

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }

    try {
      const res = await fetch('/api/flico-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to connect to AI service")
      }

      if (data.reply) {
        setMessages(prev => [...prev, data.reply])
      } else {
        throw new Error("No reply received from AI")
      }
    } catch (error) {
      console.error(error)
      const errorMessage = error.message || "I'm having a bit of trouble connecting. Please try again!"
      
      let displayMessage = "I'm having a bit of trouble connecting. Please try again!"
      if (errorMessage.includes("quota") || errorMessage.includes("billing")) {
        displayMessage = "I've run out of credits (Quota Exceeded). Please add credits to your [OpenAI billing account](https://platform.openai.com/billing)."
      } else if (errorMessage.includes("API key")) {
        displayMessage = "My brain is missing (API Key error). Please check the setup."
      } else {
        displayMessage = `Error: ${errorMessage}`
      }

      setMessages(prev => [...prev, { role: "assistant", content: displayMessage }])
    } finally {
      setIsThinking(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    handleUserMessage(input)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleUserMessage(input)
    }
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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[380px] sm:w-[420px] h-[600px] max-h-[80vh] bg-[#0f0f0f]/95 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 ring-1 ring-white/5">
          
          {/* Header */}
          <div className="bg-white/5 backdrop-blur-md px-5 py-4 border-b border-white/10 flex items-center justify-between z-10">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-blue-500/20">
                 🤖
               </div>
               <div>
                 <h3 className="text-white font-bold text-base tracking-wide">Flico AI</h3>
                 <div className="flex items-center gap-1.5">
                   <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                   <p className="text-gray-400 text-xs font-medium">Online</p>
                 </div>
               </div>
             </div>
             <div className="flex items-center gap-1">
               <button 
                 onClick={handleClearChat}
                 className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                 title="Clear Chat"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                 </svg>
               </button>
               <button 
                 onClick={toggleWidget}
                 className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                   <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                 </svg>
               </button>
             </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide bg-gradient-to-b from-transparent to-black/20">
            {messages.filter(m => m.role !== 'system').map((m, idx) => (
              <div key={idx} className={`flex flex-col ${m.role === 'assistant' ? 'items-start' : 'items-end'} animate-in slide-in-from-bottom-2 duration-300`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-md ${
                    m.role === 'assistant'
                      ? 'bg-[#1a1a1a] border border-white/10 text-gray-100 rounded-tl-sm'
                      : 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-sm shadow-blue-500/10'
                  }`}
                >
                  {m.role === 'assistant' ? (
                    <div className="markdown-body text-gray-100">
                      <ReactMarkdown
                        components={{
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                          li: ({node, ...props}) => <li className="" {...props} />,
                          a: ({node, ...props}) => <a className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-bold text-blue-200" {...props} />,
                          code: ({node, inline, ...props}) => 
                            inline 
                              ? <code className="bg-gray-800 px-1 py-0.5 rounded text-xs font-mono text-pink-400" {...props} />
                              : <code className="block bg-gray-800 p-2 rounded text-xs font-mono text-gray-300 overflow-x-auto my-2" {...props} />
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
                {m.role === 'assistant' && (
                  <span className="text-[10px] text-gray-500 mt-1 ml-1">Flico AI</span>
                )}
              </div>
            ))}
            
            {/* Suggestions */}
            {messages.filter(m => m.role !== 'system').length === 1 && (
               <div className="grid grid-cols-1 gap-2 mt-4 animate-in fade-in slide-in-from-bottom-4 delay-300">
                 <p className="text-xs text-gray-500 mb-1 ml-1">Try asking...</p>
                 {SUGGESTIONS.map(s => (
                   <button 
                     key={s}
                     onClick={() => handleSuggestion(s)}
                     className="text-left text-xs bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 px-4 py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-between group"
                   >
                     {s}
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                     </svg>
                   </button>
                 ))}
               </div>
            )}

            {isThinking && (
              <div className="flex items-start animate-pulse">
                 <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-[#0f0f0f] border-t border-white/10">
            <form 
              onSubmit={handleSubmit} 
              className="relative flex items-end gap-2 bg-[#1a1a1a] border border-white/10 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 rounded-2xl p-2 transition-all"
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = e.target.scrollHeight + 'px'
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask Flico..."
                className="w-full bg-transparent text-white pl-3 py-2.5 min-h-[44px] resize-none focus:outline-none text-sm placeholder-gray-500 scrollbar-hide overflow-hidden"
                rows={1}
              />
              <button 
                type="submit"
                disabled={!input.trim() || isThinking}
                className="flex-shrink-0 p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-900/20 mb-0.5"
              >
                {isThinking ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                  </svg>
                )}
              </button>
            </form>
            <div className="text-center mt-3 flex items-center justify-center gap-1.5 opacity-50">
              <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
              <p className="text-[10px] text-gray-400">Powered by OpenAI • Flico AI</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={toggleWidget}
          className="group relative flex items-center justify-center w-16 h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all hover:scale-110 active:scale-95"
        >
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-gray-900"></span>
          </span>
          <span className="text-3xl group-hover:rotate-12 transition-transform duration-300">🤖</span>
        </button>
      )}
    </div>
  )
}
