# File: app/core/config.py

"""
Lightweight configuration loader
This replaces the earlier pydantic-based loader to avoid hard dependency on pydantic
so the app can start in environments where pydantic/pydantic-settings are not installed
or have incompatible versions. It reads environment variables via python-dotenv and
performs minimal validation required by the application.
"""

import os
import base64
from typing import Optional
from dataclasses import dataclass
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the backend folder (two levels up from this file)
here = Path(__file__).resolve().parent
project_root = here.parent.parent
dotenv_path = project_root / ".env"
if dotenv_path.exists():
    load_dotenv(dotenv_path)
else:
    # Fall back to default load (environment only)
    load_dotenv()


@dataclass
class Settings:
    SERVER_ENDPOINT: str = os.getenv("SERVER_ENDPOINT", "http://localhost:5000/api/certificates")
    AES_KEY_BASE64: Optional[str] = os.getenv("AES_KEY_BASE64")
    HUGGINGFACE_API_KEY: Optional[str] = os.getenv("HUGGINGFACE_API_KEY")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./encrypted_uploads")
    POST_TIMEOUT_SECONDS: int = int(os.getenv("POST_TIMEOUT_SECONDS", "30"))
    POST_RETRIES: int = int(os.getenv("POST_RETRIES", "3"))
    TESSERACT_CMD: Optional[str] = os.getenv("TESSERACT_CMD")

    AES_KEY: Optional[bytes] = None

    def __post_init__(self):
        if not self.AES_KEY_BASE64:
            raise RuntimeError("AES_KEY_BASE64 must be set in .env (base64 of 32 random bytes).")
        try:
            key_bytes = base64.b64decode(self.AES_KEY_BASE64)
        except Exception as exc:  # pragma: no cover - invalid env
            raise RuntimeError("AES_KEY_BASE64 is not valid base64.") from exc
        if len(key_bytes) != 32:
            raise RuntimeError("AES_KEY_BASE64 must decode to 32 bytes (AES-256 key).")
        self.AES_KEY = key_bytes


# Instantiate and make sure upload dir exists
settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)