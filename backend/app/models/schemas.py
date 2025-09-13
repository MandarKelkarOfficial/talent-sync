# File: app/models/schemas.py

"""
Pydantic Schemas
Author: Maddy (Originally by Gemini)

This module defines the Pydantic models used for API request and response validation.
"""

from pydantic import BaseModel
from typing import Optional

class VerifyRequest(BaseModel):
    """
    Defines the shape of a JSON payload for the /verify endpoint.
    """
    url: Optional[str] = None          # Direct file URL (pdf/png/jpg)
    verification_url: Optional[str] = None # Issuer verification page (e.g., Coursera verify link)
    username: Optional[str] = None     # Authenticated username for matching