import React, { useState } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import LoadingState from './components/LoadingState';
import NotesView from './components/NotesView';
import QuizView from './components/QuizView';
import { uploadPdf, generateNotes, generateQuiz } from './api';
import { FileText, HelpCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [file, setFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [notes, setNotes] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'quiz'

  // Loading & Step State
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({
    step: 'extracting', // 'extracting' | 'generating' | 'done'
    notesDone: false,
    quizDone: false,
  });
  const [errorMessage, setErrorMessage] = useState(null);

  const startProcessing = async (pdfFile) => {
    setFile(pdfFile);
    setErrorMessage(null);
    setIsLoading(true);
    setNotes(null);
    setQuiz(null);
    setExtractedData(null);
    setLoadingProgress({
      step: 'extracting',
      notesDone: false,
      quizDone: false,
    });

    try {
      // Step 1: Upload and extract text via PyMuPDF
      const uploadResult = await uploadPdf(pdfFile);
      setExtractedData(uploadResult);

      // Step 2 & 3: Run Gemini Notes & Quiz generation in parallel
      setLoadingProgress({
        step: 'generating',
        notesDone: false,
        quizDone: false,
      });

      const extractedText = uploadResult.text;

      // Parallel execution promises
      const notesPromise = generateNotes(extractedText)
        .then((res) => {
          setNotes(res.notes);
          setLoadingProgress((prev) => ({ ...prev, notesDone: true }));
          return res.notes;
        });

      const quizPromise = generateQuiz(extractedText)
        .then((res) => {
          setQuiz(res.quiz);
          setLoadingProgress((prev) => ({ ...prev, quizDone: true }));
          return res.quiz;
        });

      // Wait for both parallel requests to settle
      await Promise.all([notesPromise, quizPromise]);

      setIsLoading(false);
      setActiveTab('notes');
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
    setNotes(null);
    setQuiz(null);
    setIsLoading(false);
    setErrorMessage(null);
    setActiveTab('notes');
  };

  const hasResults = Boolean(notes && quiz);

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

      {/* Pipeline View Switcher */}
      {!isLoading && !hasResults && (
        <FileUpload 
          onFileSelected={startProcessing} 
          isLoading={isLoading} 
          onUseSample={handleUseSample}
        />
      )}

      {isLoading && (
        <LoadingState 
          uploadProgress={loadingProgress} 
          fileName={file?.name} 
        />
      )}

      {hasResults && !isLoading && (
        <div className="glass-panel fade-in">
          {/* Tabs Navigation Header */}
          <div className="tabs-header">
            <div className="tab-nav">
              <button
                type="button"
                className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
                onClick={() => setActiveTab('notes')}
              >
                <FileText size={17} />
                <span>Revision Notes</span>
              </button>

              <button
                type="button"
                className={`tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}
                onClick={() => setActiveTab('quiz')}
              >
                <HelpCircle size={17} />
                <span>Practice Quiz ({quiz.length})</span>
              </button>
            </div>

            {extractedData && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                Source: <span style={{ color: '#e2e8f0', fontWeight: '500' }}>{extractedData.filename}</span> ({extractedData.page_count} {extractedData.page_count === 1 ? 'page' : 'pages'})
              </div>
            )}
          </div>

          {/* Active Tab Content */}
          {activeTab === 'notes' && (
            <NotesView notes={notes} filename={file?.name} />
          )}

          {activeTab === 'quiz' && (
            <QuizView quiz={quiz} />
          )}
        </div>
      )}
    </div>
  );
}
