// client/src/components/HistoryContextPanel.jsx
import React, { useState } from 'react';
import { History, TrendingUp, Layers, CheckCircle2, ChevronDown, ChevronUp, Cpu, Database, Globe } from 'lucide-react';

export default function HistoryContextPanel({ historicalSummary, historyRecords = [], theme = 'light' }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLight = theme === 'light';

  // Calculate words in historical summary
  const wordCount = historicalSummary ? historicalSummary.trim().split(/\s+/).filter(Boolean).length : 0;
  
  // Calculate aggregate metrics from completed sessions
  const totalSessions = historyRecords.length;
  const totalQ = historyRecords.reduce((acc, r) => acc + (r.totalQuestions || 0), 0);
  const correctQ = historyRecords.reduce((acc, r) => acc + (r.correctAnswers || 0), 0);
  const hasHistory = totalSessions > 0 && totalQ > 0;
  const overallRetention = hasHistory ? Math.round((correctQ / totalQ) * 100) : null;

  return (
    <div className={`mb-8 rounded-2xl border p-6 transition-all duration-300 relative overflow-hidden ${
      isLight 
        ? 'bg-white border-slate-200/90 shadow-sm' 
        : 'bg-gradient-to-b from-slate-900/90 to-slate-900/50 border-slate-800 shadow-xl'
    }`}>
      
      {/* Subtle background glow */}
      <div className={`absolute top-0 right-0 w-96 h-48 blur-3xl pointer-events-none rounded-full ${
        isLight ? 'bg-indigo-500/5' : 'bg-indigo-500/5'
      }`} />
      
      {/* Top Header Bar */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b ${
        isLight ? 'border-slate-200/80' : 'border-slate-800/80'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${
            isLight 
              ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
              : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
          }`}>
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className={`text-lg font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Learning History & Longitudinal Context
              </h2>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                isLight 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                Firestore Synced
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium ${
                wordCount >= 180 && wordCount <= 280
                  ? (isLight ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30')
                  : (isLight ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-amber-500/10 text-amber-300 border border-amber-500/30')
              }`}>
                {wordCount} words (180–280 limit)
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              First-principles systems telemetry synthesized from prior completed sessions
            </p>
          </div>
        </div>

        {/* Telemetry Badges */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700/50'
          }`}>
            <TrendingUp className={`w-3.5 h-3.5 ${hasHistory ? 'text-emerald-600' : 'text-slate-400'}`} />
            <div className="text-xs">
              <span className={`block text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Retention</span>
              <span className={`font-semibold ${hasHistory ? (isLight ? 'text-slate-800' : 'text-slate-200') : (isLight ? 'text-slate-400 text-[11px]' : 'text-slate-400 text-[11px]')}`}>
                {hasHistory ? `${overallRetention}%` : 'Insufficient Data'}
              </span>
            </div>
          </div>

          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700/50'
          }`}>
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <div className="text-xs">
              <span className={`block text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Sessions</span>
              <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{totalSessions} Completed</span>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ml-auto md:ml-0 cursor-pointer ${
              isLight 
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' 
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <span>{isExpanded ? 'Less Details' : 'View Prior Logs'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Dynamic Summary Content (Strictly 180-280 words) */}
      <div className="mt-5">
        <div className={`p-4 rounded-xl border text-sm leading-relaxed font-normal ${
          isLight ? 'bg-slate-50/80 border-slate-200 text-slate-700' : 'bg-slate-950/40 border-slate-800/60 text-slate-300'
        }`}>
          <p className="text-justify sm:text-left">{historicalSummary}</p>
        </div>
      </div>

      {/* Recurring Pillars Mastery Bar */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/30 border-slate-800'
        }`}>
          <Cpu className="w-4 h-4 text-purple-600 shrink-0" />
          <div className="text-xs truncate">
            <div className={`font-semibold truncate ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>Frontier AI & Search</div>
            <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>PRMs, PagedAttention, MoE</div>
          </div>
        </div>

        <div className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/30 border-slate-800'
        }`}>
          <Database className="w-4 h-4 text-cyan-600 shrink-0" />
          <div className="text-xs truncate">
            <div className={`font-semibold truncate ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>Distributed Engines</div>
            <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>HNSW, LSM-Trees, Raft Quorum</div>
          </div>
        </div>

        <div className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/30 border-slate-800'
        }`}>
          <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="text-xs truncate">
            <div className={`font-semibold truncate ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>Modern Web & Systems</div>
            <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>RSC Flight, WebGPU, HTTP/3</div>
          </div>
        </div>
      </div>

      {/* Expandable Prior Session Records */}
      {isExpanded && (
        <div className={`mt-5 pt-4 border-t transition-all ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
          <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Archived Daily Sessions in Firestore
          </h4>
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {historyRecords.length === 0 ? (
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                No completed sessions logged yet in Firestore. Complete today's session to record telemetry.
              </p>
            ) : (
              historyRecords.map((rec, i) => (
                <div 
                  key={i} 
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border text-xs gap-2 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800'
                  }`}
                >
                  <div>
                    <span className={`font-semibold ${isLight ? 'text-indigo-600' : 'text-indigo-300'}`}>{rec.date}</span>:{" "}
                    <span className={isLight ? 'text-slate-800 font-medium' : 'text-slate-200'}>{rec.theme}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                      Score: <strong className="text-emerald-600 font-bold">{rec.correctAnswers}/{rec.totalQuestions}</strong>
                    </span>
                    <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Logged
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}
