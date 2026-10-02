'use client';

import React from 'react';
import { Bot, History, Settings, Sparkles, Terminal, Code2 } from 'lucide-react';
import { useReviewStore } from '../../store/useReviewStore';
import { CODE_PRESETS } from '../../lib/presets';

export const Header: React.FC = () => {
  const {
    provider,
    history,
    setIsHistoryOpen,
    setIsSettingsOpen,
    loadPreset,
    reviewResult,
  } = useReviewStore();

  const activeProviderLabel =
    reviewResult?.metadata?.provider ||
    (provider === 'openai' ? 'OpenAI GPT-4o' : provider === 'anthropic' ? 'Claude 3.5' : provider === 'mock' ? 'Mock Heuristic' : 'Auto Engine');

  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-violet-600 to-purple-700 shadow-md shadow-indigo-500/20">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-tight text-zinc-100 text-sm sm:text-base">
              ReviewPulse
            </span>
            <span className="hidden sm:inline-flex items-center rounded-md border border-zinc-800 bg-zinc-900/80 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
              AI Code Reviewer
            </span>
          </div>
        </div>

        {/* Middle: Provider pill & Presets */}
        <div className="flex items-center gap-2">
          {/* Active provider pill */}
          <div className="hidden md:flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="text-zinc-400 font-mono text-[11px]">{activeProviderLabel}</span>
          </div>

          {/* Quick Preset Selector */}
          <div className="hidden lg:flex items-center">
            <select
              aria-label="Load Preset Snippet"
              className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 text-xs text-zinc-300 transition-colors hover:border-zinc-700 focus:border-indigo-500 focus:outline-none"
              onChange={(e) => {
                const preset = CODE_PRESETS.find((p) => p.id === e.target.value);
                if (preset) loadPreset(preset);
              }}
              defaultValue=""
            >
              <option value="" disabled>
                Load Preset Snippet...
              </option>
              {CODE_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right actions: History, Settings */}
        <div className="flex items-center gap-2">
          {/* History button */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="relative flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-all hover:bg-zinc-800 hover:text-white"
            title="Review History"
          >
            <History className="h-3.5 w-3.5 text-zinc-400" />
            <span className="hidden sm:inline">History</span>
            {history.length > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-500/20 px-1 text-[10px] font-semibold text-indigo-400 border border-indigo-500/30">
                {history.length}
              </span>
            )}
          </button>

          {/* Settings button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 transition-all hover:bg-zinc-800 hover:text-white"
            title="Configure AI Provider & API Keys"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
