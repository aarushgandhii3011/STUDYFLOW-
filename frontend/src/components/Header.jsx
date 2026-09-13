import React from 'react';
import { Sparkles, BookOpen, RotateCcw } from 'lucide-react';

export default function Header({ hasResults, onReset }) {
  return (
    <header className="header">
      <div className="logo-container">
        <div className="logo-icon">
          <Sparkles size={24} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 className="brand-title">StudyFlow</h1>
            <span className="badge">Gemini 2.5 Flash</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Turn lecture PDFs into condensed revision notes & quizzes in seconds
          </p>
        </div>
      </div>

      {hasResults && (
        <button 
          className="btn btn-secondary btn-sm"
          onClick={onReset}
          title="Upload another lecture PDF"
        >
          <RotateCcw size={16} />
          <span>New Document</span>
        </button>
      )}
    </header>
  );
}
