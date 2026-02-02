const GENRES = [
  { id: 'action', label: 'Action' },
  { id: 'comedy', label: 'Comedy' },
  { id: 'drama', label: 'Drama' },
  { id: 'scifi', label: 'Sci-Fi' },
  { id: 'horror', label: 'Horror' },
  { id: 'romance', label: 'Romance' },
  { id: 'documentary', label: 'Documentary' },
  { id: 'thriller', label: 'Thriller' },
];

const SERVICES = [
  { id: 'netflix', label: 'Netflix' },
  { id: 'hulu', label: 'Hulu' },
  { id: 'disney', label: 'Disney+' },
  { id: 'prime', label: 'Prime Video' },
  { id: 'hbo', label: 'HBO Max' },
  { id: 'apple', label: 'Apple TV+' },
];

export default function PreferencesSection({ formData, onChange }) {
  const genres = formData.genres || [];
  const platforms = formData.platforms || [];

  const toggleGenre = (id) => {
    if (genres.includes(id)) {
      onChange('genres', genres.filter(g => g !== id));
    } else if (genres.length < 5) {
      onChange('genres', [...genres, id]);
    }
  };

  const togglePlatform = (id) => {
    if (platforms.includes(id)) {
      onChange('platforms', platforms.filter(p => p !== id));
    } else if (platforms.length < 5) {
      onChange('platforms', [...platforms, id]);
    }
  };
  
  const handleReset = () => {
    // No confirm needed if not saving immediately, but good UX to warn if drastic
    onChange('genres', []);
    onChange('platforms', []);
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 mb-8 shadow-2xl relative overflow-hidden group/card">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-pink-600/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
            </div>
            Content Preferences
          </h2>
          {(genres.length > 0 || platforms.length > 0) && (
            <button 
              onClick={handleReset} 
              className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 hover:text-red-300 transition-all uppercase tracking-wider flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Reset All
            </button>
          )}
        </div>

        <div className="space-y-10">
          {/* Genres */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Favorite Genres</label>
              <span className={`text-xs font-bold px-2 py-1 rounded-md transition-colors ${genres.length >= 5 ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-gray-500'}`}>
                {genres.length} / 5 Selected
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {GENRES.map(g => {
                const isSelected = genres.includes(g.id);
                return (
                  <button
                    key={g.id}
                    onClick={() => toggleGenre(g.id)}
                    disabled={!isSelected && genres.length >= 5}
                    className={`
                      relative px-5 py-4 rounded-xl border text-sm font-bold transition-all duration-300 flex items-center justify-between group overflow-hidden
                      ${isSelected 
                        ? 'border-purple-500 text-white bg-purple-600/20 shadow-[0_0_20px_rgba(168,85,247,0.3)] scale-[1.02]' 
                        : 'border-white/10 text-gray-400 bg-black/20 hover:bg-white/5 hover:border-white/20 hover:text-white'
                      }
                      ${!isSelected && genres.length >= 5 ? 'opacity-40 cursor-not-allowed grayscale' : ''}
                    `}
                  >
                    <span className="relative z-10">{g.label}</span>
                    {isSelected && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-transparent" />
                        <svg className="w-5 h-5 text-purple-400 animate-in zoom-in duration-300 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Platforms */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Streaming Services</label>
              <span className={`text-xs font-bold px-2 py-1 rounded-md transition-colors ${platforms.length >= 5 ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-gray-500'}`}>
                {platforms.length} / 5 Selected
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {SERVICES.map(s => {
                const isSelected = platforms.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => togglePlatform(s.id)}
                    disabled={!isSelected && platforms.length >= 5}
                    className={`
                      relative px-5 py-4 rounded-xl border text-sm font-bold transition-all duration-300 flex items-center justify-center gap-3 group overflow-hidden
                      ${isSelected 
                        ? 'border-blue-500 text-white bg-blue-600/20 shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-[1.02]' 
                        : 'border-white/10 text-gray-400 bg-black/20 hover:bg-white/5 hover:border-white/20 hover:text-white'
                      }
                      ${!isSelected && platforms.length >= 5 ? 'opacity-40 cursor-not-allowed grayscale' : ''}
                    `}
                  >
                    <span className="relative z-10">{s.label}</span>
                    {isSelected && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent" />
                        <svg className="w-5 h-5 text-blue-400 animate-in zoom-in duration-300 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        
        <p className="mt-8 text-xs text-gray-500 flex items-center gap-2 bg-white/5 p-3 rounded-lg border border-white/5">
          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Your choices help our AI recommendation engine suggest better movies and shows tailored to your taste.
        </p>
      </div>
    </div>
  );
}
