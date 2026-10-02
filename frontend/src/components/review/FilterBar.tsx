'use client';

import React from 'react';
import { Filter, Download, Share2 } from 'lucide-react';
import { useReviewStore } from '../../store/useReviewStore';
import { IssueSeverity } from '../../types/review.types';

export const FilterBar: React.FC = () => {
  const { reviewResult, activeFilter, setActiveFilter, setIsExportOpen } = useReviewStore();

  if (!reviewResult) return null;

  const { issues } = reviewResult;
  const criticalCount = issues.filter((i) => i.severity === 'critical').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const suggestionCount = issues.filter((i) => i.severity === 'suggestion').length;

  const filters: { id: 'all' | IssueSeverity; label: string; count: number; color?: string }[] = [
    { id: 'all', label: 'All Issues', count: issues.length },
    { id: 'critical', label: 'Critical', count: criticalCount, color: 'text-rose-400' },
    { id: 'warning', label: 'Warnings', count: warningCount, color: 'text-amber-400' },
    { id: 'suggestion', label: 'Suggestions', count: suggestionCount, color: 'text-emerald-400' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5">
        <Filter className="h-3.5 w-3.5 text-zinc-400 mr-1" />
        {filters.map((f) => {
          const isActive = activeFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              <span>{f.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono font-semibold ${
                  isActive ? 'bg-zinc-700 text-zinc-100' : 'bg-zinc-900 text-zinc-400'
                } ${f.color || ''}`}
              >
                {f.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Export Review Report Button */}
      <button
        onClick={() => setIsExportOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
        title="Export PR Report / Markdown"
      >
        <Share2 className="h-3.5 w-3.5 text-indigo-400" />
        <span>Export Report</span>
      </button>
    </div>
  );
};
