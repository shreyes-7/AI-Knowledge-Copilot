'use client';

import React, { useState } from 'react';
import ChatComponent from './components/Chat';
import UploadComponent from './components/Upload';
import DocumentsComponent from './components/Documents';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'chat' | 'upload' | 'documents'>('chat');

  const tabs = [
    { id: 'chat', label: 'Chat', hint: 'Ask grounded questions' },
    { id: 'upload', label: 'Upload', hint: 'Ingest new sources' },
    { id: 'documents', label: 'Documents', hint: 'Browse indexed chunks' },
  ] as const;

  return (
    <div className="app-shell flex h-screen flex-col overflow-hidden">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/85 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="shrink-0">
            <div className="text-xs uppercase tracking-[0.22em] text-[var(--text-faint)]">
              Document Intelligence
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
              AI Knowledge Copilot
            </h1>
          </div>

          <nav className="flex flex-wrap gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button min-w-[170px] rounded-2xl px-4 py-3 text-left ${
                  activeTab === tab.id ? 'tab-button-active' : ''
                }`}
              >
                <div className="text-sm font-semibold text-white">{tab.label}</div>
                <div className="mt-1 text-xs text-[var(--text-faint)]">{tab.hint}</div>
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-3 2xl:flex">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-faint)]">Upload</div>
              <div className="mt-1 text-sm font-semibold text-white">Up to 100MB</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-faint)]">Search</div>
              <div className="mt-1 text-sm font-semibold text-white">Hybrid retrieval</div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-4 py-4 sm:px-6 lg:px-8">
        <div className="min-h-0 flex-1 overflow-hidden">
          {activeTab === 'chat' && (
            <div className="h-full">
              <ChatComponent />
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="glass-panel thin-scrollbar h-full overflow-y-auto rounded-[2rem] p-4">
              <UploadComponent />
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="glass-panel thin-scrollbar h-full overflow-y-auto rounded-[2rem] p-4">
              <DocumentsComponent />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
