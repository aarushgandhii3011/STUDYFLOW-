# STUDYFLOW-
🎓 StudyFlow — Turn lecture PDFs into condensed revision notes &amp; interactive quizzes instantly using FastAPI and Google Gemini 2.5 Flash. Fast, async, clean UI.
# StudyFlow 🎓⚡

**StudyFlow** is a lightweight AI-powered web app that transforms lecture PDFs into condensed revision notes and interactive 5-question quizzes in parallel using Google's **Gemini 2.5 Flash** API.

---

## 🚀 Features

- **PDF Processing:** Quick text extraction using PyMuPDF (`fitz`).
- **AI Revision Notes:** Automatically generates clean Markdown summaries with key concepts bolded.
- **Interactive Quiz:** Creates a 5-question multiple-choice quiz with instant scoring and explanations.
- **Parallel Processing:** Async API requests ensure fast delivery of notes and quiz simultaneously.
- **Export Notes:** Download generated revision notes as a `.md` file with one click.

---

## 🛠️ Tech Stack

- **Backend:** Python, FastAPI, PyMuPDF, `google-genai` SDK (`gemini-2.5-flash`), `python-dotenv`
- **Frontend:** HTML5, Tailwind CSS (via CDN), Vanilla JavaScript, `marked.js`

---

## 📁 Repository Structure

```text
studyflow/
├── backend/
│   ├── .env                 # API Key (GEMINI_API_KEY)
│   ├── main.py              # FastAPI endpoints (/upload, /generate-notes, /generate-quiz)
│   ├── services.py          # PyMuPDF processing & Gemini client calls
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── index.html           # Single-page app UI
│   └── app.js               # Async fetch calls, parallel handling, quiz interactivity
├── .gitignore
└── README.md
