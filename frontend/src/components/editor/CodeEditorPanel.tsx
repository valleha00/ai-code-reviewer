'use client';

import React, { useRef, useEffect } from 'react';
import {
  Code2,
  Shield,
  Zap,
  Sparkles,
  Bug,
  Layers,
  Play,
  RotateCcw,
  Copy,
  Check,
  FileCode2,
} from 'lucide-react';
import { useReviewStore } from '../../store/useReviewStore';
import { ReviewFocus, SupportedLanguage } from '../../types/review.types';
import { CODE_PRESETS } from '../../lib/presets';
import { copyToClipboard } from '../../lib/utils';

const LANGUAGES: { value: SupportedLanguage; label: string }[] = [
  { value: 'python', label: 'Python' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'sql', label: 'SQL' },
  { value: 'shell', label: 'Shell / Bash' },
];

const FOCUS_OPTIONS: { value: ReviewFocus; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    value: 'security',
    label: 'Security',
    icon: <Shield className="h-3.5 w-3.5 text-rose-400" />,
    desc: 'OWASP, SQLi, secrets, auth, memory safety',
  },
  {
    value: 'performance',
    label: 'Performance',
    icon: <Zap className="h-3.5 w-3.5 text-amber-400" />,
    desc: 'O(N^2), memory leaks, I/O bottlenecks',
  },
  {
    value: 'clean_code',
    label: 'Clean Code',
    icon: <Sparkles className="h-3.5 w-3.5 text-purple-400" />,
    desc: 'SOLID, DRY, readability, idiomatic style',
  },
  {
    value: 'bug_prevention',
    label: 'Bug Prevention',
    icon: <Bug className="h-3.5 w-3.5 text-sky-400" />,
    desc: 'Null checks, race conditions, edge cases',
  },
  {
    value: 'architecture',
    label: 'Architecture',
    icon: <Layers className="h-3.5 w-3.5 text-emerald-400" />,
    desc: 'Coupling, abstraction leakage, design',
  },
];

export const CodeEditorPanel: React.FC = () => {
  const {
    code,
    language,
    focus,
    isLoading,
    setCode,
    setLanguage,
    setFocus,
    clearCode,
    analyzeCode,
    loadPreset,
  } = useReviewStore();

  const [copied, setCopied] = React.useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const lines = code.split('\n');
  const lineCount = Math.max(lines.length, 1);

  // Sync scrolling between line numbers and textarea
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Handle Tab key and Cmd/Ctrl + Enter shortcut
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd + Enter or Ctrl + Enter triggers analysis
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isLoading && code.trim()) {
        analyzeCode();
      }
      return;
    }

    // Tab key inserts 2 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newValue);

      // Restore cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handleCopyCode = async () => {
    if (!code) return;
    const ok = await copyToClipboard(code);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-800 bg-zinc-950/60 shadow-xl backdrop-blur-md overflow-hidden">
      {/* Top Toolbar: Language & Review Focus */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 bg-zinc-900/40 px-3.5 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/90 px-2 py-1">
            <FileCode2 className="h-3.5 w-3.5 text-zinc-400" />
            <select
              aria-label="Target Programming Language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="bg-transparent text-xs font-medium text-zinc-200 focus:outline-none cursor-pointer"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value} className="bg-zinc-900 text-zinc-200">
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Focus Selector */}
          <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/90 px-2 py-1">
            {FOCUS_OPTIONS.find((f) => f.value === focus)?.icon}
            <select
              aria-label="Review Objective Focus"
              value={focus}
              onChange={(e) => setFocus(e.target.value as ReviewFocus)}
              className="bg-transparent text-xs font-medium text-zinc-200 focus:outline-none cursor-pointer"
            >
              {FOCUS_OPTIONS.map((f) => (
                <option key={f.value} value={f.value} className="bg-zinc-900 text-zinc-200">
                  {f.label} Focus
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Line & Char Count Stats */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400">
          <span>{lineCount} lines</span>
          <span>{code.length} chars</span>
        </div>
      </div>

      {/* Editor Body with Synchronized Line Numbers */}
      <div className="relative flex flex-1 overflow-hidden bg-zinc-950 font-mono-code text-sm">
        {/* Line Numbers Gutter */}
        <div
          ref={lineNumbersRef}
          aria-hidden="true"
          className="select-none overflow-hidden border-r border-zinc-800/80 bg-zinc-900/20 px-3 py-3.5 text-right font-mono text-xs text-zinc-600"
          style={{ width: '3.5rem' }}
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="h-6 leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea Input */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          placeholder="// Paste your pull request diff, function, or snippet here...&#10;// Press Cmd + Enter to run AI Code Review"
          spellCheck={false}
          className="h-full flex-1 resize-none bg-transparent p-3.5 leading-6 text-zinc-200 placeholder-zinc-600 focus:outline-none overflow-y-auto"
          style={{
            lineHeight: '1.5rem',
            tabSize: 2,
          }}
        />
      </div>

      {/* Quick Preset Chips Toolbar */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-t border-zinc-850 bg-zinc-900/30 px-3.5 py-1.5">
        <span className="text-[11px] text-zinc-400 whitespace-nowrap mr-1">Presets:</span>
        {CODE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => loadPreset(preset)}
            className="rounded-md border border-zinc-800/80 bg-zinc-900/60 px-2 py-0.5 text-[11px] text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200 whitespace-nowrap"
          >
            {preset.title.split(':')[0]}
          </button>
        ))}
      </div>

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between border-t border-zinc-800/80 bg-zinc-900/40 px-3.5 py-2.5">
        <div className="flex items-center gap-1.5">
          <button
            onClick={clearCode}
            disabled={!code}
            className="flex items-center gap-1 rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-2.5 py-1.5 text-xs text-zinc-400 transition-all hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-40"
            title="Clear Code"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Clear</span>
          </button>

          <button
            onClick={handleCopyCode}
            disabled={!code}
            className="flex items-center gap-1 rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-2.5 py-1.5 text-xs text-zinc-400 transition-all hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-40"
            title="Copy Code"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Primary Run Button */}
        <button
          onClick={analyzeCode}
          disabled={isLoading || !code.trim()}
          className="group relative flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 via-violet-600 to-purple-600 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:brightness-110 hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <span>Analyzing Code...</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-current text-white transition-transform group-hover:scale-110" />
              <span>Analyze Code</span>
              <kbd className="hidden sm:inline-flex items-center rounded border border-white/20 bg-white/10 px-1 text-[10px] font-mono font-medium text-white/90">
                ⌘↵
              </kbd>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
