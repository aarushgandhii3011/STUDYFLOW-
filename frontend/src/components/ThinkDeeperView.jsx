import React, { useState } from 'react';
import { Compass, Copy, Check, Lightbulb, HelpCircle, Layers, GitCompare, Sparkles } from 'lucide-react';

const QUESTION_TAGS = [
  { label: 'Scenario / What-If', icon: Lightbulb, color: '#f59e0b' },
  { label: 'Comparative Analysis', icon: GitCompare, color: '#818cf8' },
  { label: 'Applied Context', icon: Layers, color: '#10b981' },
  { label: 'Deep Causality / Why', icon: HelpCircle, color: '#ec4899' },
];

export default function ThinkDeeperView({ hotQuestions }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!hotQuestions || hotQuestions.length === 0) {
    return (
      <div className="fade-in" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        No higher-order questions available.
      </div>
    );
  }

  const handleCopy = async (question, index) => {
    try {
      await navigator.clipboard.writeText(question);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1800);
    } catch (err) {
      console.error('Failed to copy question:', err);
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
        gap: '0.75rem',
        marginBottom: '1.5rem',
        padding: '0.85rem 1.25rem',
        background: 'rgba(236, 72, 153, 0.08)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(236, 72, 153, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Compass size={18} color="#f472b6" />
          <span style={{ fontSize: '0.9rem', color: '#f1f5f9' }}>
            Higher-order critical thinking prompts designed to test application, synthesis, and deep conceptual evaluation.
          </span>
        </div>
        <span style={{
          fontSize: '0.75rem',
          color: '#f472b6',
          background: 'rgba(236, 72, 153, 0.15)',
          padding: '0.2rem 0.6rem',
          borderRadius: 'var(--radius-full)',
          fontWeight: '600'
        }}>
          Bloom's Taxonomy Level 4+
        </span>
      </div>

      {/* Grid / List of HOT questions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {hotQuestions.map((q, index) => {
          const tag = QUESTION_TAGS[index % QUESTION_TAGS.length];
          const TagIcon = tag.icon;

          return (
            <div
              key={index}
              className="hot-question-card"
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  color: tag.color,
                  background: `${tag.color}1a`,
                  border: `1px solid ${tag.color}40`,
                  padding: '0.25rem 0.65rem',
                  borderRadius: 'var(--radius-full)'
                }}>
                  <TagIcon size={13} />
                  Question {index + 1}: {tag.label}
                </span>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleCopy(q, index)}
                  title="Copy question"
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
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <p style={{
                color: '#f8fafc',
                fontSize: '1.02rem',
                lineHeight: 1.65,
                fontWeight: '500',
                margin: 0
              }}>
                {q}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
