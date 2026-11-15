import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { authModeDescription } from '../services/firebaseConfig';
import { ShieldCheck, Database, RefreshCw, X, Sparkles, KeyRound } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { currentUser, resetAllDemoData, openAuthModal } = useApp();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border-b border-teal-500/30 text-xs sm:text-sm py-2 px-4 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/40">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            Catalyst x PromptWars 2026
          </span>
          <div className="flex items-center gap-2 text-slate-300">
            <Database className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-medium text-slate-200">{authModeDescription}</span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline">
              Viewing as <strong className="text-teal-300 capitalize">{currentUser.role}</strong> ({currentUser.name})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={openAuthModal}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-navy-800 hover:bg-navy-750 text-cyan-300 text-xs border border-cyan-500/30 transition-colors"
            title="Switch demo account or enter credentials"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Switch Role</span>
          </button>
          <button
            onClick={() => {
              if (window.confirm('Reset all demo medications, vitals and appointments to initial seed data?')) {
                resetAllDemoData();
              }
            }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-navy-800/80 hover:bg-navy-750 text-slate-400 hover:text-slate-200 text-xs transition-colors"
            title="Reset to factory demo data"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Seed</span>
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-slate-500 hover:text-slate-300 rounded"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
