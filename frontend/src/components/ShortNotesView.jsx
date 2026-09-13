import React, { useState } from 'react';
import { Zap, Copy, Check, Sparkles } from 'lucide-react';

export default function ShortNotesView({ shortNotes }) {
  const [copied, setCopied] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!shortNotes || shortNotes.length === 0) {
    return (
      <div className="fade-in" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        No short notes available.
      </div>
    );
  }

  const handleCopyAll = async () => {
    try {
      const textToCopy = shortNotes.map((note, i) => `${i + 1}. ${note}`).join('\n');
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy short notes:', err);
    }
  };

  const handleCopySingle = async (note, index) => {
    try {
      await navigator.clipboard.writeText(note);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch (err) {
      console.error('Failed to copy note:', err);
    }
  };

  return (
    <div className="fade-in">
      {/* Top Banner */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: 'rgba(99, 102, 241, 0.2)',
            color: '#818cf8'
          }}>
            <Zap size={16} />
          </div>
          <div>
            <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#fff' }}>
              Ultra-Condensed Bullets
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginLeft: '0.5rem' }}>
              ({shortNotes.length} key takeaways for last-minute review)
            </span>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleCopyAll}
          title="Copy all short notes to clipboard"
        >
          {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
          <span>{copied ? 'Copied All!' : 'Copy All'}</span>
        </button>
      </div>

      {/* Bullet Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {shortNotes.map((note, index) => (
          <div
            key={index}
            className="short-note-card"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '1rem',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-glass)',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', flexGrow: 1 }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#a5b4fc',
                fontSize: '0.8rem',
                fontWeight: '700',
                flexShrink: 0,
                marginTop: '1px'
              }}>
                {index + 1}
              </span>
              <p style={{
                color: '#e2e8f0',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                margin: 0
              }}>
                {note}
              </p>
            </div>

            <button
              type="button"
              className="copy-icon-btn"
              onClick={() => handleCopySingle(note, index)}
              title="Copy bullet"
              style={{
                background: 'transparent',
                border: 'none',
                color: copiedIndex === index ? '#34d399' : 'var(--text-dim)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                flexShrink: 0
              }}
            >
              {copiedIndex === index ? <Check size={15} /> : <Copy size={15} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
