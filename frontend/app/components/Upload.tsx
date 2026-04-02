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
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Upload Documents</h2>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
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
          <div className="text-gray-600">
            <p className="text-lg mb-2">📁 Click to select or drag files</p>
            <p className="text-sm text-gray-500">Supported: PDF, TXT, Markdown</p>
            <p className="text-sm text-gray-500">Max size: 10MB per file</p>
          </div>
        </label>
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Selected Files:</h3>
          <ul className="space-y-1">
            {files.map((file, idx) => (
              <li key={idx} className="text-sm text-gray-700">
                ✓ {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </li>
            ))}
          </ul>
        </div>
      )}

      {progress > 0 && (
        <div className="mt-4">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">{progress}% uploaded</p>
        </div>
      )}

      {message && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading || files.length === 0}
        className="mt-4 w-full px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
      >
        {uploading ? 'Uploading...' : 'Upload Documents'}
      </button>
    </div>
  );
}
