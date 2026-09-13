# StudyFlow 🎓

> **AI-powered lecture revision tool** — Upload a PDF, get condensed notes + an interactive 5-question quiz in seconds, powered by **Gemini 2.5 Flash**.

---

## 📁 Project Structure

```
hackathon/
├── backend/                     # FastAPI Python backend
│   ├── app/
│   │   ├── main.py              # Routes: /upload, /generate-notes, /generate-quiz
│   │   ├── config.py            # Loads GEMINI_API_KEY from .env
│   │   ├── schemas.py           # Pydantic models
│   │   └── services/
│   │       ├── pdf_service.py   # PyMuPDF text extraction & cleaning
│   │       └── gemini_service.py# Gemini 2.5 Flash notes + quiz generation
│   └── requirements.txt
├── frontend/                    # React + Vite frontend
│   └── src/
│       ├── App.jsx              # Main app, parallel AI calls
│       ├── api.js               # Backend API client
│       └── components/
│           ├── Header.jsx       # Branding & "New Document" reset
│           ├── FileUpload.jsx   # Drag-and-drop PDF upload
│           ├── LoadingState.jsx # Step progress indicator
│           ├── NotesView.jsx    # Markdown notes + Export (.md) button
│           └── QuizView.jsx     # Interactive quiz + instant scoring
├── .env                         # ← YOUR API KEY GOES HERE (never committed)
├── .env.example                 # Key template
└── .gitignore
```

---

## ⚡ Quick Start

### 1. Add your Gemini API key

Edit `.env` in the project root:
```
GEMINI_API_KEY=your_actual_key_here
```

Get a free API key at: https://aistudio.google.com/app/apikey

### 2. Start the Backend

```bash
cd hackathon/backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend runs at: http://127.0.0.1:8000  
API docs: http://127.0.0.1:8000/docs

### 3. Start the Frontend

```bash
cd hackathon/frontend
npm run dev
```

Frontend runs at: http://127.0.0.1:5173

---

## 🔄 How It Works

```
Upload PDF  →  /upload (PyMuPDF extract & clean)
                    ↓
         ┌──────────┴──────────┐   (Parallel)
  /generate-notes        /generate-quiz
  (Markdown notes)      (5-question JSON)
         └──────────┬──────────┘
                    ↓
         Notes Tab + Quiz Tab
```

1. **Upload** — PDF text extracted with PyMuPDF, headers/page numbers stripped
2. **Notes** — Gemini 2.5 Flash generates structured Markdown with headings, bullets, and bolded key terms
3. **Quiz** — Gemini returns strict JSON: 5 MCQs with 4 options, correct index, and explanations
4. **Export** — "Export Notes (.md)" downloads your revision notes client-side (no backend needed)
5. **Quiz** — Instant client-side scoring with answer reveal and confetti on high scores 🎉

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Python 3.14 + FastAPI + Uvicorn |
| PDF Extraction | PyMuPDF (`pymupdf`) |
| AI | Google Gemini 2.5 Flash via `google-genai` SDK |
| Frontend | React 19 + Vite 8 |
| Markdown | `marked` library |
| Icons | `lucide-react` |
| Confetti | `canvas-confetti` |

---

## 📡 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health check |
| POST | `/upload` | Upload PDF, returns extracted text |
| POST | `/generate-notes` | Generate Markdown revision notes |
| POST | `/generate-quiz` | Generate 5-question JSON quiz |

Full interactive docs at **http://127.0.0.1:8000/docs**
