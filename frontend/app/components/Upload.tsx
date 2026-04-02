'use client';

import React, { useState } from 'react';
import apiClient from '../services/api';

/**
 * Upload Component
 * Handles document uploads
 */
export default function UploadComponent() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setUploading(true);
    setError('');
    setMessage('');
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await apiClient.uploadDocuments(files);

      clearInterval(progressInterval);
      setProgress(100);

      if (response.success) {
        setMessage(
          `Successfully uploaded ${response.data.successful.length} file(s)`
        );
        setFiles([]);
        setTimeout(() => setProgress(0), 1000);
      } else {
        setError('Upload completed with errors');
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-faint)]">Ingestion</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Upload documents</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--text-soft)]">
            Feed the knowledge base with PDFs, notes, and markdown files. Larger uploads are supported,
            and the first local embedding pass may take a little longer while the model cache warms up.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--text-soft)]">
          Max file size: <span className="font-semibold">100MB</span>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-dashed border-white/12 bg-slate-950/40 p-8 text-center transition hover:border-white/20 hover:bg-slate-900/60">
        <input
          type="file"
          multiple
          accept=".pdf,.txt,.md"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
          id="file-input"
        />
        <label htmlFor="file-input" className="cursor-pointer">
          <div className="text-[var(--text-soft)]">
            <p className="text-xl font-semibold text-white">Drop files here or click to browse</p>
            <p className="mt-3 text-sm">Supported: PDF, TXT, Markdown</p>
            <p className="mt-1 text-sm text-[var(--text-faint)]">High-volume uploads work best after the first local model download completes.</p>
          </div>
        </label>
      </div>

      {files.length > 0 && (
        <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
          <h3 className="mb-3 font-semibold text-white">Selected files</h3>
          <ul className="space-y-1">
            {files.map((file, idx) => (
              <li key={idx} className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-slate-950/40 px-4 py-3 text-sm text-[var(--text-soft)]">
                <span className="truncate">{file.name}</span>
                <span className="shrink-0 text-[var(--text-faint)]">{(file.size / 1024).toFixed(2)} KB</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {progress > 0 && (
        <div className="mt-6">
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-neutral-200 to-neutral-500 transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="mt-2 text-sm text-[var(--text-soft)]">{progress}% uploaded</p>
        </div>
      )}

      {message && (
        <div className="status-success mt-6 rounded-2xl p-4">
          {message}
        </div>
      )}

      {error && (
        <div className="status-error mt-6 rounded-2xl p-4">
          {error}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading || files.length === 0}
        className="primary-button mt-6 w-full rounded-2xl px-6 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload Documents'}
      </button>
    </div>
  );
}
