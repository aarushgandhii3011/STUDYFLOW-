import React from 'react';
import { Loader2, CheckCircle2, FileText, Brain, HelpCircle } from 'lucide-react';

export default function LoadingState({ uploadProgress, fileName }) {
  // uploadProgress can track { step: 'extracting' | 'generating', notesDone: bool, quizDone: bool }
  const { step, notesDone, quizDone } = uploadProgress;

  return (
    <div className="glass-panel fade-in" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
      <div style={{
        display: 'inline-flex',
        padding: '1.25rem',
        borderRadius: '50%',
        background: 'rgba(99, 102, 241, 0.1)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        marginBottom: '1.5rem'
      }}>
        <Loader2 size={42} color="#818cf8" className="spin" />
      </div>

      <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', color: '#fff' }}>
        Processing "{fileName || 'Document'}"
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2.5rem', maxWidth: '480px', margin: '0 auto 2.5rem' }}>
        Extracting content and running parallel AI generation for notes and quiz...
      </p>

      {/* Progress Cards */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        maxWidth: '520px',
        margin: '0 auto',
        textAlign: 'left'
      }}>
        {/* Step 1: PDF Extraction */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid var(--border-glass)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <FileText size={20} color="#818cf8" />
            <div>
              <p style={{ fontSize: '0.95rem', fontWeight: '600', color: '#fff' }}>1. PDF Text Extraction</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>PyMuPDF parsing & header cleanup</p>
            </div>
          </div>
          {step !== 'extracting' ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#34d399', fontSize: '0.85rem', fontWeight: '600' }}>
              <CheckCircle2 size={18} /> Ready
            </span>
          ) : (
            <Loader2 size={18} color="#818cf8" className="spin" />
          )}
        </div>

        {/* Step 2: Gemini Notes */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid var(--border-glass)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <Brain size={20} color="#c084fc" />
            <div>
              <p style={{ fontSize: '0.95rem', fontWeight: '600', color: '#fff' }}>2. Condensed Notes Synthesis</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Gemini 2.5 Flash structuring key concepts</p>
            </div>
          </div>
          {notesDone ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#34d399', fontSize: '0.85rem', fontWeight: '600' }}>
              <CheckCircle2 size={18} /> Ready
            </span>
          ) : step === 'generating' ? (
            <Loader2 size={18} color="#c084fc" className="spin" />
          ) : (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Queued</span>
          )}
        </div>

        {/* Step 3: Gemini Quiz */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid var(--border-glass)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <HelpCircle size={20} color="#f472b6" />
            <div>
              <p style={{ fontSize: '0.95rem', fontWeight: '600', color: '#fff' }}>3. 5-Question Quiz Generation</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Gemini structured JSON questions & explanations</p>
            </div>
          </div>
          {quizDone ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#34d399', fontSize: '0.85rem', fontWeight: '600' }}>
              <CheckCircle2 size={18} /> Ready
            </span>
          ) : step === 'generating' ? (
            <Loader2 size={18} color="#f472b6" className="spin" />
          ) : (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Queued</span>
          )}
        </div>
      </div>
    </div>
  );
}
