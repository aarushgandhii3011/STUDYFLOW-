import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, ArrowRight, Zap } from 'lucide-react';

export default function FileUpload({ onFileSelected, isLoading, onUseSample }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    setError(null);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    setError(null);
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a valid PDF document (.pdf).');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError('File size exceeds 25MB limit.');
      return;
    }
    onFileSelected(file);
  };

  return (
    <div className="glass-panel fade-in">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.5rem', color: '#fff' }}>
          Upload Lecture PDF
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '560px', margin: '0 auto' }}>
          Drop your lecture slides, academic papers, or textbook chapters. PyMuPDF extracts the text, and Gemini 2.5 Flash generates your revision pack.
        </p>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf"
        style={{ display: 'none' }}
      />

      <div
        className={`dropzone ${isDragOver ? 'active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
      >
        <div className="dropzone-icon-circle">
          <UploadCloud size={36} />
        </div>

        <div>
          <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#fff', marginBottom: '0.25rem' }}>
            Click to upload or drag & drop PDF here
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            Supports PDF files up to 25MB
          </p>
        </div>

        <button 
          type="button" 
          className="btn btn-primary"
          disabled={isLoading}
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          <FileText size={18} />
          Select PDF File
        </button>
      </div>

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          marginTop: '1.25rem',
          padding: '0.85rem 1.2rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--danger-bg)',
          border: '1px solid var(--danger-border)',
          color: '#f87171',
          fontSize: '0.9rem'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {onUseSample && (
        <div style={{ 
          marginTop: '1.75rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '0.75rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-glass)'
        }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>No PDF handy?</span>
          <button 
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onUseSample}
            disabled={isLoading}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
          >
            <Zap size={14} color="#818cf8" />
            Try Sample ML Lecture
          </button>
        </div>
      )}
    </div>
  );
}
