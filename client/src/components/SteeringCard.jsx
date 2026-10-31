// client/src/components/SteeringCard.jsx
import React, { useState, useEffect } from 'react';
import { Compass, CheckSquare, Square, MessageSquare, Save, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';

const AVAILABLE_CATEGORIES = [
  {
    id: "Modern AI & Frontier Models",
    title: "Modern AI & Frontier Models",
    description: "Reasoning Models, MCP, Agent loops, MoE, Attention, KV Caching, Speculative Decoding"
  },
  {
    id: "Distributed Systems & Modern Data Engines",
    title: "Distributed Systems & Modern Data Engines",
    description: "HNSW Vector DBs, Edge Runtimes, LSM-Trees vs B-Trees, Raft Consensus, Storage Decoupling"
  },
  {
    id: "Emerging Web & Cloud Frameworks",
    title: "Emerging Web & Cloud Frameworks",
    description: "React Server Components, WebGPU Compute Shaders, HTTP/3 QUIC, DOM Reconciliation"
  },
  {
    id: "Systems Security & Low-Level Runtimes",
    title: "Systems Security & Low-Level Runtimes",
    description: "Memory safety invariants, Borrow checkers, Zero-Knowledge verification, eBPF kernels"
  }
];

export default function SteeringCard({ draft, onSaveDraft, onGenerateTomorrow, isGeneratingTomorrow, theme = 'light' }) {
  const [categories, setCategories] = useState(draft.categories || []);
  const [prompt, setPrompt] = useState(draft.prompt || "");
  const [saveStatus, setSaveStatus] = useState("saved"); // "saving" | "saved" | "unsaved"
  const isLight = theme === 'light';

  // Update internal state when draft props load
  useEffect(() => {
    if (draft.categories) setCategories(draft.categories);
    if (draft.prompt !== undefined) setPrompt(draft.prompt);
  }, [draft]);

  // Handle category toggle
  const toggleCategory = (catId) => {
    let next;
    if (categories.includes(catId)) {
      if (categories.length === 1) return; // Keep at least one
      next = categories.filter(c => c !== catId);
    } else {
      next = [...categories, catId];
    }
    setCategories(next);
    triggerAutoSave(next, prompt);
  };

  // Handle prompt change with debounce autosave
  const handlePromptChange = (e) => {
    const val = e.target.value;
    setPrompt(val);
    triggerAutoSave(categories, val);
  };

  // Auto-save draft locally and to Firestore
  const triggerAutoSave = (cats, text) => {
    setSaveStatus("saving");
    onSaveDraft({ categories: cats, prompt: text });
    setTimeout(() => {
      setSaveStatus("saved");
    }, 400);
  };

  return (
    <div className={`rounded-2xl border p-6 md:p-8 relative overflow-hidden transition-all ${
      isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/90 border-slate-800 shadow-xl'
    }`}>
      
      {/* Background flare */}
      <div className={`absolute top-0 right-0 w-80 h-40 blur-3xl pointer-events-none rounded-full ${
        isLight ? 'bg-indigo-500/5' : 'bg-indigo-500/5'
      }`} />

      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b ${
        isLight ? 'border-slate-200' : 'border-slate-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl border ${
            isLight ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
          }`}>
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`text-xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Customize Tomorrow's Focus (Dual-Input Steering)
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                isLight ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
              }`}>
                Firestore Draft Recovery
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Calibrate the technical trajectory of upcoming daily briefings and active recall scenarios
            </p>
          </div>
        </div>

        {/* Real-time Save Status */}
        <div className="flex items-center gap-2 text-xs font-mono shrink-0">
          {saveStatus === "saving" ? (
            <span className="text-amber-600 flex items-center gap-1.5 font-medium">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving draft...
            </span>
          ) : (
            <span className="text-emerald-600 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Draft Saved to Firestore
            </span>
          )}
        </div>
      </div>

      {/* Input 1: Category Checkbox Toggles */}
      <div className="my-6">
        <label className={`block text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 ${
          isLight ? 'text-slate-600' : 'text-slate-400'
        }`}>
          <span>1. Technical Category Checkbox Toggles</span>
          <span className={`font-normal lowercase ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>(select one or more pillars)</span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {AVAILABLE_CATEGORIES.map(cat => {
            const isSelected = categories.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                  isSelected
                    ? (isLight 
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-950 shadow-xs' 
                        : 'bg-indigo-950/40 border-indigo-500 text-indigo-100 shadow-sm')
                    : (isLight 
                        ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/80 hover:text-slate-900' 
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200')
                }`}
              >
                <div className={`mt-0.5 shrink-0 ${isSelected ? 'text-indigo-600' : (isLight ? 'text-slate-400' : 'text-slate-600')}`}>
                  {isSelected ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5" />}
                </div>
                <div>
                  <div className={`font-semibold text-sm mb-0.5 ${isSelected ? (isLight ? 'text-indigo-950' : 'text-white') : (isLight ? 'text-slate-800' : 'text-slate-300')}`}>
                    {cat.title}
                  </div>
                  <div className={`text-xs leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{cat.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input 2: Free-Form Text Prompt Box */}
      <div className="mb-6">
        <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 flex items-center justify-between ${
          isLight ? 'text-slate-600' : 'text-slate-400'
        }`}>
          <span className="flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
            <span>2. Free-Form Architectural Prompt Box</span>
          </span>
          <span className={`font-mono text-[11px] font-normal ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
            {prompt.length} characters
          </span>
        </label>
        
        <p className={`text-xs mb-2.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Specify exact algorithms, sub-systems, research papers, or engineering dilemmas you want the Tech Architect to dissect tomorrow.
        </p>

        <textarea
          rows={3}
          value={prompt}
          onChange={handlePromptChange}
          placeholder="e.g., Deep dive on KV Cache optimizations in vLLM, PagedAttention virtual memory block tables, and speculative decoding drafter-verifier latencies..."
          className={`w-full rounded-xl border p-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-sans leading-relaxed ${
            isLight 
              ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500' 
              : 'bg-slate-950/70 border-slate-800 text-slate-200 placeholder-slate-500 focus:border-indigo-500'
          }`}
        />
      </div>

      {/* Footer Controls */}
      <div className={`pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isLight ? 'border-slate-200' : 'border-slate-800'
      }`}>
        <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Focus vectors automatically guide tomorrow's live generation when the day begins.
        </div>

        <button
          onClick={() => {
            onSaveDraft({ categories, prompt });
            setSaveStatus("saved");
          }}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Save Steering Focus for Tomorrow</span>
        </button>
      </div>

    </div>
  );
}
