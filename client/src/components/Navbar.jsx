// client/src/components/Navbar.jsx
import React from 'react';
import { Sparkles, Moon, Sun, CheckCircle2, BookOpen, Brain, Compass, Clock, Award } from 'lucide-react';

export default function Navbar({ 
  currentDate, 
  readCardsCount, 
  totalCards, 
  answeredQuizCount, 
  totalQuiz, 
  theme, 
  toggleTheme,
  activeTab,
  setActiveTab,
  isQuizUnlocked,
  isQuizComplete
}) {
  const briefingPercent = totalCards > 0 ? Math.round((readCardsCount / totalCards) * 100) : 0;
  const quizPercent = totalQuiz > 0 ? Math.round((answeredQuizCount / totalQuiz) * 100) : 0;
  const overallPercent = Math.round((briefingPercent * 0.4) + (quizPercent * 0.6));

  const isLight = theme === 'light';

  // Format IST Date nicely
  const formatDateIST = (dateStr) => {
    try {
      const [year, month, day] = dateStr.split('-');
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-200 ${
      isLight ? 'border-slate-200/90 bg-white/90 shadow-xs' : 'border-slate-800/80 bg-slate-950/85'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Persona Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-md shadow-indigo-500/20 flex items-center justify-center">
              <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${isLight ? 'bg-white' : 'bg-slate-900'}`}>
                <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-lg tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Aura<span className="text-indigo-600">Tech</span>
                </span>
                <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  isLight ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                }`}>
                  Tech Architect Persona
                </span>
              </div>
              <p className={`text-xs flex items-center gap-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                <Clock className={`w-3 h-3 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                <span>IST Session: <strong className={isLight ? 'text-slate-700' : 'text-slate-300'}>{formatDateIST(currentDate)}</strong></span>
              </p>
            </div>
          </div>

          {/* Tab Navigation Pill in Header */}
          <nav className={`hidden md:flex items-center gap-1.5 p-1 rounded-xl border ${
            isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <button
              onClick={() => setActiveTab('briefing')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'briefing'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Briefing</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                readCardsCount === totalCards 
                  ? (isLight ? 'bg-emerald-100 text-emerald-800 font-semibold' : 'bg-emerald-500/20 text-emerald-300')
                  : (isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300')
              }`}>
                {readCardsCount}/{totalCards}
              </span>
            </button>

            <button
              onClick={() => {
                if (isQuizUnlocked) setActiveTab('quiz');
              }}
              title={isQuizUnlocked ? 'Active Recall Quiz' : 'Complete all briefing cards to unlock'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'quiz'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isQuizUnlocked
                  ? (isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-white/80' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50')
                  : (isLight ? 'text-slate-400 cursor-not-allowed opacity-60' : 'text-slate-600 cursor-not-allowed opacity-60')
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Recall Quiz</span>
              {!isQuizUnlocked ? (
                <span className={`text-[10px] px-1 rounded ${isLight ? 'bg-slate-200 text-slate-500' : 'bg-slate-800 text-slate-500'}`}>🔒</span>
              ) : (
                <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                  isQuizComplete 
                    ? (isLight ? 'bg-emerald-100 text-emerald-800 font-semibold' : 'bg-emerald-500/20 text-emerald-300')
                    : (isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300')
                }`}>
                  {answeredQuizCount}/{totalQuiz}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('steering')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'steering'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Steer Tomorrow</span>
            </button>
          </nav>

          {/* Quick Metrics & Theme Switch */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end text-xs">
              <div className={`flex items-center gap-1.5 font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                {overallPercent === 100 ? (
                  <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                  </span>
                ) : (
                  <span>{overallPercent}% Day Complete</span>
                )}
              </div>
              <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Cards: {readCardsCount}/{totalCards} • Quiz: {answeredQuizCount}/{totalQuiz}
              </span>
            </div>

            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-colors ${
                isLight 
                  ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {isLight ? <Moon className="w-4 h-4 text-indigo-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>
          </div>

        </div>

        {/* Sticky Progress Bar at Bottom of Navbar */}
        <div className={`h-1 w-full overflow-hidden relative ${isLight ? 'bg-slate-200' : 'bg-slate-800/60'}`}>
          <div 
            className="h-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      </div>
    </header>
  );
}
