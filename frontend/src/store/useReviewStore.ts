import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  CodePreset,
  IssueSeverity,
  ReviewFocus,
  ReviewHistoryEntry,
  ReviewIssue,
  ReviewResult,
  SupportedLanguage,
} from '../types/review.types';
import { CODE_PRESETS } from '../lib/presets';
import { ApiClient } from '../lib/api-client';

interface ReviewState {
  // Input configuration
  code: string;
  language: SupportedLanguage;
  focus: ReviewFocus;
  provider: 'auto' | 'openai' | 'anthropic' | 'mock';
  apiKey: string;
  model: string;

  // Analysis state
  isLoading: boolean;
  error: string | null;
  reviewResult: ReviewResult | null;
  activeFilter: 'all' | IssueSeverity;

  // Modals & drawers
  isHistoryOpen: boolean;
  isSettingsOpen: boolean;
  isExportOpen: boolean;

  // History log
  history: ReviewHistoryEntry[];

  // Actions
  setCode: (code: string) => void;
  setLanguage: (language: SupportedLanguage) => void;
  setFocus: (focus: ReviewFocus) => void;
  setProvider: (provider: 'auto' | 'openai' | 'anthropic' | 'mock') => void;
  setApiKey: (apiKey: string) => void;
  setModel: (model: string) => void;
  setActiveFilter: (filter: 'all' | IssueSeverity) => void;
  setIsHistoryOpen: (open: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
  setIsExportOpen: (open: boolean) => void;
  loadPreset: (preset: CodePreset) => void;
  loadHistoryEntry: (entry: ReviewHistoryEntry) => void;
  clearCode: () => void;
  applyPatch: (issue: ReviewIssue) => void;
  analyzeCode: () => Promise<void>;
  clearHistory: () => void;
}

export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      code: CODE_PRESETS[0]?.code ?? '',
      language: 'python',
      focus: 'security',
      provider: 'auto',
      apiKey: '',
      model: '',

      isLoading: false,
      error: null,
      reviewResult: null,
      activeFilter: 'all',

      isHistoryOpen: false,
      isSettingsOpen: false,
      isExportOpen: false,
      history: [],

      setCode: (code) => set({ code, error: null }),
      setLanguage: (language) => set({ language }),
      setFocus: (focus) => set({ focus }),
      setProvider: (provider) => set({ provider }),
      setApiKey: (apiKey) => set({ apiKey }),
      setModel: (model) => set({ model }),
      setActiveFilter: (activeFilter) => set({ activeFilter }),
      setIsHistoryOpen: (isHistoryOpen) => set({ isHistoryOpen }),
      setIsSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
      setIsExportOpen: (isExportOpen) => set({ isExportOpen }),

      loadPreset: (preset) => {
        set({
          code: preset.code,
          language: preset.language,
          focus: preset.focus,
          reviewResult: null,
          error: null,
        });
      },

      loadHistoryEntry: (entry) => {
        set({
          code: entry.code,
          language: entry.language,
          focus: entry.focus,
          reviewResult: entry.result,
          error: null,
          isHistoryOpen: false,
        });
      },

      clearCode: () => set({ code: '', reviewResult: null, error: null }),

      applyPatch: (issue: ReviewIssue) => {
        const { code } = get();
        const lines = code.split('\n');
        const targetLineIdx = issue.line - 1;

        if (targetLineIdx >= 0 && targetLineIdx < lines.length) {
          // Replace single line or inject patch
          lines[targetLineIdx] = issue.patch;
          set({ code: lines.join('\n') });
        } else {
          // If line number out of range, append with a comment
          set({ code: `${code}\n\n// Resolved: ${issue.title}\n${issue.patch}` });
        }
      },

      analyzeCode: async () => {
        const { code, language, focus, provider, apiKey, model, history } = get();

        if (!code.trim()) {
          set({ error: 'Please enter or paste some code before requesting a review.' });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const result = await ApiClient.analyzeCode({
            code,
            language,
            focus,
            provider,
            apiKey: apiKey.trim() || undefined,
            model: model.trim() || undefined,
          });

          const newHistoryItem: ReviewHistoryEntry = {
            id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            timestamp: new Date().toISOString(),
            language,
            focus,
            score: result.score,
            summary: result.summary,
            issuesCount: result.issues.length,
            code,
            result,
          };

          set({
            reviewResult: result,
            isLoading: false,
            error: null,
            history: [newHistoryItem, ...history.slice(0, 24)], // keep last 25 reviews
          });
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Analysis failed. Please check network connection.';
          set({
            error: message,
            isLoading: false,
          });
        }
      },

      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'ai-code-reviewer-store',
      partialize: (state) => ({
        history: state.history,
        apiKey: state.apiKey,
        provider: state.provider,
        model: state.model,
      }),
    }
  )
);
