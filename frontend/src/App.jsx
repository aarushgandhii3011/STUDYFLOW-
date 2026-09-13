import React, { useState } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import LoadingState from './components/LoadingState';
import ShortNotesView from './components/ShortNotesView';
import NotesView from './components/NotesView';
import ImportantTopicsView from './components/ImportantTopicsView';
import QuizView from './components/QuizView';
import ThinkDeeperView from './components/ThinkDeeperView';
import { uploadPdf, generateNotes, generateQuiz, generateHotQuestions } from './api';
import { 
  Zap, 
  FileText, 
  Target, 
  HelpCircle, 
  Compass, 
  AlertCircle, 
  RefreshCw 
} from 'lucide-react';

export default function App() {
  const [file, setFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);

  // Generated study material states
  const [shortNotes, setShortNotes] = useState(null);
  const [detailedNotes, setDetailedNotes] = useState(null);
  const [importantTopics, setImportantTopics] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [hotQuestions, setHotQuestions] = useState(null);

  // Active Tab: 'short_notes' | 'full_notes' | 'important_topics' | 'quiz' | 'think_deeper'
  const [activeTab, setActiveTab] = useState('short_notes');

  // Loading & Progress State
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({
    step: 'extracting',
    notesDone: false,
    quizDone: false,
    hotDone: false,
  });
  const [errorMessage, setErrorMessage] = useState(null);

  const startProcessing = async (pdfFile) => {
    setFile(pdfFile);
    setErrorMessage(null);
    setIsLoading(true);
    setShortNotes(null);
    setDetailedNotes(null);
    setImportantTopics(null);
    setQuiz(null);
    setHotQuestions(null);
    setExtractedData(null);
    setLoadingProgress({
      step: 'extracting',
      notesDone: false,
      quizDone: false,
      hotDone: false,
    });

    try {
      // Step 1: Upload & extract text via PyMuPDF
      const uploadResult = await uploadPdf(pdfFile);
      setExtractedData(uploadResult);

      // Step 2: Trigger 3 parallel Gemini generations
      setLoadingProgress({
        step: 'generating',
        notesDone: false,
        quizDone: false,
        hotDone: false,
      });

      const extractedText = uploadResult.text;

      // Generation 1: Structured study guide (short notes, full notes, important topics)
      const notesPromise = generateNotes(extractedText)
        .then((res) => {
          setShortNotes(res.short_notes || []);
          setDetailedNotes(res.detailed_notes || '');
          setImportantTopics(res.important_topics || []);
          setLoadingProgress((prev) => ({ ...prev, notesDone: true }));
          return res;
        });

      // Generation 2: 5-Question interactive quiz
      const quizPromise = generateQuiz(extractedText)
        .then((res) => {
          setQuiz(res.quiz || []);
          setLoadingProgress((prev) => ({ ...prev, quizDone: true }));
          return res.quiz;
        });

      // Generation 3: 4 Higher-Order-Thinking questions
      const hotPromise = generateHotQuestions(extractedText)
        .then((res) => {
          setHotQuestions(res.hot_questions || []);
          setLoadingProgress((prev) => ({ ...prev, hotDone: true }));
          return res.hot_questions;
        });

      // Run all three requests in parallel using Promise.all
      await Promise.all([notesPromise, quizPromise, hotPromise]);

      setIsLoading(false);
      setActiveTab('short_notes');
    } catch (err) {
      console.error('Processing pipeline failed:', err);
      setErrorMessage(err.message || 'An unexpected error occurred during processing.');
      setIsLoading(false);
    }
  };

  const handleUseSample = async () => {
    try {
      const response = await fetch('/sample_lecture.pdf');
      const blob = await response.blob();
      const sampleFile = new File([blob], 'Neural_Networks_Lecture_4.pdf', { type: 'application/pdf' });
      startProcessing(sampleFile);
    } catch (err) {
      console.error('Failed to load sample PDF:', err);
      setErrorMessage('Could not load sample PDF. Please choose a local PDF file.');
    }
  };

  const handleReset = () => {
    setFile(null);
    setExtractedData(null);
    setShortNotes(null);
    setDetailedNotes(null);
    setImportantTopics(null);
    setQuiz(null);
    setHotQuestions(null);
    setIsLoading(false);
    setErrorMessage(null);
    setActiveTab('short_notes');
  };

  const hasResults = Boolean(shortNotes && detailedNotes && importantTopics && quiz && hotQuestions);

  return (
    <div className="app-container">
      <Header hasResults={hasResults} onReset={handleReset} />

      {/* Global Error Banner */}
      {errorMessage && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--danger-bg)',
          border: '1px solid var(--danger-border)',
          color: '#fca5a5',
          fontSize: '0.95rem',
          lineHeight: 1.5
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <AlertCircle size={22} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#fff', display: 'block', marginBottom: '0.2rem' }}>Generation Error</strong>
              <span>{errorMessage}</span>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => file && startProcessing(file)}
            style={{ flexShrink: 0 }}
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Upload View */}
      {!isLoading && !hasResults && (
        <FileUpload 
          onFileSelected={startProcessing} 
          isLoading={isLoading} 
          onUseSample={handleUseSample}
        />
      )}

      {/* Loading View */}
      {isLoading && (
        <LoadingState 
          uploadProgress={loadingProgress} 
          fileName={file?.name} 
        />
      )}

      {/* Results View with 5 Tabs */}
      {hasResults && !isLoading && (
        <div className="glass-panel fade-in">
          {/* Tabs Navigation Header */}
          <div className="tabs-header">
            <div className="tab-nav">
              <button
                type="button"
                className={`tab-btn ${activeTab === 'short_notes' ? 'active' : ''}`}
                onClick={() => setActiveTab('short_notes')}
              >
                <Zap size={16} />
                <span>Short Notes</span>
              </button>

              <button
                type="button"
                className={`tab-btn ${activeTab === 'full_notes' ? 'active' : ''}`}
                onClick={() => setActiveTab('full_notes')}
              >
                <FileText size={16} />
                <span>Full Notes</span>
              </button>

              <button
                type="button"
                className={`tab-btn ${activeTab === 'important_topics' ? 'active' : ''}`}
                onClick={() => setActiveTab('important_topics')}
              >
                <Target size={16} />
                <span>Important Topics ({importantTopics.length})</span>
              </button>

              <button
                type="button"
                className={`tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}
                onClick={() => setActiveTab('quiz')}
              >
                <HelpCircle size={16} />
                <span>Quiz ({quiz.length})</span>
              </button>

              <button
                type="button"
                className={`tab-btn ${activeTab === 'think_deeper' ? 'active' : ''}`}
                onClick={() => setActiveTab('think_deeper')}
              >
                <Compass size={16} />
                <span>Think Deeper ({hotQuestions.length})</span>
              </button>
            </div>

            {extractedData && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                Source: <span style={{ color: '#e2e8f0', fontWeight: '500' }}>{extractedData.filename}</span> ({extractedData.page_count} {extractedData.page_count === 1 ? 'page' : 'pages'})
              </div>
            )}
          </div>

          {/* Tab 1: Short Notes */}
          {activeTab === 'short_notes' && (
            <ShortNotesView shortNotes={shortNotes} />
          )}

          {/* Tab 2: Full Notes */}
          {activeTab === 'full_notes' && (
            <NotesView notes={detailedNotes} filename={file?.name} />
          )}

          {/* Tab 3: Important Topics */}
          {activeTab === 'important_topics' && (
            <ImportantTopicsView importantTopics={importantTopics} />
          )}

          {/* Tab 4: Quiz */}
          {activeTab === 'quiz' && (
            <QuizView quiz={quiz} />
          )}

          {/* Tab 5: Think Deeper */}
          {activeTab === 'think_deeper' && (
            <ThinkDeeperView hotQuestions={hotQuestions} />
          )}
        </div>
      )}
    </div>
  );
}
