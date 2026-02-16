
import { useState, useEffect } from 'react';
import { QUESTIONS, ARCHETYPES, PLATFORMS } from '../../lib/quizData';
import { discoverMovies } from '../../lib/tmdb';
import Card from '../Card';

export default function MoviePreferenceQuiz({ onFinish }) {
  const [started, setStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [scores, setScores] = useState({});
  const [results, setResults] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initialize scores
  useEffect(() => {
    const initialScores = {};
    Object.keys(ARCHETYPES).forEach(key => initialScores[ARCHETYPES[key].id] = 0);
    Object.keys(PLATFORMS).forEach(key => initialScores[PLATFORMS[key].id] = 0);
    setScores(initialScores);
  }, []);

  const handleAnswer = (weights) => {
    const newScores = { ...scores };
    Object.entries(weights).forEach(([key, val]) => {
      if (newScores[key] !== undefined) newScores[key] += val;
    });
    setScores(newScores);

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishQuiz(newScores);
    }
  };

  const finishQuiz = async (finalScores) => {
    setLoading(true);

    // Calculate Archetypes
    const archetypeScores = Object.values(ARCHETYPES).map(arch => ({
      ...arch,
      score: finalScores[arch.id] || 0
    })).sort((a, b) => b.score - a.score);

    const primary = archetypeScores[0];
    let secondary = null;
    
    // Check if secondary is within 15% of primary
    if (archetypeScores[1]) {
        const diff = primary.score - archetypeScores[1].score;
        // Avoid division by zero
        if (primary.score > 0 && (diff / primary.score) <= 0.15) {
            secondary = archetypeScores[1];
        }
    }

    // Calculate Platforms
    const platformScores = Object.values(PLATFORMS).map(plat => ({
      ...plat,
      score: finalScores[plat.id] || 0
    })).sort((a, b) => b.score - a.score);

    const topPlatforms = platformScores.slice(0, 2);

    setResults({
      primary,
      secondary,
      platforms: topPlatforms,
      archetypeBreakdown: archetypeScores // For chart/bars if needed
    });

    // Fetch Recommendations
    try {
      const genreIds = [...(primary.tmdbGenreIds || [])];
      if (secondary) genreIds.push(...(secondary.tmdbGenreIds || []));
      
      const providerIds = topPlatforms.map(p => p.tmdbProviderId).filter(Boolean);

      const recs = await discoverMovies({ genreIds, providerIds });
      setRecommendations(recs);
    } catch (e) {
      console.error("Failed to fetch recommendations", e);
    }

    setLoading(false);
  };

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fadeIn">
        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-6 pb-2">
          Discover Your Cinematic Soul
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-8">
          Take our premium 12-question analysis to reveal your true movie archetype, preferred platforms, and curated picks.
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => setStarted(true)}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-900/50"
          >
            Start Analysis
          </button>
          {onFinish && (
            <button 
              onClick={() => onFinish(null)}
              className="px-8 py-4 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white rounded-full font-medium text-lg transition-colors"
            >
              Skip for now
            </button>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 animate-pulse">Analyzing your preferences...</p>
      </div>
    );
  }

  if (results) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-fadeIn">
        {/* Results Header */}
        <div className="text-center mb-12">
          <h2 className="text-gray-400 uppercase tracking-widest text-sm mb-2">Your Result</h2>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">{results.primary.label}</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-6">{results.primary.description}</p>
          
          {results.secondary && (
            <div className="inline-block bg-gray-800/50 rounded-xl px-6 py-3 border border-gray-700 mt-2">
              <span className="text-gray-400 text-sm">Secondary Archetype:</span>
              <span className="text-white font-semibold ml-2">{results.secondary.label}</span>
            </div>
          )}
        </div>

        {/* Platforms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-gray-800">
            <h3 className="text-2xl font-bold text-white mb-6">Your Streaming DNA</h3>
            <div className="flex flex-wrap gap-4">
              {results.platforms.map(p => (
                <div key={p.id} className="flex items-center gap-3 bg-black/40 px-5 py-3 rounded-xl border border-gray-700">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }}></div>
                  <span className="text-white font-medium">{p.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-gray-800">
             <h3 className="text-2xl font-bold text-white mb-6">Archetype Breakdown</h3>
             <div className="space-y-4">
               {results.archetypeBreakdown.slice(0, 3).map((arch, i) => (
                 <div key={arch.id}>
                   <div className="flex justify-between text-sm mb-2">
                     <span className="text-gray-300">{arch.label}</span>
                     <span className="text-gray-500 text-xs">{Math.round(arch.score)} pts</span>
                   </div>
                   <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                     <div 
                       className="h-full bg-gradient-to-r from-blue-500 to-purple-500" 
                       style={{ width: `${results.primary.score > 0 ? (arch.score / results.primary.score) * 100 : 0}%` }}
                     ></div>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mb-12">
          <h3 className="text-3xl font-bold text-white mb-8">Curated For You</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {recommendations.map(movie => (
              <Card key={movie.id} item={movie} />
            ))}
          </div>
          {recommendations.length === 0 && (
             <p className="text-gray-400 text-center py-10 bg-[#1a1a1a] rounded-3xl">
                No specific recommendations found matching these exact criteria. 
                <br/>Try exploring our full library!
             </p>
          )}
        </div>
        
        <div className="text-center pb-12 flex gap-4 justify-center">
            {onFinish ? (
              <button 
                  onClick={() => onFinish(results)}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition-all transform hover:scale-105 shadow-lg shadow-blue-900/50"
              >
                  Save & Continue
              </button>
            ) : null}
            
            <button 
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full font-medium transition-colors border border-gray-700"
            >
                Retake Quiz
            </button>
        </div>
      </div>
    );
  }

  const currentQ = QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 min-h-[60vh] flex flex-col justify-center">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-gray-500 mb-2 uppercase tracking-wider">
          <span>Question {currentQuestionIndex + 1} of {QUESTIONS.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-[#1a1a1a] rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-800 animate-slideUp">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-tight">
          {currentQ.text}
        </h2>
        
        <div className="grid gap-4">
          {currentQ.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(opt.weights)}
              className="text-left p-5 rounded-xl bg-gray-900/50 hover:bg-blue-600/20 border border-gray-700 hover:border-blue-500/50 transition-all duration-200 group"
            >
              <span className="text-gray-300 group-hover:text-white font-medium text-lg">{opt.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
