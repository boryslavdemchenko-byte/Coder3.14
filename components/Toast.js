export default function Toast({message, onClose}){
  if(!message) return null
  return (
    <div className="fixed bottom-24 right-6 bg-[#2a2a2a] border border-white/10 text-white p-4 rounded-lg shadow-2xl flex items-center gap-4 z-[100] animate-fade-in-up">
      <div className="text-sm font-medium">{message}</div>
      <button onClick={onClose} className="text-gray-400 hover:text-white transition">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  )
}
