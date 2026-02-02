import { useState, useEffect } from 'react';
import * as tmdb from '../../lib/tmdb';
import { formatDate, isToday, getMonthGrid, parseDate } from './utils'; // Assume utils are in same dir
import Link from 'next/link';

const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

// --- ICONS ---
const Icons = {
  Grid: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
  List: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>,
  Close: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
};

export default function CalendarDrawer({ isOpen, onClose }) {
  const [view, setView] = useState('agenda'); // 'agenda' | 'grid'
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'movie' | 'tv'

  useEffect(() => {
    if (isOpen && data.length === 0) {
      loadData();
    }
  }, [isOpen]);

  async function loadData() {
    setLoading(true);
    try {
      const res = await tmdb.getCalendarData();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Flatten data for filtering
  const allReleases = data.flatMap(group => 
    group.items.map(item => ({ ...item, date: group.date }))
  );

  const filteredReleases = allReleases.filter(item => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  // Re-group for agenda
  const groupedData = filteredReleases.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedData).sort();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div 
        className={`
          fixed top-0 right-0 h-full bg-[#0f0f0f] border-l border-white/10 shadow-2xl z-50
          transition-transform duration-300 ease-in-out flex flex-col
          w-full sm:w-[420px]
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex flex-col border-b border-white/10 bg-[#0f0f0f] z-10">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              📅 Release Calendar
            </h2>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <Icons.Close />
            </button>
          </div>

          {/* Controls */}
          <div className="px-4 pb-4 flex items-center justify-between gap-4">
            {/* View Toggle */}
            <div className="flex bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setView('agenda')}
                className={`p-1.5 rounded-md transition-all ${view === 'agenda' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                title="List View"
              >
                <Icons.List />
              </button>
              <button
                onClick={() => setView('grid')}
                className={`p-1.5 rounded-md transition-all ${view === 'grid' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                title="Grid View"
              >
                <Icons.Grid />
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
               <button 
                 onClick={() => setFilterType('all')}
                 className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${filterType === 'all' ? 'bg-white text-black border-white' : 'border-white/20 text-gray-400 hover:border-white/50'}`}
               >
                 All
               </button>
               <button 
                 onClick={() => setFilterType('movie')}
                 className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${filterType === 'movie' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'border-white/20 text-gray-400 hover:border-white/50'}`}
               >
                 Movies
               </button>
               <button 
                 onClick={() => setFilterType('tv')}
                 className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${filterType === 'tv' ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' : 'border-white/20 text-gray-400 hover:border-white/50'}`}
               >
                 Series
               </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#0f0f0f]">
          {loading ? (
             <div className="flex items-center justify-center h-40">
               <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
             </div>
          ) : sortedDates.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-64 text-gray-500">
               <p>No releases found</p>
               <button onClick={loadData} className="mt-2 text-blue-400 text-sm hover:underline">Retry</button>
             </div>
          ) : view === 'agenda' ? (
             <AgendaView dates={sortedDates} groupedData={groupedData} onClose={onClose} />
          ) : (
             <MonthGridView releases={filteredReleases} onClose={onClose} />
          )}
        </div>
      </div>
    </>
  );
}

function AgendaView({ dates, groupedData, onClose }) {
  return (
    <div className="pb-20">
      {dates.map(date => {
        const isTodayDate = isToday(date);
        return (
          <div key={date} className="relative mb-6">
            {/* Date Header - Sticky */}
            <div className={`sticky top-0 z-10 px-4 py-2 text-sm font-bold uppercase tracking-wider flex items-center justify-between backdrop-blur-md
              ${isTodayDate ? 'bg-blue-900/40 text-blue-200 border-b border-blue-500/30' : 'bg-[#0f0f0f]/95 text-gray-300 border-b border-white/5'}
            `}>
              <span>{formatDate(date)}</span>
              {isTodayDate && <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px]">TODAY</span>}
            </div>

            {/* Items */}
            <div className="divide-y divide-white/5">
              {groupedData[date].map(item => (
                <ReleaseRow key={item.id} item={item} onClose={onClose} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ReleaseRow({ item, onClose }) {
  const posterSrc = item.poster || (item.posterPath ? `${IMG_BASE}${item.posterPath}` : null);
  
  return (
    <Link 
      href={`/title/${item.id}?type=${item.type}`}
      onClick={onClose}
      className="group block p-4 hover:bg-white/5 transition-colors relative"
    >
      <div className="flex gap-4">
         {/* Poster */}
         <div className="w-16 h-24 flex-shrink-0 bg-white/5 rounded-md overflow-hidden relative shadow-lg">
           {posterSrc ? (
             <img src={posterSrc} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
           ) : (
             <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No Img</div>
           )}
           {/* Type Badge */}
           <div className={`absolute top-0 left-0 px-1.5 py-0.5 text-[10px] font-bold text-white
             ${item.type === 'movie' ? 'bg-blue-600' : 'bg-purple-600'}
           `}>
             {item.type === 'movie' ? 'M' : 'TV'}
           </div>
         </div>

         <div className="flex-1 min-w-0 flex flex-col justify-center">
           <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
             {item.title}
           </h4>
           <div className="text-xs text-gray-400 mt-1 line-clamp-1">
             {item.genres?.slice(0, 2).join(', ')}
           </div>
           
           {/* Metadata row */}
           <div className="flex items-center gap-3 mt-2">
             {item.rating && (
               <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-gray-300">
                 ★ {item.rating.toFixed(1)}
               </span>
             )}
           </div>
        </div>
        
        {/* Action Hint */}
        <div className="flex items-center text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </div>
      </div>
    </Link>
  );
}

function MonthGridView({ releases, onClose }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const grid = getMonthGrid(year, month);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Map releases to days
  const releasesByDay = {};
  releases.forEach(r => {
    const rDate = parseDate(r.date);
    if (rDate && rDate.getMonth() === month && rDate.getFullYear() === year) {
        const d = rDate.getDate();
        if (!releasesByDay[d]) releasesByDay[d] = [];
        releasesByDay[d].push(r);
    }
  });

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  }
  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  }

  const selectedReleases = selectedDay ? (releasesByDay[selectedDay] || []) : [];

  return (
    <div className="pb-20 p-4">
      <div className="flex items-center justify-between mb-6 bg-white/5 p-2 rounded-xl">
        <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="text-sm font-bold text-white">{monthName}</div>
        <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-xs font-bold text-gray-500">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {grid.map((date, i) => {
           if (!date) return <div key={i} className="aspect-square" />;
           
           const dayNum = date.getDate();
           const dayReleases = releasesByDay[dayNum] || [];
           const isTodayCell = isToday(date.toISOString());
           const hasReleases = dayReleases.length > 0;
           const isSelected = selectedDay === dayNum;

           return (
             <button 
               key={i} 
               onClick={() => setSelectedDay(dayNum)}
               className={`
                 aspect-square rounded-lg flex flex-col items-center justify-center relative border transition-all
                 ${isSelected ? 'bg-blue-600 border-blue-400 text-white shadow-lg z-10' : 
                   isTodayCell ? 'bg-blue-900/20 border-blue-500 text-blue-400' : 
                   'bg-white/5 border-transparent hover:bg-white/10 text-gray-300'}
                 ${!hasReleases && !isSelected ? 'opacity-50 hover:opacity-100' : ''}
               `}
             >
               <span className="text-xs font-medium">{dayNum}</span>
               {hasReleases && (
                 <div className="flex gap-0.5 mt-1">
                    {dayReleases.slice(0, 3).map((r, idx) => (
                      <div key={idx} className={`w-1 h-1 rounded-full ${r.type === 'movie' ? 'bg-blue-400' : 'bg-purple-400'}`} />
                    ))}
                 </div>
               )}
             </button>
           );
        })}
      </div>

      {/* Day Detail Peek */}
      {selectedDay && (
        <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-4 animate-in slide-in-from-top-4 fade-in duration-300">
           <h4 className="text-sm font-bold text-white mb-3 flex justify-between items-center">
             <span>{currentDate.toLocaleString('default', { month: 'short' })} {selectedDay} Releases</span>
             <button onClick={() => setSelectedDay(null)} className="text-xs text-gray-400 hover:text-white bg-white/10 px-2 py-0.5 rounded-full">Close</button>
           </h4>
           {selectedReleases.length > 0 ? (
             <div className="grid grid-cols-1 gap-2">
                {selectedReleases.map(item => (
                    <ReleaseRow key={item.id} item={item} onClose={onClose} />
                ))}
             </div>
           ) : (
             <p className="text-gray-500 text-center py-4 text-sm">No releases scheduled for this day.</p>
           )}
        </div>
      )}
    </div>
  );
}
