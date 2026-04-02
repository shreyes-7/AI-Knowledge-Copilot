'use client';

import React, { useState, useRef, useEffect } from 'react';
import apiClient from '../services/api';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  sources?: Array<{ source: string; docId: string }>;
  loading?: boolean;
}

/**
 * Chat Component
 * Main chat interface for interacting with the RAG system
 */
export default function ChatComponent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      // Call API
      const response = await apiClient.chat(input.trim());

      if (response.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: response.data.answer,
          sources: response.data.sources,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        setError(response.error || 'Failed to get response');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel flex h-full flex-col overflow-hidden rounded-[2rem]">
      <div className="border-b border-white/10 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-faint)]">Conversation</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Ask your knowledge base</h2>
            <p className="mt-1 text-sm text-[var(--text-soft)]">
              Get detailed, source-grounded responses from your uploaded documents.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-right">
            <div className="text-xs uppercase tracking-[0.18em] text-[var(--text-faint)]">Focus</div>
            <div className="mt-1 text-sm font-semibold text-white">Explain, compare, summarize</div>
          </div>
        </div>
      </div>

      <div className="thin-scrollbar flex-1 overflow-y-auto p-6">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-center">
            <div className="max-w-xl rounded-[1.75rem] border border-white/10 bg-white/5 px-8 py-10">
              <div className="section-label mx-auto">Ready</div>
              <h2 className="mt-4 text-3xl font-bold text-white">Turn your documents into a personal research desk</h2>
              <p className="mt-3 leading-7 text-[var(--text-soft)]">
                Upload PDFs, markdown, or notes, then ask direct or open-ended questions and let the
                assistant synthesize grounded answers from your indexed content.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-5">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs rounded-[1.5rem] px-5 py-4 shadow-2xl lg:max-w-2xl xl:max-w-3xl ${
                  message.type === 'user'
                    ? 'border border-white/10 bg-gradient-to-br from-neutral-100 to-neutral-300 text-black'
                    : 'border border-white/10 bg-slate-900/80 text-slate-100'
                }`}
              >
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] opacity-70">
                  {message.type === 'user' ? 'You' : 'Assistant'}
                </div>
                <p className="whitespace-pre-wrap leading-7">{message.content}</p>
              {message.sources && message.sources.length > 0 && (
                <div className="mt-4 border-t border-white/10 pt-3 text-sm">
                  <p className="font-semibold text-white">Sources</p>
                  {message.sources.map((source, idx) => (
                    <div key={idx} className="mt-1 text-xs text-[var(--text-soft)]">
                      • {source.source}
                    </div>
                  ))}
                </div>
              )}
              </div>
            </div>
          ))}
        </div>

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-[1.25rem] border border-white/10 bg-slate-900/80 px-4 py-3 text-gray-100">
              <div className="flex space-x-2">
                <div className="h-2 w-2 animate-bounce rounded-full bg-neutral-200"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-neutral-200 delay-100"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-neutral-200 delay-200"></div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="status-error rounded-2xl px-4 py-3">
            Error: {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-white/10 p-4 sm:p-5">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for an explanation, summary, comparison, or walkthrough..."
            disabled={loading}
            className="control flex-1 px-4 py-3"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="primary-button rounded-2xl px-6 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
