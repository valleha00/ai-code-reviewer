'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Trash2, ArrowRight, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';
import { useReviewStore } from '../../store/useReviewStore';
import { formatTimestamp } from '../../lib/utils';
import { ReviewHistoryEntry } from '../../types/review.types';

export const HistoryDrawer: React.FC = () => {
  const {
    isHistoryOpen,
    setIsHistoryOpen,
    history,
    loadHistoryEntry,
    clearHistory,
  } = useReviewStore();

  if (!isHistoryOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        className="flex h-full w-full max-w-md flex-col border-l border-zinc-800 bg-zinc-950 p-5 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-zinc-100">Review History</h2>
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-400">
              {history.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="flex items-center gap-1 rounded-md p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-rose-400 transition-colors text-xs"
                title="Clear all history"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={() => setIsHistoryOpen(false)}
              className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-4 space-y-2.5">
          {history.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center text-zinc-400">
              <Clock className="h-8 w-8 stroke-[1.5] mb-2 opacity-40" />
              <span className="text-xs font-medium">No reviews logged yet</span>
              <span className="text-[11px] mt-1 text-zinc-600">
                Run an analysis to keep track of code quality over time.
              </span>
            </div>
          ) : (
            history.map((item: ReviewHistoryEntry) => {
              const scoreBadge =
                item.score >= 85
                  ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                  : item.score >= 60
                  ? 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                  : 'border-rose-500/30 text-rose-400 bg-rose-500/10';

              return (
                <div
                  key={item.id}
                  onClick={() => loadHistoryEntry(item)}
                  className="group cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5 transition-all hover:border-zinc-700 hover:bg-zinc-900"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] uppercase text-zinc-300">
                        {item.language}
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        {item.focus}
                      </span>
                    </div>

                    <span
                      className={`rounded-md border px-2 py-0.5 font-mono text-xs font-bold ${scoreBadge}`}
                    >
                      {item.score}/100
                    </span>
                  </div>

                  <p className="mt-2 line-clamp-2 text-xs text-zinc-300 leading-snug">
                    {item.summary}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400">
                    <span>{formatTimestamp(item.timestamp)}</span>
                    <span className="flex items-center gap-1 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Restore Review</span>
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};
