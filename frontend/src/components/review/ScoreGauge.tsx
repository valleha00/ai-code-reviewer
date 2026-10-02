'use client';

import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Clock, Code, Zap } from 'lucide-react';
import { ReviewResult } from '../../types/review.types';

interface ScoreGaugeProps {
  result: ReviewResult;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ result }) => {
  const { score, issues, metadata } = result;

  const criticalCount = issues.filter((i) => i.severity === 'critical').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const suggestionCount = issues.filter((i) => i.severity === 'suggestion').length;

  // Determine color scheme based on score
  let scoreColor = 'text-emerald-400';
  let badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  let statusText = 'Production Ready';
  let StatusIcon = ShieldCheck;
  let strokeColor = '#10b981';

  if (score < 60 || criticalCount > 0) {
    scoreColor = 'text-rose-400';
    badgeBg = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    statusText = 'Critical Vulnerabilities';
    StatusIcon = ShieldAlert;
    strokeColor = '#f43f5e';
  } else if (score < 85 || warningCount > 0) {
    scoreColor = 'text-amber-400';
    badgeBg = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    statusText = 'Needs Refactoring';
    StatusIcon = AlertTriangle;
    strokeColor = '#f59e0b';
  }

  // Circular gauge calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 backdrop-blur-md">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-10 blur-2xl"
        style={{ backgroundColor: strokeColor }}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Circular Score Gauge */}
        <div className="flex items-center gap-4">
          <div className="relative flex h-24 w-24 items-center justify-center">
            <svg className="h-24 w-24 -rotate-90 transform" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-zinc-800"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Animated Progress circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={strokeColor}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{
                  transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </svg>

            {/* Score in center */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold tracking-tight font-mono ${scoreColor}`}>
                {score}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                Score
              </span>
            </div>
          </div>

          {/* Status badge & verdict summary */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeBg}`}
              >
                <StatusIcon className="h-3.5 w-3.5" />
                {statusText}
              </span>
            </div>
            <p className="text-xs text-zinc-300 max-w-sm line-clamp-2 leading-relaxed">
              {result.summary}
            </p>
          </div>
        </div>

        {/* Right: Metrics Pills */}
        <div className="flex flex-wrap sm:flex-col gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-md border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-400">
              {criticalCount} Critical
            </span>
            <span className="flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400">
              {warningCount} Warnings
            </span>
            <span className="flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
              {suggestionCount} Suggestions
            </span>
          </div>

          {metadata && (
            <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {metadata.processingTimeMs}ms
              </span>
              <span className="flex items-center gap-1">
                <Code className="h-3 w-3" />
                {metadata.linesOfCode} LOC
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
