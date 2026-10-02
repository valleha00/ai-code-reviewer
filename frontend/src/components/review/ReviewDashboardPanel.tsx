'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, RotateCcw, CheckCircle, Sparkles } from 'lucide-react';
import { useReviewStore } from '../../store/useReviewStore';
import { ScoreGauge } from './ScoreGauge';
import { FilterBar } from './FilterBar';
import { IssueCard } from './IssueCard';
import { EmptyReviewState } from './EmptyReviewState';

export const ReviewDashboardPanel: React.FC = () => {
  const {
    isLoading,
    error,
    reviewResult,
    activeFilter,
    analyzeCode,
  } = useReviewStore();

  // Loading skeleton state
  if (isLoading) {
    return (
      <div className="flex h-full flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 backdrop-blur-md overflow-hidden">
        {/* Score gauge skeleton */}
        <div className="animate-pulse rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-zinc-800/60" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-zinc-800/60" />
              <div className="h-3 w-3/4 rounded bg-zinc-800/40" />
              <div className="h-3 w-1/2 rounded bg-zinc-800/40" />
            </div>
          </div>
        </div>

        {/* Filter bar skeleton */}
        <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-3">
          <div className="h-6 w-16 rounded bg-zinc-800/50" />
          <div className="h-6 w-16 rounded bg-zinc-800/50" />
          <div className="h-6 w-16 rounded bg-zinc-800/50" />
        </div>

        {/* Issue cards skeleton list */}
        <div className="space-y-3 overflow-y-auto">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="animate-pulse rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-4 space-y-3"
            >
              <div className="flex items-center gap-2">
                <div className="h-5 w-20 rounded bg-zinc-800/60" />
                <div className="h-5 w-14 rounded bg-zinc-800/60" />
                <div className="h-5 w-48 rounded bg-zinc-800/60" />
              </div>
              <div className="h-3 w-5/6 rounded bg-zinc-800/40" />
              <div className="h-16 w-full rounded bg-zinc-950/60" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-xl border border-rose-900/40 bg-zinc-950/60 p-6 text-center backdrop-blur-md">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-3">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-100">Analysis Encountered an Error</h3>
        <p className="mt-1 max-w-md text-xs text-rose-300/90 leading-relaxed font-mono bg-rose-950/20 p-2.5 rounded-lg border border-rose-900/30 mt-2">
          {error}
        </p>
        <button
          onClick={analyzeCode}
          className="mt-4 flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-700 hover:text-white"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  // Empty state (no result yet)
  if (!reviewResult) {
    return <EmptyReviewState />;
  }

  // Filter issues according to active filter tab
  const filteredIssues = reviewResult.issues.filter((issue) => {
    if (activeFilter === 'all') return true;
    return issue.severity === activeFilter;
  });

  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 sm:p-4 backdrop-blur-md overflow-hidden">
      {/* Score gauge & summary banner */}
      <ScoreGauge result={reviewResult} />

      {/* Filter tab bar */}
      <FilterBar />

      {/* Issues list with scroll */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {filteredIssues.length === 0 ? (
          <div className="flex h-36 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 text-center">
            <CheckCircle className="h-6 w-6 text-emerald-400 mb-1" />
            <span className="text-xs font-semibold text-zinc-200">No issues found</span>
            <span className="text-[11px] text-zinc-400">
              There are no {activeFilter !== 'all' ? activeFilter : ''} issues in this category.
            </span>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredIssues.map((issue, index) => (
              <motion.div
                key={`${issue.line}-${issue.title}-${index}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: index * 0.04 }}
              >
                <IssueCard issue={issue} index={index} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
