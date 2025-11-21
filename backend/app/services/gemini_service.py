# File: app/services/gemini_service.py

"""
Gemini AI Service

Author: Mandar K.
Date: 2025-11-02

This module encapsulates all interactions with the Google Gemini API
for verification and analysis.
"""

import httpx
import json
import re
import logging
from typing import Dict, Any
from app.core.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

# The Gemini Flash model for this task
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key="
API_KEY = settings.GEMINI_API_KEY

# A reusable httpx client
client = httpx.AsyncClient(timeout=settings.POST_TIMEOUT_SECONDS)

async def verify_page_content(crawled_text: str, student_name: str) -> Dict[str, Any]:
    """
    Uses the Gemini API to verify if a student's name is on a crawled webpage.

    Args:
        crawled_text: The raw text content from the verification webpage.
        student_name: The name of the student to look for.

    Returns:
        A dictionary with the verification result from Gemini.
    """
    
    # Clean up text to reduce token count
    crawled_text_clean = re.sub(r'\s+', ' ', crawled_text)
    if len(crawled_text_clean) > 20000: # Truncate if excessively long
        log.warning(f"Truncating crawled text from {len(crawled_text_clean)} to 20000 chars.")
        crawled_text_clean = crawled_text_clean[:20000]

    prompt = f"""
    You are an expert certificate verifier. Your task is to determine if a digital certificate,
    represented by the following webpage text, is valid and belongs to the specified recipient.

    **CRITICAL INSTRUCTIONS:**
    1.  Analyze the `WEBPAGE_TEXT` provided.
    2.  Search for the `RECIPIENT_NAME` (or a very close match) within the text.
    3.  Confirm that the name is associated with a completed certificate, course, or achievement
        (e.g., "is awarded to", "has completed", "Certificate of Completion", "Mandar Kelkar completed...").
    4.  Respond *only* with a single, valid JSON object in the exact format specified below.
        Do not add any text or markdown formatting before or after the JSON.

    **EVIDENCE:**
    -   `RECIPIENT_NAME`: "{student_name}"
    -   `WEBPAGE_TEXT`: "{crawled_text_clean}"

    **STRICT OUTPUT FORMAT (JSON ONLY):**
    {{
      "is_verified": boolean,
      "reasoning": "A brief, one-sentence explanation for your decision.",
      "name_found": "The exact name you found in the text, or null if no match."
    }}
    """
    
    log.info(f"--- GEMINI PROMPT (Truncated) --- \n{prompt[:500]}...\n--- END GEMINI PROMPT ---")

    if not API_KEY:
        log.error("GEMINI_API_KEY is not set. Verification will fail.")
        return {"is_verified": False, "reasoning": "Server configuration error: GEMINI_API_KEY is not set.", "name_found": None}

    api_url_with_key = f"{GEMINI_API_URL}{API_KEY}"

    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": {
                "type": "OBJECT",
                "properties": {
                    "is_verified": {"type": "BOOLEAN"},
                    "reasoning": {"type": "STRING"},
                    "name_found": {"type": "STRING", "nullable": True}
                }
            }
        }
    }

    try:
        response = await client.post(api_url_with_key, json=payload)
        
        if response.status_code != 200:
            # Trigger the exception handler for fallback logic
            raise Exception(f"Gemini API status {response.status_code}: {response.text}")

        result = response.json()
        json_text = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "{}")
        log.info(f"--- GEMINI RAW RESPONSE (to be parsed) ---\n{json_text}\n--- END GEMINI RAW RESPONSE ---")
        
        parsed_json = json.loads(json_text)
        log.info(f"--- GEMINI PARSED RESPONSE ---\n{parsed_json}\n--- END GEMINI PARSED RESPONSE ---")
        
        return parsed_json

    except Exception as e:
        log.error(f"Gemini API request failed or timed out: {e}")
        
        # --- FALLBACK VERIFICATION LOGIC ---
        # If Gemini fails (timeout, network error, etc.), check the text manually.
        log.info("Attempting fallback verification (Name check in crawled text)...")
        
        normalized_text = crawled_text.lower()
        student_name_clean = student_name.strip().lower()
        name_parts = student_name_clean.split()
        
        # Strategy 1: Exact full name match
        name_found = False
        if student_name_clean in normalized_text:
            name_found = True
        # Strategy 2: First and Last name match (for cases like "Mandar Rajendra Kelkar" vs "Mandar Kelkar")
        elif len(name_parts) > 1 and name_parts[0] in normalized_text and name_parts[-1] in normalized_text:
            name_found = True
            
        if name_found:
            log.info(f"Fallback successful: Found '{student_name}' (or parts) in text.")
            return {
                "is_verified": True,
                "reasoning": f"AI Verification failed ({str(e)}), but the student name '{student_name}' was manually found in the certificate page text.",
                "name_found": student_name,
                "error": str(e)
            }
        else:
            log.warning("Fallback failed: Name not found in text.")
            return {
                "is_verified": False,
                "reasoning": f"AI Verification failed: {e}. Manual fallback also failed to find name '{student_name}' in text.",
                "name_found": None,
                "error": str(e)
            }