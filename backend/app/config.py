import os
from pathlib import Path
from dotenv import load_dotenv

# Search for .env in current working directory and parent directories
BASE_DIR = Path(__file__).resolve().parent.parent.parent
env_path = BASE_DIR / ".env"

if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

def get_gemini_api_key() -> str:
    """Retrieve GEMINI_API_KEY from environment."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError(
            "GEMINI_API_KEY is not set. Please add GEMINI_API_KEY to your .env file."
        )
    return api_key
