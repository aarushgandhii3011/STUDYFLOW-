import React, { useState } from 'react';
import { Target, HelpCircle, AlertCircle, Copy, Check, Bookmark } from 'lucide-react';

export default function ImportantTopicsView({ importantTopics }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!importantTopics || importantTopics.length === 0) {
    return (
      <div className="fade-in" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        No important topics available.
      </div>
    );
  }

  const handleCopyQuestion = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1800);
    } catch (err) {
      console.error('Failed to copy question:', err);
    }
  };

  return (
    <div className="fade-in">
      {/* Top Advisory Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        padding: '0.85rem 1.25rem',
        background: 'rgba(99, 102, 241, 0.08)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(99, 102, 241, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Target size={18} color="#818cf8" />
          <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
            High-yield core topics identified from lecture analysis with synthesized practice questions.
          </span>
        </div>
        <span style={{
          fontSize: '0.75rem',
          color: '#a5b4fc',
          background: 'rgba(99, 102, 241, 0.15)',
          padding: '0.2rem 0.6rem',
          borderRadius: 'var(--radius-full)',
          fontWeight: '600'
        }}>
          {importantTopics.length} Focus Areas
        </span>
      </div>

      {/* Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {importantTopics.map((item, index) => (
          <div
            key={index}
            className="important-topic-card"
            style={{
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              transition: 'all 0.25s ease'
            }}
          >
            {/* Header: Topic Name */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '26px',
                  height: '26px',
                  borderRadius: '6px',
                  background: 'var(--accent-gradient)',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: '700'
                }}>
                  {index + 1}
                </span>
                <h3 style={{
                  fontSize: '1.15rem',
                  fontWeight: '700',
                  color: '#fff',
                  margin: 0
                }}>
                  {item.topic}
                </h3>
              </div>
            </div>

            {/* Why It Matters */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              borderLeft: '3px solid #818cf8',
              padding: '0.75rem 1rem',
              borderRadius: '0 var(--radius-sm) var(--radius-sm) 0'
            }}>
              <span style={{
                display: 'block',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: '700',
                color: '#a5b4fc',
                marginBottom: '0.25rem'
              }}>
                Why it matters
              </span>
              <p style={{
                color: '#cbd5e1',
                fontSize: '0.92rem',
                lineHeight: 1.55,
                margin: 0
              }}>
                {item.why_it_matters}
              </p>
            </div>

            {/* GATE-Style Practice Question Box */}
            <div style={{
              background: 'rgba(30, 27, 75, 0.45)',
              border: '1px solid rgba(129, 140, 248, 0.25)',
              borderRadius: 'var(--radius-sm)',
              padding: '1rem 1.25rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  color: '#c7d2fe',
                  background: 'rgba(99, 102, 241, 0.25)',
                  padding: '0.2rem 0.65rem',
                  borderRadius: 'var(--radius-full)'
                }}>
                  <Bookmark size={13} />
                  GATE-style practice question
                </span>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleCopyQuestion(item.gate_style_question, index)}
                  title="Copy practice question"
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem' }}
                >
                  {copiedIndex === index ? (
                    <>
                      <Check size={12} color="#34d399" />
                      <span style={{ color: '#34d399' }}>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy Question</span>
                    </>
                  )}
                </button>
              </div>

              <p style={{
                color: '#f1f5f9',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                fontFamily: 'var(--font-main)',
                margin: 0
              }}>
                {item.gate_style_question}
              </p>

              <p style={{
                fontSize: '0.75rem',
                color: 'var(--text-dim)',
                marginTop: '0.5rem',
                marginBottom: 0,
                fontStyle: 'italic'
              }}>
                Note: This is an AI-generated practice question framed in GATE examination style, not an official past exam question.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
