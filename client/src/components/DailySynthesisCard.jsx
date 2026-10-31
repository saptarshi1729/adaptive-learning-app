// client/src/components/DailySynthesisCard.jsx
import React from 'react';
import { Award, CheckCircle2, AlertTriangle, ArrowRight, Compass, ShieldCheck } from 'lucide-react';

export default function DailySynthesisCard({ 
  synthesis, 
  correctCount, 
  totalCount, 
  onGoToSteering,
  date,
  theme = 'light' 
}) {
  const isLight = theme === 'light';
  const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 100;
  const wordCount = synthesis ? synthesis.trim().split(/\s+/).filter(Boolean).length : 0;
  const isWordCountValid = wordCount > 0 && wordCount <= 500;

  return (
    <div className={`rounded-2xl border p-6 md:p-8 relative overflow-hidden my-8 transition-all ${
      isLight 
        ? 'bg-white border-indigo-200/90 shadow-md' 
        : 'bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border-indigo-500/30 shadow-2xl'
    }`}>
      
      {/* Decorative background glow */}
      <div className={`absolute top-0 right-0 w-80 h-80 blur-3xl pointer-events-none rounded-full ${
        isLight ? 'bg-indigo-500/5' : 'bg-emerald-500/5'
      }`} />
      
      {/* Card Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b ${
        isLight ? 'border-slate-200' : 'border-slate-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-500 text-white shadow-md shadow-indigo-500/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`text-xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Daily Synthesis & Performance Summary
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${
                isWordCountValid
                  ? (isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20')
                  : (isLight ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-rose-500/10 text-rose-300 border-rose-500/20')
              }`}>
                {wordCount} words (strictly under 500)
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Architectural diagnosis and first-principles mastery telemetry for {date}
            </p>
          </div>
        </div>

        {/* Score Pill */}
        <div className={`flex items-center gap-3 p-3 rounded-xl shrink-0 border ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
        }`}>
          <div>
            <div className={`text-[10px] uppercase tracking-wider font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Diagnostic Score
            </div>
            <div className={`text-xl font-bold font-mono ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>
              {correctCount} / {totalCount} ({percentage}%)
            </div>
          </div>
          <div className={`p-2 rounded-lg ${isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/10 text-emerald-400'}`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Synthesis Breakdown (Single paragraph, strictly under 500 words) */}
      <div className="my-6">
        <div className={`p-5 rounded-xl border text-sm md:text-base leading-relaxed font-normal ${
          isLight ? 'bg-slate-50/80 border-slate-200 text-slate-800' : 'bg-slate-950/60 border-slate-800 text-slate-200'
        }`}>
          <p>{synthesis}</p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className={`pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isLight ? 'border-slate-200' : 'border-slate-800'
      }`}>
        <div className={`flex items-center gap-2 text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Results permanently synced to Firebase Cloud Firestore</span>
        </div>

        <button
          onClick={onGoToSteering}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/25 transition-all cursor-pointer group"
        >
          <Compass className="w-4 h-4" />
          <span>Customize Tomorrow's Focus</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </div>
  );
}
