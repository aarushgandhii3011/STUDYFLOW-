import React, { useState, useMemo } from 'react';
import { Download, Copy, Check, FileText, Clock } from 'lucide-react';
import { marked } from 'marked';

export default function NotesView({ notes, filename }) {
  const [copied, setCopied] = useState(false);

  // Configure marked for clean HTML output
  marked.setOptions({
    gfm: true,
    breaks: true,
  });

  const renderedHtml = useMemo(() => {
    if (!notes) return '';
    return marked.parse(notes);
  }, [notes]);

  const wordCount = useMemo(() => {
    if (!notes) return 0;
    return notes.trim().split(/\s+/).length;
  }, [notes]);

  const readingTimeMinutes = Math.max(1, Math.round(wordCount / 200));

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(notes);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy notes:', err);
    }
  };

  const handleExport = () => {
    const baseName = filename ? filename.replace(/\.[^/.]+$/, "") : "lecture";
    const blob = new Blob([notes], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${baseName}-StudyFlow-Notes.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fade-in">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
        padding: '0.85rem 1.25rem',
        background: 'rgba(15, 23, 42, 0.5)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-glass)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileText size={16} color="#818cf8" />
            {wordCount} words
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={16} color="#818cf8" />
            ~{readingTimeMinutes} min read
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleCopy}
            title="Copy Markdown text"
          >
            {copied ? <Check size={15} color="#34d399" /> : <Copy size={15} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleExport}
            title="Download as .md file"
          >
            <Download size={15} />
            <span>Export Notes (.md)</span>
          </button>
        </div>
      </div>

      <div 
        className="markdown-content"
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    </div>
  );
}
