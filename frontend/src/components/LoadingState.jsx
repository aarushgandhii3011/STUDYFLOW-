import React from 'react';
import { Loader2, CheckCircle2, FileText, Brain, HelpCircle, Compass } from 'lucide-react';

export default function LoadingState({ uploadProgress, fileName }) {
  const { step, notesDone, quizDone, hotDone } = uploadProgress;

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
        Synthesizing "{fileName || 'Document'}"
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2.5rem', maxWidth: '520px', margin: '0 auto 2.5rem' }}>
        Extracting text with PyMuPDF and running 3 parallel Gemini 2.5 Flash generations...
      </p>

      {/* Progress Cards */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        maxWidth: '540px',
        margin: '0 auto',
        textAlign: 'left'
      }}>
        {/* Step 1: PDF Extraction */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.9rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid var(--border-glass)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <FileText size={19} color="#818cf8" />
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#fff', margin: 0 }}>1. PDF Text Extraction</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', margin: 0 }}>PyMuPDF parsing & cleanup</p>
            </div>
          </div>
          {step !== 'extracting' ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#34d399', fontSize: '0.82rem', fontWeight: '600' }}>
              <CheckCircle2 size={16} /> Extracted
            </span>
          ) : (
            <Loader2 size={17} color="#818cf8" className="spin" />
          )}
        </div>

        {/* Step 2: Notes & Study Guide */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.9rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid var(--border-glass)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <Brain size={19} color="#c084fc" />
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#fff', margin: 0 }}>2. Study Guide & GATE Practice</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', margin: 0 }}>Short notes, full notes & important topics</p>
            </div>
          </div>
          {notesDone ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#34d399', fontSize: '0.82rem', fontWeight: '600' }}>
              <CheckCircle2 size={16} /> Ready
            </span>
          ) : step === 'generating' ? (
            <Loader2 size={17} color="#c084fc" className="spin" />
          ) : (
            <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>Queued</span>
          )}
        </div>

        {/* Step 3: Quiz */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.9rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid var(--border-glass)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <HelpCircle size={19} color="#f472b6" />
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#fff', margin: 0 }}>3. 5-Question Practice Quiz</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', margin: 0 }}>Multiple-choice with explanations</p>
            </div>
          </div>
          {quizDone ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#34d399', fontSize: '0.82rem', fontWeight: '600' }}>
              <CheckCircle2 size={16} /> Ready
            </span>
          ) : step === 'generating' ? (
            <Loader2 size={17} color="#f472b6" className="spin" />
          ) : (
            <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>Queued</span>
          )}
        </div>

        {/* Step 4: HOT Questions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.9rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid var(--border-glass)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <Compass size={19} color="#34d399" />
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#fff', margin: 0 }}>4. Higher-Order Questions (HOT)</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', margin: 0 }}>Application, comparison & deep causality</p>
            </div>
          </div>
          {hotDone ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#34d399', fontSize: '0.82rem', fontWeight: '600' }}>
              <CheckCircle2 size={16} /> Ready
            </span>
          ) : step === 'generating' ? (
            <Loader2 size={17} color="#34d399" className="spin" />
          ) : (
            <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>Queued</span>
          )}
        </div>
      </div>
    </div>
  );
}
