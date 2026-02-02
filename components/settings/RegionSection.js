import { useState, useRef, useEffect } from 'react';
import { countries } from '../../lib/countries';

export default function RegionSection({ region, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const wrapperRef = useRef(null);

  const currentCountry = countries.find(c => c.code === region) || countries.find(c => c.code === 'US');

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (code) => {
    onChange('region', code);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 mb-8 shadow-2xl relative overflow-hidden group/card">
      <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-emerald-600/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            Region Settings
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Select Your Region</label>
            <div className="relative" ref={wrapperRef}>
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-5 py-4 rounded-xl border text-white flex items-center justify-between outline-none transition-all duration-300 group
                  ${isOpen 
                    ? 'bg-black/60 border-green-500 ring-1 ring-green-500/50 shadow-lg shadow-green-900/20' 
                    : 'bg-black/40 border-white/10 hover:border-white/20 hover:bg-black/50'}
                `}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl drop-shadow-md">{currentCountry?.flag}</span>
                  <div className="text-left">
                    <span className="block font-bold text-base">{currentCountry?.name}</span>
                    <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">Current Region</span>
                  </div>
                </div>
                <svg className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-green-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && (
                <div className="absolute z-50 w-full mt-3 bg-[#1e1e1e] border border-white/10 rounded-2xl shadow-2xl max-h-80 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 origin-top">
                  <div className="p-3 border-b border-white/5 sticky top-0 bg-[#1e1e1e]/95 backdrop-blur-sm z-10">
                    <div className="relative group">
                      <input
                        type="text"
                        placeholder="Search countries..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:border-green-500 outline-none transition-all"
                        autoFocus
                      />
                      <svg className="w-4 h-4 text-gray-500 absolute left-3.5 top-3 group-focus-within:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="overflow-y-auto custom-scrollbar flex-1 p-2 space-y-1">
                    {filteredCountries.map(c => (
                      <button
                        key={c.code}
                        onClick={() => handleSelect(c.code)}
                        className={`w-full px-4 py-3 rounded-xl flex items-center gap-4 transition-all text-left
                          ${region === c.code ? 'bg-green-600/20 text-green-400 border border-green-500/20' : 'text-gray-300 hover:bg-white/5 hover:text-white border border-transparent'}
                        `}
                      >
                        <span className="text-2xl w-8 text-center">{c.flag}</span>
                        <span className="flex-1 font-medium">{c.name}</span>
                        {region === c.code && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        )}
                      </button>
                    ))}
                    {filteredCountries.length === 0 && (
                      <div className="px-4 py-8 text-center text-gray-500 flex flex-col items-center gap-2">
                        <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-sm">No countries found</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button 
              type="button"
              onClick={() => {
                fetch('https://ipapi.co/json/')
                  .then(res => res.json())
                  .then(data => {
                    if(data.country_code) onChange('region', data.country_code);
                    else alert('Could not automatically detect region.');
                  })
                  .catch(() => alert('Network error: Could not detect region.'));
              }}
              className="mt-4 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-2 transition-all font-medium group px-2 py-1 -ml-2 rounded-lg hover:bg-blue-500/10"
            >
              <span className="p-1.5 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </span>
              Auto-detect my region
            </button>
          </div>

          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-6 border border-white/5 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-green-500/10 rounded-full blur-xl pointer-events-none" />
            
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 z-10">
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              How this affects you
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-6 z-10">
              Your region setting helps us customize your experience by providing accurate information about:
            </p>
            <ul className="text-sm text-gray-400 space-y-3 list-none mb-6 z-10">
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                Streaming availability & providers
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                Local release dates & cinema listings
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                Regional pricing (where applicable)
              </li>
            </ul>
            <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between z-10">
               <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Selection</span>
               <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg border border-white/5 shadow-inner">
                 <span className="text-lg">{currentCountry?.flag}</span>
                 <span className="text-sm font-bold text-white">{currentCountry?.name}</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
