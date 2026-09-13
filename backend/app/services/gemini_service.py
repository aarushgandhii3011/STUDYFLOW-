import json
import logging
from typing import List, Dict, Any
from google import genai
from google.genai import types
import os
from app.config import get_gemini_api_key
from app.schemas import QuizQuestion, ImportantTopic, GenerateNotesResponse

logger = logging.getLogger("studyflow.gemini")

DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")

def get_client() -> genai.Client:
    api_key = get_gemini_api_key()
    return genai.Client(api_key=api_key)


def _clean_json_string(raw_text: str) -> str:
    """Strips Markdown code fences and whitespace from response text."""
    text = raw_text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    return text


def parse_notes_json(raw_text: str) -> GenerateNotesResponse:
    """Parses and validates the JSON response for notes and study guide."""
    clean_text = _clean_json_string(raw_text)
    data = json.loads(clean_text)

    if not isinstance(data, dict):
        raise ValueError("Expected a JSON object with study guide fields.")

    short_notes = data.get("short_notes", [])
    detailed_notes = data.get("detailed_notes", "")
    raw_topics = data.get("important_topics", [])

    if not isinstance(short_notes, list):
        raise ValueError("'short_notes' must be a list of strings.")

    if not isinstance(detailed_notes, str):
        raise ValueError("'detailed_notes' must be a markdown string.")

    if not isinstance(raw_topics, list):
        raise ValueError("'important_topics' must be a list of topic objects.")

    important_topics = []
    for item in raw_topics:
        if isinstance(item, dict):
            topic = ImportantTopic(
                topic=str(item.get("topic", "")),
                why_it_matters=str(item.get("why_it_matters", "")),
                gate_style_question=str(item.get("gate_style_question", ""))
            )
            important_topics.append(topic)

    return GenerateNotesResponse(
        short_notes=[str(item) for item in short_notes],
        detailed_notes=detailed_notes,
        important_topics=important_topics
    )


def generate_condensed_notes(lecture_text: str) -> GenerateNotesResponse:
    """
    Generates a structured study guide containing short_notes, detailed_notes,
    and important_topics using the specified prompt template and Gemini 2.5 Flash.
    Retries once if JSON parsing fails.
    """
    client = get_client()

    base_prompt = f"""You are an expert academic tutor. Based on the following lecture content, 
generate a structured study guide in this exact JSON format:

{{
  "short_notes": ["bullet 1", "bullet 2", ...],
  "detailed_notes": "markdown string with ## headings, sub-bullets, and **bolded** key terms",
  "important_topics": [
    {{
      "topic": "topic name",
      "why_it_matters": "one sentence on why this is important or likely to be tested",
      "gate_style_question": "a question in the style, phrasing, and difficulty of a GATE exam question testing this specific concept"
    }}
  ]
}}

short_notes should have 5-8 ultra-condensed bullets, one line each.
important_topics should have 3-5 entries.
Return ONLY valid JSON, no markdown code fences, no explanation text.

Lecture content:
{lecture_text}"""

    last_error = None
    for attempt in range(2):
        current_prompt = base_prompt
        if attempt == 1:
            current_prompt += "\n\nCRITICAL: Return ONLY valid JSON, nothing else."

        try:
            response = client.models.generate_content(
                model=DEFAULT_MODEL,
                contents=current_prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.3,
                )
            )

            if not response.text:
                raise ValueError("Empty response received from Gemini for notes generation.")

            return parse_notes_json(response.text)
        except Exception as e:
            last_error = e
            logger.warning(f"Notes generation attempt {attempt + 1} failed: {str(e)}")
            if attempt == 0:
                continue

    raise RuntimeError(f"Failed to generate valid structured notes after retry. Details: {str(last_error)}")


def parse_hot_questions_json(raw_text: str) -> List[str]:
    """Parses and validates the JSON array for higher-order-thinking questions."""
    clean_text = _clean_json_string(raw_text)
    data = json.loads(clean_text)

    if not isinstance(data, list):
        if isinstance(data, dict):
            for key in ["questions", "hot_questions", "higher_order_questions"]:
                if key in data and isinstance(data[key], list):
                    data = data[key]
                    break
        if not isinstance(data, list):
            raise ValueError("Expected a JSON array of question strings.")

    questions = [str(q).strip() for q in data if str(q).strip()]
    if not questions:
        raise ValueError("No questions found in response.")

    return questions


def generate_hot_questions(extracted_text: str) -> List[str]:
    """
    Generates 4 higher-order-thinking (HOT) questions from lecture content.
    Retries once if parsing fails.
    """
    client = get_client()

    base_prompt = f"""Based on the following lecture content, generate 4 higher-order-thinking 
questions that go beyond recall. Each should require the student to apply, 
analyze, compare, or evaluate the concept — not just state a definition. 
Vary the type across the 4 (one "what if" scenario, one comparison, one 
application to a new context, one "why" question).

Return ONLY a JSON array of strings, no explanation, no markdown fences:
["question 1", "question 2", "question 3", "question 4"]

Lecture content:
{extracted_text}"""

    last_error = None
    for attempt in range(2):
        current_prompt = base_prompt
        if attempt == 1:
            current_prompt += "\n\nCRITICAL: Return ONLY valid JSON, nothing else."

        try:
            response = client.models.generate_content(
                model=DEFAULT_MODEL,
                contents=current_prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.4,
                )
            )

            if not response.text:
                raise ValueError("Empty response received from Gemini for hot questions generation.")

            return parse_hot_questions_json(response.text)
        except Exception as e:
            last_error = e
            logger.warning(f"HOT questions attempt {attempt + 1} failed: {str(e)}")
            if attempt == 0:
                continue

    raise RuntimeError(f"Failed to generate higher-order questions after retry. Details: {str(last_error)}")


def parse_quiz_json(raw_text: str) -> List[QuizQuestion]:
    """Parses and validates the raw JSON response for quiz questions."""
    clean_text = _clean_json_string(raw_text)
    data = json.loads(clean_text)

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
    for attempt in range(2):
        try:
            response = client.models.generate_content(
                model=DEFAULT_MODEL,
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
