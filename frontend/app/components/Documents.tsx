'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';

interface DocumentItem {
  _id: string;
  text: string;
  metadata: {
    source: string;
    doc_id: string;
    chunk_index: number;
  };
}

/**
 * Documents Component
 * Lists and manages documents
 */
export default function DocumentsComponent() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDocuments();
  }, [page]);

  const loadDocuments = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.getDocuments(page, 10);

      if (response.success) {
        setDocuments(response.data.documents);
        setTotal(response.data.pagination.total);
      } else {
        setError('Failed to load documents');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        await apiClient.deleteDocument(id);
        loadDocuments();
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-[var(--text-soft)]">Loading documents...</div>;
  }

  return (
    <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-faint)]">Library</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Indexed documents</h2>
          <p className="mt-2 text-sm leading-7 text-[var(--text-soft)]">
            Review the chunks currently available to retrieval, inspect source material, and remove stale entries.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--text-soft)]">
          {total} indexed chunk{total === 1 ? '' : 's'}
        </div>
      </div>

      {error && (
        <div className="status-error mb-5 rounded-2xl p-4">{error}</div>
      )}

      <div className="space-y-3">
        {documents.map((doc) => (
          <div
            key={doc._id}
            className="rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-5 transition hover:border-cyan-300/20 hover:bg-slate-900/65"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-white">{doc.metadata.source}</p>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[var(--text-faint)]">
                    chunk {doc.metadata.chunk_index + 1}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--text-soft)] line-clamp-3">{doc.text}</p>
              </div>

              <button
                onClick={() => handleDelete(doc._id)}
                className="danger-button shrink-0 rounded-2xl px-4 py-2 text-sm font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {documents.length === 0 && (
        <p className="py-10 text-center text-[var(--text-faint)]">No documents yet. Upload some to get started.</p>
      )}

      {total > 10 && (
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="secondary-button rounded-2xl px-4 py-2 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-[var(--text-soft)]">Page {page}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page * 10 >= total}
            className="secondary-button rounded-2xl px-4 py-2 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
