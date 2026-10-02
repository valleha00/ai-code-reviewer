'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Key, Bot, Cpu, Check, Info } from 'lucide-react';
import { useReviewStore } from '../../store/useReviewStore';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    provider,
    setProvider,
    apiKey,
    setApiKey,
    model,
    setModel,
  } = useReviewStore();

  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [localModel, setLocalModel] = useState(model);
  const [saved, setSaved] = useState(false);

  if (!isSettingsOpen) return null;

  const handleSave = () => {
    setApiKey(localApiKey.trim());
    setModel(localModel.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setIsSettingsOpen(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">AI Provider & Settings</h2>
              <p className="text-[11px] text-zinc-400">Configure LLM backend and credentials</p>
            </div>
          </div>

          <button
            onClick={() => setIsSettingsOpen(false)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="mt-4 space-y-4 text-xs">
          {/* Provider Selection */}
          <div>
            <label className="block font-medium text-zinc-300 mb-1.5">
              Select LLM Provider
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'auto', label: 'Auto (Recommended)', desc: 'OpenAI/Claude if available, else Mock' },
                { id: 'openai', label: 'OpenAI', desc: 'GPT-4o / GPT-4o-mini structured JSON' },
                { id: 'anthropic', label: 'Anthropic Claude', desc: 'Claude 3.5 Sonnet / Haiku' },
                { id: 'mock', label: 'Heuristic Engine (Mock)', desc: 'Fast, offline static analysis with zero cost' },
              ].map((p) => {
                const isSelected = provider === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProvider(p.id as typeof provider)}
                    className={`flex flex-col text-left rounded-xl border p-2.5 transition-all ${
                      isSelected
                        ? 'border-indigo-500/60 bg-indigo-500/10 text-white'
                        : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <span className="font-semibold text-zinc-200 text-xs">{p.label}</span>
                    <span className="text-[10px] text-zinc-400 mt-0.5 leading-tight">{p.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* API Key Input */}
          <div>
            <label className="block font-medium text-zinc-300 mb-1">
              Custom API Key (Optional)
            </label>
            <div className="relative">
              <input
                type="password"
                value={localApiKey}
                onChange={(e) => setLocalApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
              />
              <Key className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">
              Keys are stored strictly in your browser&apos;s localStorage and sent only to the backend request.
            </p>
          </div>

          {/* Custom Model */}
          <div>
            <label className="block font-medium text-zinc-300 mb-1">
              Custom Model Identifier (Optional)
            </label>
            <input
              type="text"
              value={localModel}
              onChange={(e) => setLocalModel(e.target.value)}
              placeholder="e.g. gpt-4o-mini or claude-3-5-sonnet-20241022"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Info Banner */}
          <div className="flex items-start gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 text-[11px] text-zinc-300 leading-relaxed">
            <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-zinc-200">Zero-configuration offline mode: </span>
              If no API key is provided, the service seamlessly runs using our built-in AST Heuristic Analyzer, detecting real vulnerabilities (SQL injections, goroutine deadlocks, O(N²) loops, memory leaks) without incurring API charges!
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-end gap-2 border-t border-zinc-800/80 pt-3">
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-850 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all"
          >
            {saved ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
