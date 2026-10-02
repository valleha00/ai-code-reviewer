'use client';

import React from 'react';
import { Header } from '../components/layout/Header';
import { CodeEditorPanel } from '../components/editor/CodeEditorPanel';
import { ReviewDashboardPanel } from '../components/review/ReviewDashboardPanel';
import { HistoryDrawer } from '../components/history/HistoryDrawer';
import { SettingsModal } from '../components/settings/SettingsModal';
import { ExportModal } from '../components/review/ExportModal';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background ambient glow - Linear style */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[35rem] w-[50rem] rounded-full bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Navigation Bar */}
        <Header />

        {/* Split Screen Workspace */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6">
          <div className="mx-auto grid h-[calc(100vh-5.5rem)] max-w-7xl grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Left Panel: Code Input & Editor */}
            <section className="h-full min-h-[420px] lg:min-h-0 flex flex-col">
              <CodeEditorPanel />
            </section>

            {/* Right Panel: AI Review Output & Dashboard */}
            <section className="h-full min-h-[420px] lg:min-h-0 flex flex-col">
              <ReviewDashboardPanel />
            </section>
          </div>
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <HistoryDrawer />
      <SettingsModal />
      <ExportModal />
    </div>
  );
}
