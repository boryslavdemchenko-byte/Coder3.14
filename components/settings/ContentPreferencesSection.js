import { useRouter } from 'next/router';

export default function ContentPreferencesSection() {
  const router = useRouter();

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 mb-8 shadow-2xl relative overflow-hidden group/card">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>
            </div>
            Content Preferences
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xl">
            Retake the onboarding quiz to update your taste profile. This helps us refine your movie recommendations based on your current mood and preferences.
          </p>
        </div>
        
        <button 
          onClick={() => router.push('/onboarding')}
          className="whitespace-nowrap px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20 transform hover:scale-105 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Retake Quiz
        </button>
      </div>
    </div>
  );
}
