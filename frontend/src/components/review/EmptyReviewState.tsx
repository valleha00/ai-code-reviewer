'use client';

import React from 'react';
import { Bot, Terminal, Shield, Zap, Sparkles, ArrowRight } from 'lucide-react';
import { useReviewStore } from '../../store/useReviewStore';
import { CODE_PRESETS } from '../../lib/presets';

export const EmptyReviewState: React.FC = () => {
  const { loadPreset, analyzeCode } = useReviewStore();

  const handleQuickRun = async (index: number) => {
    const preset = CODE_PRESETS[index];
    if (preset) {
      loadPreset(preset);
      setTimeout(() => {
        analyzeCode();
      }, 100);
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-zinc-850 bg-zinc-950/40 p-8 text-center backdrop-blur-sm">
      {/* Icon badge */}
      <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-violet-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 shadow-xl shadow-indigo-500/5">
        <Bot className="h-7 w-7" />
        <span className="absolute -right-1 -top-1 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex h-3 w-3 rounded-full bg-indigo-500"></span>
        </span>
      </div>

      <h2 className="text-base font-semibold text-zinc-100 tracking-tight">
        Awaiting Code Analysis
      </h2>
      <p className="mt-1 max-w-sm text-xs text-zinc-400 leading-relaxed">
        Select a programming language and review focus, paste a pull request diff or code snippet in the left panel, and click <span className="text-zinc-200 font-medium">Analyze Code</span>.
      </p>

      {/* Feature cards preview */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-lg text-left">
        <div className="rounded-lg border border-zinc-850 bg-zinc-900/40 p-2.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-rose-400">
            <Shield className="h-3.5 w-3.5" />
            <span>Security</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-400 leading-tight">
            OWASP Top 10, SQLi, secret leaks & auth vulnerabilities.
          </p>
        </div>

        <div className="rounded-lg border border-zinc-850 bg-zinc-900/40 p-2.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-400">
            <Zap className="h-3.5 w-3.5" />
            <span>Performance</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-400 leading-tight">
            O(N²) bottlenecks, memory leaks & I/O race conditions.
          </p>
        </div>

        <div className="rounded-lg border border-zinc-850 bg-zinc-900/40 p-2.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-purple-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Clean Code</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-400 leading-tight">
            SOLID patterns, typing soundness & instant diff patches.
          </p>
        </div>
      </div>

      {/* 1-Click Interactive Test Presets */}
      <div className="mt-6 flex flex-col items-center gap-2">
        <span className="text-xs font-medium text-zinc-400">
          Try an instant test case:
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => handleQuickRun(0)}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-300 transition-all hover:border-indigo-500/50 hover:bg-zinc-850 hover:text-white"
          >
            <span>Python SQL Injection</span>
            <ArrowRight className="h-3 w-3 text-indigo-400" />
          </button>

          <button
            onClick={() => handleQuickRun(1)}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-300 transition-all hover:border-indigo-500/50 hover:bg-zinc-850 hover:text-white"
          >
            <span>TypeScript Memory Leak</span>
            <ArrowRight className="h-3 w-3 text-indigo-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
