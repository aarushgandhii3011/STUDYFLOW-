import React, { useState } from 'react';
import { CheckCircle2, XCircle, HelpCircle, Award, RotateCcw, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function QuizView({ quiz = [] }) {
  // selectedAnswers: { [questionIndex]: optionIndex }
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQuestions = quiz.length;

  const correctCount = Object.entries(selectedAnswers).reduce((count, [qIdx, chosenOptIdx]) => {
    const question = quiz[parseInt(qIdx, 10)];
    return question && question.correct_index === chosenOptIdx ? count + 1 : count;
  }, 0);

  const handleSelectOption = (qIdx, optIdx) => {
    // If already answered this question, don't allow changing to preserve quiz integrity (or allow if desired)
    if (selectedAnswers[qIdx] !== undefined) return;

    const newAnswers = {
      ...selectedAnswers,
      [qIdx]: optIdx,
    };
    setSelectedAnswers(newAnswers);

    // Trigger celebratory confetti if this was the last question and score >= 4
    if (Object.keys(newAnswers).length === totalQuestions) {
      const finalCorrect = Object.entries(newAnswers).reduce((count, [idx, opt]) => {
        return quiz[parseInt(idx, 10)]?.correct_index === opt ? count + 1 : count;
      }, 0);

      if (finalCorrect >= 3) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // confetti optional fallback
        }
      }
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="quiz-container fade-in">
      {/* Score Header Card */}
      <div className="quiz-score-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(99, 102, 241, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#a5b4fc'
          }}>
            <Award size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>
              Quiz Progress: {answeredCount} / {totalQuestions} Answered
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Current Score: <strong style={{ color: '#34d399' }}>{correctCount}</strong> / {totalQuestions} Correct ({totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0}%)
            </p>
          </div>
        </div>

        {answeredCount > 0 && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleResetQuiz}
          >
            <RotateCcw size={15} />
            <span>Retake Quiz</span>
          </button>
        )}
      </div>

      {/* Questions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {quiz.map((item, qIdx) => {
          const isAnswered = selectedAnswers[qIdx] !== undefined;
          const selectedOptIdx = selectedAnswers[qIdx];
          const isCorrect = isAnswered && selectedOptIdx === item.correct_index;

          return (
            <div key={qIdx} className="quiz-question-card">
              <div className="question-header">
                <span className="question-num-badge">{qIdx + 1}</span>
                <p className="question-title">{item.question}</p>
              </div>

              <div className="options-grid">
                {item.options.map((optionText, optIdx) => {
                  let buttonClass = 'option-btn';

                  if (isAnswered) {
                    if (optIdx === item.correct_index) {
                      buttonClass += ' correct';
                    } else if (optIdx === selectedOptIdx) {
                      buttonClass += ' incorrect';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      className={buttonClass}
                      onClick={() => handleSelectOption(qIdx, optIdx)}
                      disabled={isAnswered}
                    >
                      <span className="option-indicator">
                        {isAnswered && optIdx === item.correct_index ? (
                          <CheckCircle2 size={16} />
                        ) : isAnswered && optIdx === selectedOptIdx ? (
                          <XCircle size={16} />
                        ) : (
                          optionLabels[optIdx]
                        )}
                      </span>
                      <span>{optionText}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation (shown once answered) */}
              {isAnswered && (
                <div className="explanation-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700', marginBottom: '0.35rem', color: isCorrect ? '#34d399' : '#f87171' }}>
                    {isCorrect ? <CheckCircle2 size={16} /> : <HelpCircle size={16} />}
                    <span>{isCorrect ? 'Correct!' : `Incorrect (Correct: Option ${optionLabels[item.correct_index]})`}</span>
                  </div>
                  <p style={{ lineHeight: 1.5 }}>{item.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
