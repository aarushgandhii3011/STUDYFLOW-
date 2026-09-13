import os
import logging
from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import (
    UploadResponse,
    GenerateNotesRequest,
    GenerateNotesResponse,
    GenerateQuizRequest,
    GenerateQuizResponse
)
from app.services.pdf_service import extract_text_from_pdf_bytes
from app.services.gemini_service import generate_condensed_notes, generate_quiz

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("studyflow.api")

app = FastAPI(
    title="StudyFlow API",
    description="Backend API for StudyFlow - AI Lecture Notes & Quiz Generator",
    version="1.0.0"
)

# ALLOWED_ORIGINS: comma-separated list of origins for production.
# e.g. ALLOWED_ORIGINS=https://studyflow.vercel.app,https://www.studyflow.vercel.app
# Leave unset in local dev to allow all origins.
_raw_origins = os.getenv("ALLOWED_ORIGINS", "")
allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()] or ["*"]

# allow_credentials=True is incompatible with allow_origins=["*"] per the CORS spec.
# Only enable credentials when explicit origins are configured.
allow_credentials = allowed_origins != ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=allow_credentials,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

@app.get("/")
def health_check():
    return {"status": "ok", "app": "StudyFlow"}

@app.post("/upload", response_model=UploadResponse, status_code=status.HTTP_200_OK)
async def upload_pdf(file: UploadFile = File(...)):
    """
    Accepts a PDF file upload, extracts raw text using PyMuPDF, cleans it,
    and returns the extracted text and document metadata.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported. Please upload a .pdf file."
        )

    try:
        pdf_bytes = await file.read()
        if not pdf_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty."
            )

        cleaned_text, page_count = extract_text_from_pdf_bytes(pdf_bytes)

        return UploadResponse(
            filename=file.filename,
            page_count=page_count,
            char_count=len(cleaned_text),
            text=cleaned_text
        )
    except ValueError as e:
        logger.warning(f"PDF extraction error: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error processing PDF: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to extract text from PDF document."
        )

@app.post("/generate-notes", response_model=GenerateNotesResponse, status_code=status.HTTP_200_OK)
async def generate_notes_endpoint(payload: GenerateNotesRequest):
    """
    Generates structured, condensed Markdown revision notes from extracted lecture text.
    """
    try:
        notes = generate_condensed_notes(payload.text)
        return GenerateNotesResponse(notes=notes)
    except ValueError as e:
        logger.error(f"Configuration error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating notes: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate revision notes: {str(e)}"
        )

@app.post("/generate-quiz", response_model=GenerateQuizResponse, status_code=status.HTTP_200_OK)
async def generate_quiz_endpoint(payload: GenerateQuizRequest):
    """
    Generates a 5-question multiple choice quiz with structured JSON answers and explanations.
    """
    try:
        quiz = generate_quiz(payload.text)
        return GenerateQuizResponse(quiz=quiz)
    except ValueError as e:
        logger.error(f"Configuration error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating quiz: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate quiz: {str(e)}"
        )
