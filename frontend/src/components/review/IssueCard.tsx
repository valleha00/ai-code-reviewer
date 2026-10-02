'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ReviewIssue } from '../../types/review.types';
import { useReviewStore } from '../../store/useReviewStore';
import { copyToClipboard } from '../../lib/utils';

interface IssueCardProps {
  issue: ReviewIssue;
  index: number;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue, index }) => {
  const { applyPatch } = useReviewStore();
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleCopy = async () => {
    const ok = await copyToClipboard(issue.patch);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApply = () => {
    applyPatch(issue);
    setApplied(true);
    setTimeout(() => setApplied(false), 2500);
  };

  // Severity styling configuration
  const severityConfig = {
    critical: {
      label: 'Critical',
      icon: AlertCircle,
      badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      borderClass: 'border-l-rose-500',
      glow: 'shadow-rose-500/5',
    },
    warning: {
      label: 'Warning',
      icon: AlertTriangle,
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      borderClass: 'border-l-amber-500',
      glow: 'shadow-amber-500/5',
    },
    suggestion: {
      label: 'Suggestion',
      icon: CheckCircle2,
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      borderClass: 'border-l-emerald-500',
      glow: 'shadow-emerald-500/5',
    },
  }[issue.severity];

  const Icon = severityConfig.icon;

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-zinc-800 border-l-4 ${severityConfig.borderClass} bg-zinc-900/40 p-4 transition-all hover:border-zinc-700/80 hover:bg-zinc-900/60 shadow-md ${severityConfig.glow}`}
    >
      {/* Header: Severity Badge, Line Number, Title, Expand toggle */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Severity badge */}
          <span
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${severityConfig.badgeClass}`}
          >
            <Icon className="h-3 w-3" />
            {severityConfig.label}
          </span>

          {/* Line number badge */}
          <span className="rounded-md border border-zinc-800 bg-zinc-800/80 px-2 py-0.5 font-mono text-xs font-medium text-zinc-300">
            Line {issue.line}
          </span>

          {/* Issue title */}
          <h3 className="font-semibold text-zinc-100 text-sm tracking-tight">{issue.title}</h3>
        </div>

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="rounded-md p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
        </button>
      </div>

      {/* Description */}
      {isExpanded && (
        <div className="mt-2.5 space-y-3">
          <p className="text-xs leading-relaxed text-zinc-300">{issue.description}</p>

          {/* Patch Box */}
          {issue.patch && (
            <div className="overflow-hidden rounded-lg border border-zinc-800/90 bg-zinc-950/80">
              {/* Patch Header */}
              <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/70 px-3 py-1.5 text-xs">
                <span className="flex items-center gap-1.5 font-mono text-[11px] font-medium text-emerald-400">
                  <Sparkles className="h-3 w-3" />
                  Suggested Remediation Patch
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Copy Patch button */}
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 rounded border border-zinc-700/80 bg-zinc-800/60 px-2 py-0.5 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy Patch</span>
                      </>
                    )}
                  </button>

                  {/* Apply to Editor button */}
                  <button
                    onClick={handleApply}
                    className="flex items-center gap-1 rounded border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[11px] font-medium text-indigo-300 transition-colors hover:bg-indigo-500/20 hover:text-indigo-200"
                  >
                    {applied ? (
                      <>
                        <Check className="h-3 w-3 text-indigo-400" />
                        <span>Applied!</span>
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-3 w-3" />
                        <span>Apply to Editor</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Code snippet block */}
              <div className="p-3 font-mono-code text-xs leading-5 text-emerald-300 overflow-x-auto bg-zinc-950/90 whitespace-pre">
                {issue.patch}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
