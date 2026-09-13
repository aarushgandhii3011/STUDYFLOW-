import json
import logging
from typing import List
from google import genai
from google.genai import types
from app.config import get_gemini_api_key
from app.schemas import QuizQuestion

logger = logging.getLogger("studyflow.gemini")

def get_client() -> genai.Client:
    api_key = get_gemini_api_key()
    return genai.Client(api_key=api_key)


def generate_condensed_notes(lecture_text: str) -> str:
    """
    Generates condensed revision notes from lecture text using Gemini 2.5 Flash.
    Returns Markdown formatted notes with headings, bullet points, and bold key terms.
    """
    client = get_client()
    
    prompt = f"""You are an elite academic tutor creating high-yield revision notes from lecture materials.

Transform the provided lecture content into clear, structured, and condensed revision notes.
Requirements:
1. Use clear Markdown headings (# Title, ## Main Topics, ### Sub-concepts).
2. Use bullet points for key concepts, mechanisms, and findings.
3. Bold all essential terms, definitions, and critical keywords (**Key Term**).
4. Include a concise "⚡ Quick Summary" at the top and a "📌 Key Takeaways" section at the end.
5. Keep it punchy, factual, and strictly faithful to the provided lecture text without fluff.

LECTURE TEXT:
---
{lecture_text}
---
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )
    
    if not response.text:
        raise RuntimeError("Empty response received from Gemini for notes generation.")
        
    return response.text.strip()


def parse_quiz_json(raw_text: str) -> List[QuizQuestion]:
    """
    Parses and validates the raw JSON response for quiz questions.
    """
    text = raw_text.strip()
    # Strip markdown code fences if present
    if text.startswith("```"):
        lines = text.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        text = "\n".join(lines).strip()

    data = json.loads(text)
    if not isinstance(data, list):
        if isinstance(data, dict) and "quiz" in data:
            data = data["quiz"]
        elif isinstance(data, dict) and "questions" in data:
            data = data["questions"]
        else:
            raise ValueError("Expected a JSON array of questions.")

    if len(data) != 5:
        raise ValueError(f"Expected exactly 5 quiz questions, got {len(data)}.")

    validated_questions = []
    for item in data:
        q = QuizQuestion(
            question=item["question"],
            options=item["options"],
            correct_index=int(item["correct_index"]),
            explanation=item["explanation"]
        )
        validated_questions.append(q)

    return validated_questions


def generate_quiz(lecture_text: str) -> List[QuizQuestion]:
    """
    Generates a 5-question multiple choice quiz with structured output.
    Retries once if parsing or validation fails.
    """
    client = get_client()

    prompt = f"""You are an academic assessment expert. Generate exactly 5 challenging and conceptual multiple-choice questions based on the lecture text provided below.

Strict Output Requirements:
- You MUST return a JSON array containing exactly 5 objects.
- Each object must match this schema:
  {{
    "question": "Clear and specific question string",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_index": 0,  // Integer 0, 1, 2, or 3 pointing to the correct option
    "explanation": "Clear 1-2 sentence explanation of why this option is correct"
  }}
- Do NOT include any markdown formatting or commentary outside the JSON array.

LECTURE TEXT:
---
{lecture_text}
---
"""

    last_error = None
    # Try up to 2 times (1 original + 1 retry)
    for attempt in range(2):
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.3,
                )
            )
            
            if not response.text:
                raise ValueError("Empty response received from Gemini for quiz generation.")
                
            return parse_quiz_json(response.text)
        except Exception as e:
            last_error = e
            logger.warning(f"Quiz generation attempt {attempt + 1} failed: {str(e)}")
            if attempt == 0:
                continue

    raise RuntimeError(f"Failed to generate valid 5-question quiz after retry. Details: {str(last_error)}")
