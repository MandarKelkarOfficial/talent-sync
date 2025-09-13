# File: app/core/config.py

"""
Configuration Management
Author: Maddy (Originally by Gemini)

This module handles the loading and validation of environment variables
for the application using Pydantic's BaseSettings.
"""

import os
import base64
from pydantic import BaseSettings, validator

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    """
    SERVER_ENDPOINT: str = "http://localhost:5000/api/certificates"
    AES_KEY_BASE64: str
    UPLOAD_DIR: str = "./encrypted_uploads"
    POST_TIMEOUT_SECONDS: int = 10
    POST_RETRIES: int = 3
    TESSERACT_CMD: str | None = None

    AES_KEY: bytes | None = None  # Will be derived from AES_KEY_BASE64

    @validator("AES_KEY_BASE64")
    def validate_aes_key(cls, v: str) -> str:
        """Validates that the AES key is a valid base64-encoded 32-byte string."""
        if not v:
            raise ValueError("AES_KEY_BASE64 must be set in .env (base64 of 32 random bytes).")
        try:
            key_bytes = base64.b64decode(v)
            if len(key_bytes) != 32:
                raise ValueError("AES_KEY_BASE64 must decode to 32 bytes (AES-256 key).")
            # Store the decoded bytes in the settings object for later use
            cls.AES_KEY = key_bytes
            return v
        except Exception as e:
            raise ValueError(f"AES_KEY_BASE64 is not valid: {e}") from e

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Create a single settings instance to be used across the application
settings = Settings()

# Ensure the upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)