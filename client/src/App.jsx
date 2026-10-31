// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  BookOpen, 
  Brain, 
  Compass, 
  Calendar, 
  CheckCircle2, 
  RotateCcw, 
  Flame, 
  Award,
  AlertCircle,
  Layers,
  ArrowRight
} from 'lucide-react';

import Navbar from './components/Navbar';
import HistoryContextPanel from './components/HistoryContextPanel';
import BriefingCard from './components/BriefingCard';
import QuizSection from './components/QuizSection';
import DailySynthesisCard from './components/DailySynthesisCard';
import SteeringCard from './components/SteeringCard';

import { 
  fetchDailySessionFromFirestore, 
  saveDailySessionToFirestore, 
  fetchLearningHistory, 
  recordCompletedSession,
  loadFocusDraft,
  saveFocusDraft,
  cleanupFutureSessions,
  deleteDailySession
} from './firebase';

export default function App() {
  // Determine local date in IST (Asia/Kolkata)
  const getTodayIST = () => {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  };

  const [currentDate, setCurrentDate] = useState(getTodayIST());
  const [session, setSession] = useState(null);
  const [historySummary, setHistorySummary] = useState("");
  const [historyRecords, setHistoryRecords] = useState([]);
  const [focusDraft, setFocusDraft] = useState({ categories: [], prompt: "" });
  
  const [activeTab, setActiveTab] = useState('briefing'); // 'briefing' | 'quiz' | 'steering'
  const [theme, setTheme] = useState('light'); // Clean light mode default as requested
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingTomorrow, setIsGeneratingTomorrow] = useState(false);
  const [notification, setNotification] = useState(null);

  const isLight = theme === 'light';

  // Trigger celebration confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (_) {}
  };

  // Show temporary toast notification
  const showToast = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Toggle light/dark theme
  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
  };

  // Initial load: Fetch Firestore learning history, focus draft, and daily session
  useEffect(() => {
    async function initApp() {
      setIsLoading(true);
      try {
        // 1. Purge any lingering mock seed records or pre-written future sessions
        try {
          const raw = localStorage.getItem("adaptive_learning_history");
          if (raw && (raw.includes("2026-10-19") || raw.includes("2026-10-20"))) {
            localStorage.removeItem("adaptive_learning_history");
          }
        } catch (_) {}

        // Ensure no pre-written sessions exist for future dates
        await cleanupFutureSessions(currentDate);

        // 2. Load draft steering settings
        const draft = await loadFocusDraft();
        setFocusDraft(draft);

        // 3. Load learning history
        const history = await fetchLearningHistory();
        setHistoryRecords(history);

        // 4. Load or generate session for currentDate dynamically
        await loadOrGenerateSession(currentDate, draft, history);
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    initApp();
  }, [currentDate]);

  // Load existing session from Firestore or generate on-demand dynamically
  const loadOrGenerateSession = async (dateStr, draftData, historyList, forceRegenerate = false) => {
    if (!forceRegenerate) {
      // 1. Check if session already stored in Firestore
      const existing = await fetchDailySessionFromFirestore(dateStr);
      
      // Auto-detect if existing cached session has old format or unverified URLs
      const hasOldFormat = existing?.cards?.some(c => 
        !c.topicId?.includes("-tier") && c.isProgression === undefined
      );
      const hasOldLinks = existing?.cards?.some(c => 
        c.deeperDive?.some(d => d.url?.includes('F07fZg0u73I') || d.url?.includes('process-supervision') || d.url?.includes('kmbOD_oXk-s'))
      );

      // If existing session is COMPLETED, preserve user's diagnostic results
      if (existing && existing.status === "quiz-completed") {
        setSession(existing);
        try {
          const res = await fetch('/api/historical-summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completedSessions: historyList || historyRecords })
          });
          const resJson = await res.json();
          if (resJson.success) {
            setHistorySummary(resJson.summary);
          }
        } catch (e) {
          console.warn("Failed to fetch historical summary:", e);
        }
        return;
      }

      // If existing session is in-progress and modern, keep it
      if (existing && existing.cards && existing.cards.length > 0 && !hasOldFormat && !hasOldLinks) {
        setSession(existing);
        try {
          const res = await fetch('/api/historical-summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completedSessions: historyList || historyRecords })
          });
          const resJson = await res.json();
          if (resJson.success) {
            setHistorySummary(resJson.summary);
          }
        } catch (e) {
          console.warn("Failed to fetch historical summary:", e);
        }
        return;
      }
    }

    // 2. Generate dynamically on-demand for this date
    try {
      const res = await fetch('/api/generate-daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dateStr,
          preferences: draftData || focusDraft,
          completedSessions: historyList || historyRecords
        })
      });

      const data = await res.json();
      if (data.success && data.session) {
        setSession(data.session);
        setHistorySummary(data.historySummary);
        // Persist fresh session to Firestore
        await saveDailySessionToFirestore(data.session);
      }
    } catch (err) {
      console.error("Error generating daily session:", err);
    }
  };

  // Re-roll / regenerate today's feed dynamically on-demand
  const handleRegenerateToday = async () => {
    setIsLoading(true);
    try {
      await deleteDailySession(currentDate);
      await loadOrGenerateSession(currentDate, focusDraft, historyRecords, true);
      showToast("🎲 Fresh randomized feed and active recall quiz generated for today!");
    } catch (err) {
      console.error("Error regenerating daily session:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle marking an individual briefing card as Read / Done
  const handleToggleReadCard = async (cardId) => {
    if (!session) return;
    
    const updatedCards = session.cards.map(c => {
      if (c.id === cardId) {
        return { ...c, read: !c.read };
      }
      return c;
    });

    const wasAllReadBefore = session.cards.every(c => c.read);
    const isAllReadNow = updatedCards.every(c => c.read);

    const updatedSession = {
      ...session,
      cards: updatedCards,
      status: isAllReadNow ? "briefing-completed" : "in-progress"
    };

    setSession(updatedSession);
    await saveDailySessionToFirestore(updatedSession);

    // If just completed all briefing cards, unlock quiz and celebrate!
    if (!wasAllReadBefore && isAllReadNow) {
      triggerConfetti();
      showToast("🎉 All briefing cards completed! Active Recall Quiz is now UNLOCKED!");
    }
  };

  // Handle submitting an individual active recall quiz question
  const handleAnswerSubmit = async (questionId, selectedOptionIndex) => {
    if (!session) return;

    let justCorrect = false;
    const updatedQuiz = session.quiz.map(q => {
      if (q.id === questionId) {
        const isCorrect = selectedOptionIndex === q.correctIndex;
        if (isCorrect) justCorrect = true;
        return {
          ...q,
          submitted: true,
          selectedOption: selectedOptionIndex,
          isCorrect
        };
      }
      return q;
    });

    const allQuestionsSubmitted = updatedQuiz.every(q => q.submitted);
    let updatedSession = {
      ...session,
      quiz: updatedQuiz
    };

    // If all questions now submitted, evaluate and generate synthesis
    if (allQuestionsSubmitted) {
      try {
        const evalRes = await fetch('/api/evaluate-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quizResults: updatedQuiz,
            cards: session.cards,
            date: session.date,
            completedSessions: historyRecords,
            preferences: focusDraft
          })
        });

        const evalData = await evalRes.json();
        if (evalData.success) {
          updatedSession.synthesis = evalData.synthesis;
          updatedSession.status = "quiz-completed";
          
          // Record completion in history & Firestore
          await recordCompletedSession(updatedSession);
          
          // Refresh local history list
          const updatedHist = await fetchLearningHistory();
          setHistoryRecords(updatedHist);

          // Dynamically tailor tomorrow's focus draft from today's scores
          if (evalData.tomorrowRecommendation) {
            const nextDraft = {
              categories: evalData.tomorrowRecommendation.categories,
              prompt: evalData.tomorrowRecommendation.prompt
            };
            setFocusDraft(nextDraft);
            await saveFocusDraft(nextDraft);
          }

          triggerConfetti();
          showToast("🏆 Daily Diagnostic Complete! Synthesis logged and tomorrow's focus primed from your scores.");
        }
      } catch (err) {
        console.error("Error evaluating quiz:", err);
      }
    }

    setSession(updatedSession);
    await saveDailySessionToFirestore(updatedSession);
  };

  // Handle saving customized focus draft
  const handleSaveDraft = async (newDraft) => {
    setFocusDraft(newDraft);
    await saveFocusDraft(newDraft);
    showToast("💾 Saved steering preferences! Tomorrow's feed will be generated dynamically using this focus vector.");
  };

  // Save steering vector for tomorrow without writing ahead of time to the database
  const handleGenerateTomorrow = async (customSteering) => {
    await handleSaveDraft(customSteering);
  };

  // Metrics calculations
  const totalCards = session?.cards?.length || 0;
  const readCardsCount = session?.cards?.filter(c => c.read)?.length || 0;
  const isQuizUnlocked = totalCards > 0 && readCardsCount === totalCards;
  
  const totalQuiz = session?.quiz?.length || 0;
  const answeredQuizCount = session?.quiz?.filter(q => q.submitted)?.length || 0;
  const correctQuizCount = session?.quiz?.filter(q => q.submitted && q.isCorrect)?.length || 0;
  const isQuizComplete = totalQuiz > 0 && answeredQuizCount === totalQuiz;

  return (
    <div className={`min-h-screen transition-colors duration-200 font-sans ${
      isLight ? 'bg-[#f8fafc] text-slate-800' : 'bg-[#0f172a] text-slate-100'
    }`}>
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-xl text-xs sm:text-sm font-medium ${
            isLight ? 'bg-white border-emerald-400 text-slate-800' : 'bg-slate-900 border-emerald-500/50 text-white'
          }`}>
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Sticky Navbar with Live Progress Bar */}
      <Navbar
        currentDate={currentDate}
        readCardsCount={readCardsCount}
        totalCards={totalCards}
        answeredQuizCount={answeredQuizCount}
        totalQuiz={totalQuiz}
        theme={theme}
        toggleTheme={toggleTheme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isQuizUnlocked={isQuizUnlocked}
        isQuizComplete={isQuizComplete}
      />

      {/* Main Dashboard Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Date Selector & Simulation Switcher */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b ${
          isLight ? 'border-slate-200' : 'border-slate-800/60'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isLight ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-500/10 text-indigo-400'}`}>
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className={`text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                <span>Daily Architectural Briefing</span>
                {session?.theme && (
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border hidden md:inline ${
                    isLight 
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                      : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                  }`}>
                    {session.theme}
                  </span>
                )}
              </h1>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Grounding bleeding-edge technical paradigms in first-principles computer science
              </p>
            </div>
          </div>

          {/* Quick Date Switcher for demo/testing */}
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Simulate Date:</span>
            <input 
              type="date"
              value={currentDate}
              onChange={(e) => {
                if (e.target.value) setCurrentDate(e.target.value);
              }}
              className={`border rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono ${
                isLight 
                  ? 'bg-white border-slate-300 text-slate-800' 
                  : 'bg-slate-900 border-slate-800 text-slate-200'
              }`}
            />
            <button
              onClick={() => setCurrentDate(getTodayIST())}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Reset to today's local IST date"
            >
              Today
            </button>
            <button
              onClick={handleRegenerateToday}
              disabled={isLoading}
              className={`px-3 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isLight 
                  ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200' 
                  : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
              }`}
              title="Randomly regenerate today's feed and active recall quiz on-the-fly"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Regenerate Feed</span>
            </button>
          </div>
        </div>

        {/* 3. HISTORICAL TOPIC SUMMARY MODULE: Top Panel (180-280 words) */}
        <HistoryContextPanel 
          historicalSummary={historySummary} 
          historyRecords={historyRecords} 
          theme={theme}
        />

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin mx-auto" />
            <p className={`text-sm font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Synthesizing daily curriculum from first-principles database...
            </p>
          </div>
        ) : (
          <>
            {/* Tab Navigation Controls (Mobile) */}
            <div className={`flex md:hidden border-b mb-6 gap-2 overflow-x-auto pb-2 ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}>
              <button
                onClick={() => setActiveTab('briefing')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 ${
                  activeTab === 'briefing' ? 'bg-indigo-600 text-white' : (isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-900 text-slate-400')
                }`}
              >
                Briefing ({readCardsCount}/{totalCards})
              </button>

              <button
                onClick={() => {
                  if (isQuizUnlocked) setActiveTab('quiz');
                  else showToast("Mark all briefing cards as Read to unlock Quiz!", "warning");
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 ${
                  activeTab === 'quiz' 
                    ? 'bg-indigo-600 text-white' 
                    : isQuizUnlocked
                    ? (isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-900 text-slate-400')
                    : (isLight ? 'bg-slate-100 text-slate-400' : 'bg-slate-900/50 text-slate-600')
                }`}
              >
                Recall Quiz {!isQuizUnlocked && '🔒'}
              </button>

              <button
                onClick={() => setActiveTab('steering')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 ${
                  activeTab === 'steering' ? 'bg-indigo-600 text-white' : (isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-900 text-slate-400')
                }`}
              >
                Steer Tomorrow
              </button>
            </div>

            {/* TAB 1: BRIEFING CARDS */}
            {activeTab === 'briefing' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <h2 className={`text-lg font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                      <span>Today's Briefing Cards</span>
                    </h2>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {totalCards} distinct architecture modules (120–180 words each). Total read time ~4–5 minutes.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {readCardsCount}/{totalCards} Cards Read
                    </span>
                    {isQuizUnlocked ? (
                      <button
                        onClick={() => setActiveTab('quiz')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                      >
                        <span>Take Active Recall Quiz</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className={`text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 border ${
                        isLight 
                          ? 'bg-amber-50 text-amber-800 border-amber-200' 
                          : 'bg-amber-500/10 text-amber-400/90 border-amber-500/20'
                      }`}>
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                        Mark all cards read to unlock quiz
                      </span>
                    )}
                  </div>
                </div>

                {/* Grid of Briefing Cards (EXACTLY 3 to 4 cards) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {session?.cards?.map((card, idx) => (
                    <BriefingCard
                      key={card.id}
                      card={card}
                      index={idx}
                      isRead={card.read}
                      onToggleRead={handleToggleReadCard}
                      theme={theme}
                    />
                  ))}
                </div>

                {/* Prompt to Quiz once all cards are marked as Read */}
                {isQuizUnlocked && (
                  <div className={`mt-8 p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
                    isLight 
                      ? 'bg-gradient-to-r from-emerald-50 via-slate-50 to-indigo-50 border-emerald-300' 
                      : 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border-emerald-500/30 shadow-xl'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl border ${
                        isLight 
                          ? 'bg-emerald-100 border-emerald-200 text-emerald-700' 
                          : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                      }`}>
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>All Daily Briefing Cards Mastered!</h4>
                        <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          Diagnostic Active Recall Quiz is fully unlocked. Verify your understanding of today's mechanics.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('quiz')}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    >
                      <span>Proceed to Active Recall Quiz</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ACTIVE RECALL QUIZ */}
            {activeTab === 'quiz' && (
              <div>
                <QuizSection
                  quiz={session?.quiz || []}
                  onAnswerSubmit={handleAnswerSubmit}
                  isUnlocked={isQuizUnlocked}
                  readCardsCount={readCardsCount}
                  totalCards={totalCards}
                  onGoToBriefing={() => setActiveTab('briefing')}
                  theme={theme}
                />

                {/* 5. DAILY SYNTHESIS SUMMARY: Displayed once all questions submitted */}
                {isQuizComplete && session?.synthesis && (
                  <DailySynthesisCard
                    synthesis={session.synthesis}
                    correctCount={correctQuizCount}
                    totalCount={totalQuiz}
                    onGoToSteering={() => setActiveTab('steering')}
                    date={session.date}
                    theme={theme}
                  />
                )}
              </div>
            )}

            {/* TAB 3: CUSTOMIZE TOMORROW'S FOCUS (DUAL-INPUT STEERING) */}
            {activeTab === 'steering' && (
              <div>
                <SteeringCard
                  draft={focusDraft}
                  onSaveDraft={handleSaveDraft}
                  onGenerateTomorrow={handleGenerateTomorrow}
                  isGeneratingTomorrow={isGeneratingTomorrow}
                  theme={theme}
                />
              </div>
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className={`mt-16 border-t py-8 text-center text-xs transition-colors ${
        isLight ? 'border-slate-200 bg-white/90 text-slate-500' : 'border-slate-800/80 bg-slate-950/60 text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>AuraTech Assistant</span>
            <span>•</span>
            <span>Grounding bleeding-edge tech trends in first-principles computer science</span>
          </div>
          <div className={`flex items-center gap-4 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            <span>Powered by Firebase Firestore</span>
            <span>•</span>
            <span>Node.js / Express + React</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
