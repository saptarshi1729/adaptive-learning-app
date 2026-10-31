// client/src/components/BriefingCard.jsx
import React from 'react';
import { Check, CheckCircle2, BookOpen, ExternalLink, Cpu, Database, Globe, ArrowUpRight } from 'lucide-react';

export default function BriefingCard({ card, index, isRead, onToggleRead, theme = 'light' }) {
  const isLight = theme === 'light';

  const getCategoryIcon = (category) => {
    if (category.includes('AI')) return <Cpu className="w-4 h-4 text-purple-600" />;
    if (category.includes('Distributed') || category.includes('Data')) return <Database className="w-4 h-4 text-cyan-600" />;
    return <Globe className="w-4 h-4 text-emerald-600" />;
  };

  const getCategoryBadgeClass = (category) => {
    if (category.includes('AI')) {
      return isLight ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-purple-500/10 text-purple-300 border-purple-500/20';
    }
    if (category.includes('Distributed') || category.includes('Data')) {
      return isLight ? 'bg-cyan-50 text-cyan-700 border-cyan-200' : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20';
    }
    return isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
  };

  const wordCount = card.content ? card.content.trim().split(/\s+/).filter(Boolean).length : 0;
  const isWordCountValid = wordCount >= 120 && wordCount <= 180;

  return (
    <article 
      className={`rounded-2xl transition-all duration-300 flex flex-col justify-between border ${
        isRead
          ? (isLight ? 'bg-emerald-50/30 border-emerald-300/80 shadow-xs' : 'bg-slate-900/40 border-emerald-500/30 shadow-sm')
          : (isLight ? 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300' : 'bg-slate-900/90 border-slate-800 shadow-lg hover:shadow-xl hover:border-slate-700/80')
      }`}
    >
      <div className="p-6 md:p-7 flex flex-col flex-grow">
        
        {/* Card Header: Category & Word Count badge */}
        <div className="flex items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getCategoryBadgeClass(card.category)}`}>
              {getCategoryIcon(card.category)}
              <span>{card.category}</span>
            </span>
            {card.isProgression ? (
              <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border ${
                isLight ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
              }`}>
                Tier {card.tierLevel || 2} Progression
              </span>
            ) : (
              <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border ${
                isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-500/10 text-blue-300 border-blue-500/20'
              }`}>
                New Topic
              </span>
            )}
            <span className={`text-xs font-mono ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
              Card {index + 1}
            </span>
          </div>

          {/* Strict Word Count Badge */}
          <div 
            title="Card word count constraint: strictly between 120 and 180 words"
            className={`px-2 py-0.5 rounded-full text-[11px] font-mono border font-medium ${
              isWordCountValid
                ? (isLight ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20')
                : (isLight ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-500/10 text-amber-300 border-amber-500/20')
            }`}
          >
            {wordCount} words • ~1.5 min read
          </div>
        </div>

        {/* Card Title */}
        <h3 className={`text-xl font-bold tracking-tight mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          {card.title}
        </h3>

        {/* Trend & Mechanics Subheader */}
        <div className={`mb-4 p-3 rounded-xl border text-xs space-y-1.5 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800/80'
        }`}>
          <div className="flex items-start gap-1.5">
            <strong className={`shrink-0 font-semibold ${isLight ? 'text-indigo-700' : 'text-indigo-400'}`}>Bleeding-Edge Trend:</strong>
            <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>{card.trend}</span>
          </div>
          <div className="flex items-start gap-1.5">
            <strong className={`shrink-0 font-semibold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>First-Principles Science:</strong>
            <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>{card.firstPrinciples}</span>
          </div>
        </div>

        {/* Main Content (Strictly 120 - 180 words) */}
        <div className={`text-sm md:text-[15px] leading-relaxed mb-6 font-normal flex-grow ${
          isLight ? 'text-slate-700' : 'text-slate-300'
        }`}>
          <p>{card.content}</p>
        </div>

        {/* Deeper Dive Section */}
        {card.deeperDive && card.deeperDive.length > 0 && (
          <div className={`pt-4 border-t mb-6 ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
            <div className={`text-xs font-semibold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}>
              <span>Deeper Architectural Dive</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {card.deeperDive.map((link, lIdx) => (
                <a
                  key={lIdx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all group ${
                    isLight 
                      ? 'bg-slate-100/90 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200/90' 
                      : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white border-slate-700/70'
                  }`}
                >
                  <span>{link.icon || '🔗'}</span>
                  <span className="max-w-[220px] truncate">{link.title}</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card Footer: MANDATORY Individual 'Mark as Read / Done' Button */}
      <div className={`px-6 py-4 border-t rounded-b-2xl flex items-center justify-between gap-4 ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/50 border-slate-800/80'
      }`}>
        <div className={`text-xs flex items-center gap-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          {isRead ? (
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Quiz
            </span>
          ) : (
            <span>Required for Active Recall Quiz</span>
          )}
        </div>

        <button
          onClick={() => onToggleRead(card.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
            isRead
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
              : (isLight 
                  ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 hover:border-slate-400 shadow-xs' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 hover:border-slate-600')
          }`}
        >
          {isRead ? (
            <>
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>✓ Marked as Read</span>
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4" />
              <span>Mark as Read / Done</span>
            </>
          )}
        </button>
      </div>

    </article>
  );
}
