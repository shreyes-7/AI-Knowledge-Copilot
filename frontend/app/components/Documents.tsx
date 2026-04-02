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
    return <div className="text-center text-gray-600">Loading documents...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Documents</h2>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg mb-4">{error}</div>
      )}

      <div className="space-y-2">
        {documents.map((doc) => (
          <div key={doc._id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-800">{doc.metadata.source}</p>
              <p className="text-sm text-gray-600 line-clamp-2">{doc.text}</p>
            </div>
            <button
              onClick={() => handleDelete(doc._id)}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {documents.length === 0 && (
        <p className="text-center text-gray-500">No documents yet. Upload some to get started!</p>
      )}

      {total > 10 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">Page {page}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page * 10 >= total}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
