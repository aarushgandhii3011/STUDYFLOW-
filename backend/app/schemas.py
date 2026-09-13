from typing import List
from pydantic import BaseModel, Field

class UploadResponse(BaseModel):
    filename: str
    page_count: int
    char_count: int
    text: str

class GenerateNotesRequest(BaseModel):
    text: str = Field(..., min_length=10, description="Cleaned lecture text")

class GenerateNotesResponse(BaseModel):
    notes: str

class QuizQuestion(BaseModel):
    question: str
    options: List[str] = Field(..., min_length=4, max_length=4)
    correct_index: int = Field(..., ge=0, le=3)
    explanation: str

class GenerateQuizRequest(BaseModel):
    text: str = Field(..., min_length=10, description="Cleaned lecture text")

class GenerateQuizResponse(BaseModel):
    quiz: List[QuizQuestion]
