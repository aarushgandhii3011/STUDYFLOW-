from typing import List
from pydantic import BaseModel, Field

class UploadResponse(BaseModel):
    filename: str
    page_count: int
    char_count: int
    text: str

class ImportantTopic(BaseModel):
    topic: str
    why_it_matters: str
    gate_style_question: str

class GenerateNotesRequest(BaseModel):
    text: str = Field(..., min_length=10, description="Cleaned lecture text")

class GenerateNotesResponse(BaseModel):
    short_notes: List[str]
    detailed_notes: str
    important_topics: List[ImportantTopic]

class QuizQuestion(BaseModel):
    question: str
    options: List[str] = Field(..., min_length=4, max_length=4)
    correct_index: int = Field(..., ge=0, le=3)
    explanation: str

class GenerateQuizRequest(BaseModel):
    text: str = Field(..., min_length=10, description="Cleaned lecture text")

class GenerateQuizResponse(BaseModel):
    quiz: List[QuizQuestion]

class GenerateHotQuestionsRequest(BaseModel):
    text: str = Field(..., min_length=10, description="Cleaned lecture text")

class GenerateHotQuestionsResponse(BaseModel):
    hot_questions: List[str]
