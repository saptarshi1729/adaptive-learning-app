// client/src/components/QuizSection.jsx
import React, { useState } from 'react';
import { Lock, Unlock, CheckCircle2, XCircle, Brain, Sparkles, AlertCircle, ArrowRight, BookOpen } from 'lucide-react';

export default function QuizSection({ 
  quiz = [], 
  onAnswerSubmit, 
  isUnlocked, 
  readCardsCount, 
  totalCards, 
  onGoToBriefing,
  theme = 'light'
}) {
  const [selectedOptions, setSelectedOptions] = useState({});
  const isLight = theme === 'light';

  const answeredCount = quiz.filter(q => q.submitted).length;
  const correctCount = quiz.filter(q => q.submitted && q.isCorrect).length;
  const totalCount = quiz.length;
  const allSubmitted = answeredCount === totalCount && totalCount > 0;

  // Handle local selection of radio options
  const handleSelect = (questionId, optionIndex) => {
    const question = quiz.find(q => q.id === questionId);
    if (question && question.submitted) return; // Locked!
    setSelectedOptions(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  // Handle individual question submit
  const handleSubmitQuestion = (questionId) => {
    const selectedIdx = selectedOptions[questionId];
    if (selectedIdx === undefined || selectedIdx === null) return;
    onAnswerSubmit(questionId, selectedIdx);
  };

  // If Quiz is Locked because cards aren't marked as Done
  if (!isUnlocked) {
    return (
      <div className={`rounded-2xl border p-8 text-center max-w-2xl mx-auto my-8 ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800 shadow-xl'
      }`}>
        <div className={`w-16 h-16 rounded-2xl border mx-auto flex items-center justify-center mb-4 ${
          isLight ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-slate-800/80 border-slate-700 text-amber-400 shadow-inner'
        }`}>
          <Lock className="w-8 h-8" />
        </div>
        <h3 className={`text-xl font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          Active Recall Quiz Locked
        </h3>
        <p className={`text-sm mb-6 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          In accordance with first-principles learning psychology, active recall testing requires thorough absorption of today's systems curriculum. 
          Please mark all briefing cards as <strong className={isLight ? 'text-slate-800' : 'text-slate-200'}>Done</strong> to unlock your diagnostic quiz.
        </p>

        <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl border text-xs mb-6 ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950/60 border-slate-800 text-slate-300'
        }`}>
          <span>Briefing Progress:</span>
          <span className="font-semibold text-indigo-600 font-mono">
            {readCardsCount} / {totalCards} Cards Marked as Read
          </span>
        </div>

        <div>
          <button
            onClick={onGoToBriefing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Return to Briefing Cards</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Quiz Progress & Metrics Bar */}
      <div className={`rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/90 border-slate-800 shadow-lg'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${
            isLight ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
          }`}>
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>Active Recall Diagnostics</h3>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                Unlocked ✓
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
                isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'
              }`}>
                {answeredCount}/{totalCount} Answered
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Individual per-question evaluation with instant first-principles feedback
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Current Accuracy</div>
            <div className={`text-base font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              {answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0}%
            </div>
          </div>
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-mono text-xs font-bold ${
            isLight ? 'bg-slate-50 border-slate-200 text-emerald-600' : 'bg-slate-800/80 border-slate-700 text-emerald-400'
          }`}>
            {correctCount}/{answeredCount}
          </div>
        </div>
      </div>

      {/* List of 8 to 12 Questions */}
      <div className="space-y-6">
        {quiz.map((q, idx) => {
          const isSubmitted = q.submitted;
          const currentSelected = selectedOptions[q.id] !== undefined ? selectedOptions[q.id] : q.selectedOption;
          const explanationWords = q.explanation ? q.explanation.trim().split(/\s+/).filter(Boolean).length : 0;

          return (
            <div 
              key={q.id}
              className={`rounded-2xl p-6 transition-all border ${
                isSubmitted
                  ? q.isCorrect
                    ? (isLight ? 'bg-emerald-50/40 border-emerald-300 shadow-xs' : 'bg-slate-900/60 border-emerald-500/40 shadow-sm')
                    : (isLight ? 'bg-rose-50/40 border-rose-300 shadow-xs' : 'bg-slate-900/60 border-rose-500/40 shadow-sm')
                  : (isLight ? 'bg-white border-slate-200 shadow-sm hover:border-slate-300' : 'bg-slate-900/90 border-slate-800 shadow-md hover:border-slate-700')
              }`}
            >
              {/* Question Header */}
              <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-mono text-xs font-bold ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
                    Question {idx + 1} of {totalCount}
                  </span>
                  
                  {/* Source indicator (Today vs Spaced Repetition) */}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                    q.source === 'today'
                      ? (isLight ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20')
                      : (isLight ? 'bg-cyan-50 text-cyan-700 border-cyan-200' : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20')
                  }`}>
                    {q.source === 'today' ? "Today's Briefing" : "Spaced Repetition Retention"}
                  </span>

                  {q.topicTitle && (
                    <span className={`text-[11px] truncate max-w-[200px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      • {q.topicTitle}
                    </span>
                  )}
                </div>

                {isSubmitted && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    q.isCorrect 
                      ? (isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/10 text-emerald-400')
                      : (isLight ? 'bg-rose-100 text-rose-800' : 'bg-rose-500/10 text-rose-400')
                  }`}>
                    {q.isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>{q.isCorrect ? 'Correct (+1)' : 'Incorrect (0)'}</span>
                  </span>
                )}
              </div>

              {/* Question Prompt */}
              <h4 className={`text-base font-semibold mb-4 leading-snug ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {q.question}
              </h4>

              {/* Options */}
              <div className="space-y-2.5 mb-5">
                {q.options.map((opt, optIdx) => {
                  const isThisSelected = currentSelected === optIdx;
                  const isThisCorrect = isSubmitted && optIdx === q.correctIndex;
                  const isThisWrongSelected = isSubmitted && isThisSelected && !q.isCorrect;

                  let optionStyle = isLight 
                    ? 'bg-slate-50/80 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/70'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40';
                  
                  if (!isSubmitted && isThisSelected) {
                    optionStyle = isLight 
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-950 font-medium shadow-xs' 
                      : 'bg-indigo-950/40 border-indigo-500 text-indigo-200 shadow-sm';
                  } else if (isThisCorrect) {
                    optionStyle = isLight 
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-medium' 
                      : 'bg-emerald-950/40 border-emerald-500 text-emerald-200 font-medium';
                  } else if (isThisWrongSelected) {
                    optionStyle = isLight 
                      ? 'bg-rose-50 border-rose-500 text-rose-950' 
                      : 'bg-rose-950/40 border-rose-500 text-rose-200';
                  } else if (isSubmitted) {
                    optionStyle = isLight 
                      ? 'opacity-60 bg-slate-100/60 border-slate-200 text-slate-500' 
                      : 'opacity-60 bg-slate-950/30 border-slate-900 text-slate-400';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => handleSelect(q.id, optIdx)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs sm:text-sm flex items-start gap-3 cursor-pointer ${optionStyle} ${
                        isSubmitted ? 'cursor-not-allowed' : ''
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-xs font-mono font-bold mt-0.5 ${
                        isThisCorrect
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : isThisWrongSelected
                          ? 'border-rose-500 bg-rose-500 text-white'
                          : isThisSelected
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : (isLight ? 'border-slate-300 text-slate-500' : 'border-slate-700 text-slate-400')
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="leading-relaxed flex-grow">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Action & Feedback Section */}
              <div className={`pt-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isLight ? 'border-slate-200' : 'border-slate-800/70'
              }`}>
                {!isSubmitted ? (
                  <>
                    <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {currentSelected !== undefined && currentSelected !== null 
                        ? 'Answer selected. Ready to lock and submit.' 
                        : 'Select an option to enable submission.'}
                    </span>
                    <button
                      type="button"
                      disabled={currentSelected === undefined || currentSelected === null}
                      onClick={() => handleSubmitQuestion(q.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        currentSelected !== undefined && currentSelected !== null
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/20'
                          : (isLight ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-800 text-slate-500 cursor-not-allowed')
                      }`}
                    >
                      Submit Answer
                    </button>
                  </>
                ) : (
                  <div className="w-full">
                    {/* Concise Feedback Strictly Under 80 Words */}
                    <div className={`p-3.5 rounded-xl border text-xs leading-relaxed space-y-1 ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800/90'
                    }`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                          {q.isCorrect ? 'First-Principles Rationale:' : 'Conceptual Correction:'}
                        </span>
                        <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                          {explanationWords} words (under 80)
                        </span>
                      </div>
                      <p className={isLight ? 'text-slate-700' : 'text-slate-300'}>{q.explanation}</p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Completion Banner when all questions submitted */}
      {allSubmitted && (
        <div className={`p-6 rounded-2xl border text-center space-y-3 shadow-sm ${
          isLight 
            ? 'bg-gradient-to-r from-indigo-50 via-purple-50 to-emerald-50 border-emerald-300' 
            : 'bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-emerald-900/40 border-emerald-500/30 shadow-xl'
        }`}>
          <div className={`w-12 h-12 rounded-xl border mx-auto flex items-center justify-center ${
            isLight ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
          }`}>
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Daily Diagnostic Recall Completed!
          </h3>
          <p className={`text-xs max-w-lg mx-auto leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
            All {totalCount} questions evaluated. Your aggregate diagnostic score is {correctCount}/{totalCount} ({Math.round((correctCount / totalCount) * 100)}%). 
            View your comprehensive daily synthesis breakdown below.
          </p>
        </div>
      )}

    </div>
  );
}
