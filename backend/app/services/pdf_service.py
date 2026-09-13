import re
import pymupdf  # PyMuPDF
from typing import Tuple

def clean_extracted_text(text: str) -> str:
    """
    Clean extracted text by removing page numbers, common header/footer artifacts,
    and normalizing whitespace.
    """
    lines = text.splitlines()
    cleaned_lines = []
    
    page_num_patterns = [
        re.compile(r"^\s*page\s+\d+(\s+of\s+\d+)?\s*$", re.IGNORECASE),
        re.compile(r"^\s*-\s*\d+\s*-\s*$"),
        re.compile(r"^\s*\d+\s*$"),
    ]

    for line in lines:
        stripped = line.strip()
        if not stripped:
            cleaned_lines.append("")
            continue
        
        # Check if line is just a page number
        is_page_number = any(pat.match(stripped) for pat in page_num_patterns)
        if is_page_number:
            continue
            
        cleaned_lines.append(stripped)

    # Join and collapse multiple consecutive empty lines
    full_text = "\n".join(cleaned_lines)
    full_text = re.sub(r"\n{3,}", "\n\n", full_text).strip()
    return full_text


def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> Tuple[str, int]:
    """
    Extracts and cleans text from PDF byte content using PyMuPDF.
    Returns (cleaned_text, total_pages).
    """
    if not pdf_bytes:
        raise ValueError("Uploaded PDF file is empty.")

    doc = pymupdf.open(stream=pdf_bytes, filetype="pdf")
    total_pages = len(doc)

    if total_pages == 0:
        raise ValueError("PDF document contains no pages.")

    extracted_pages = []
    for page_idx in range(total_pages):
        page = doc[page_idx]
        page_text = page.get_text("text")
        if page_text:
            extracted_pages.append(page_text)

    doc.close()

    raw_combined = "\n\n".join(extracted_pages)
    cleaned = clean_extracted_text(raw_combined)

    if not cleaned or len(cleaned) < 10:
        raise ValueError(
            "This PDF appears to be a scanned document without selectable text. "
            "Please upload a PDF with actual text content, or wait for OCR support in a future version."
        )

    return cleaned, total_pages
