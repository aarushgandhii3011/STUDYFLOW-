const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Uploads a PDF file to extract cleaned lecture text.
 */
export async function uploadPdf(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to extract text from PDF');
  }

  return response.json();
}

/**
 * Calls Gemini to generate condensed revision notes from extracted text.
 */
export async function generateNotes(text) {
  const response = await fetch(`${API_BASE}/generate-notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to generate revision notes');
  }

  return response.json();
}

/**
 * Calls Gemini to generate a 5-question multiple choice quiz.
 */
export async function generateQuiz(text) {
  const response = await fetch(`${API_BASE}/generate-quiz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to generate interactive quiz');
  }

  return response.json();
}
