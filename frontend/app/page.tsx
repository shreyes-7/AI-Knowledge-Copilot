'use client';

import React, { useState } from 'react';
import ChatComponent from './components/Chat';
import UploadComponent from './components/Upload';
import DocumentsComponent from './components/Documents';

/**
 * Main Page Component
 * Dashboard with tabs for chat, upload, and documents
 */
export default function Home() {
  const [activeTab, setActiveTab] = useState<'chat' | 'upload' | 'documents'>('chat');

  return (
    <div className="min-h-screen bg-light">
      {/* Header */}
      <header className="bg-dark text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">🤖 AI Knowledge Copilot</h1>
          <p className="text-gray-400 mt-1">Production RAG System with MongoDB Atlas</p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex gap-8">
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-4 px-2 font-semibold transition ${
              activeTab === 'chat'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            💬 Chat
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-4 px-2 font-semibold transition ${
              activeTab === 'upload'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📤 Upload
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-4 px-2 font-semibold transition ${
              activeTab === 'documents'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📄 Documents
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'chat' && (
          <div className="h-[600px]">
            <ChatComponent />
          </div>
        )}

        {activeTab === 'upload' && <UploadComponent />}

        {activeTab === 'documents' && <DocumentsComponent />}
      </main>

      {/* Footer */}
      <footer className="bg-dark text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-400">
          <p>AI Knowledge Copilot © 2024 - Production RAG System</p>
        </div>
      </footer>
    </div>
  );
}
