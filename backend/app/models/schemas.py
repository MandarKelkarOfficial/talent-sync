# File: app/models/schemas.py

"""
Pydantic Schemas
Author: Mandar . k
Date: 2024-10-10

This module defines the Pydantic models used for API request/response validation.
"""

from pydantic import BaseModel
from typing import Optional

class VerifyRequest(BaseModel):
    """
    DEPRECATED: This was for a different flow.
    The /verify endpoint now uses multipart/form-data (File + Form).
    """
    url: Optional[str] = None
    verification_url: Optional[str] = None
    username: Optional[str] = None
