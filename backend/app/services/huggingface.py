# File: app/services/huggingface.py

"""
Hugging Face AI Service

Author: Mandar K.
Date: 2025-09-15

This module encapsulates all interactions with the Hugging Face Inference API,
including text extraction from images and AI-powered verification analysis.
"""
import httpx
import io
import json
import re
from PIL import Image
from typing import Dict, Any, Optional

from app.core.config import settings

# --- Model Endpoints ---
# CORRECTED: Switched to a smaller, more reliably available OCR model to fix the 404 error.
OCR_MODEL_URL = "https://api-inference.huggingface.co/models/microsoft/trocr-small-printed"
VERIFICATION_MODEL_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"

async def extract_text_from_image(pil_image: Image.Image) -> Optional[str]:
    """
    Uses a Hugging Face OCR model to extract text from a certificate image.

    Args:
        pil_image: A PIL Image object of the certificate.

    Returns:
        The extracted text as a single string, or None if it fails.
    """
    if not pil_image:
        return None

    img_byte_arr = io.BytesIO()
    # Convert image to PNG for consistency, as it's a lossless format
    pil_image.save(img_byte_arr, format='PNG')
    image_bytes = img_byte_arr.getvalue()

    headers = {"Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}"}
    
    try:
        # Increased timeout to give the model more time to load if it's cold
        async with httpx.AsyncClient(timeout=45.0) as client:
            response = await client.post(OCR_MODEL_URL, headers=headers, data=image_bytes)
            response.raise_for_status()
            result = response.json()
            if result and isinstance(result, list) and 'generated_text' in result[0]:
                print(f"✅ AI OCR successfully extracted text.")
                return result[0]['generated_text']
        print(" OCR model returned an unexpected response format.")
        return None
    except httpx.HTTPStatusError as e:
        print(f"❌ Hugging Face OCR HTTP Error: {e.response.status_code} - {e.response.text}")
        return None
    except Exception as e:
        print(f"❌ Hugging Face OCR General Error: {e}")
        return None

async def get_ai_verification(text: str, qr_url: Optional[str], student_name: str) -> Dict[str, Any]:
    """
    Asks a Hugging Face LLM to verify the certificate based on its content.

    Args:
        text: The text extracted from the certificate.
        qr_url: The verification URL from a QR code, if present.
        student_name: The expected name of the certificate holder.

    Returns:
        A dictionary containing the AI's structured analysis.
    """
    prompt = f"""
    You are an expert certificate verifier. Your task is to determine if a digital certificate is authentic and belongs to the specified recipient based on the evidence provided.

    **CRITICAL INSTRUCTIONS:**
    1.  **Analyze Evidence**: Review the `RECIPIENT_NAME`, `VERIFICATION_URL`, and `CERTIFICATE_TEXT`.
    2.  **URL is Strongest Proof**: If a plausible, non-generic `VERIFICATION_URL` (like from coursera.org, udemy.com, credly.com) is present, the certificate is very likely authentic. This is your most important signal.
    3.  **Name Match**: Confirm that the `RECIPIENT_NAME` (or a very close variation, like including a middle name or initial) is clearly written in the `CERTIFICATE_TEXT`.
    4.  **Content Analysis**: The text should contain common certificate phrases like "successfully completed," "is awarded to," "for participation in," etc.
    5.  **Final Judgment**: Make a final decision. A valid URL plus a name match is a definite "valid". A name match without a URL is "suspicious". No name match is "invalid".

    **EVIDENCE:**
    -   `RECIPIENT_NAME`: "{student_name}"
    -   `VERIFICATION_URL`: "{qr_url if qr_url else 'Not Present'}"
    -   `CERTIFICATE_TEXT`: "{text}"

    **RESPONSE FORMAT:**
    You MUST provide your response ONLY as a single, valid JSON object with the following structure. Do not add any text before or after the JSON block.

    {{
      "is_valid": boolean,
      "confidence_score": number (from 0.0 to 1.0, where 1.0 is highest confidence),
      "reasoning": "A brief, one-sentence explanation for your decision, citing the strongest evidence.",
      "matched_name": "The full name found in the text that matches the recipient, or null if not found.",
      "issuer": "The name of the issuing organization found, or null if not found."
    }}
    """

    headers = {"Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}"}
    payload = {"inputs": prompt, "parameters": {"max_new_tokens": 300, "temperature": 0.1, "return_full_text": False}}

    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            response = await client.post(VERIFICATION_MODEL_URL, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
            if result and isinstance(result, list) and 'generated_text' in result[0]:
                generated_text = result[0]['generated_text']
                # Clean the output to find the JSON blob
                json_str_match = re.search(r'\{.*\}', generated_text, re.DOTALL)
                if json_str_match:
                    print("✅ AI Verifier returned a valid JSON response.")
                    return json.loads(json_str_match.group(0))
        print("❌ AI Verifier returned an unexpected response format.")
        return {"is_valid": False, "confidence_score": 0.1, "reasoning": "Failed to get a valid JSON response from the AI model."}
    except httpx.HTTPStatusError as e:
        print(f"❌ Hugging Face Verification HTTP Error: {e.response.status_code} - {e.response.text}")
        return {"is_valid": False, "confidence_score": 0.0, "reasoning": f"AI analysis failed with HTTP status {e.response.status_code}."}
    except Exception as e:
        print(f"❌ Hugging Face Verification General Error: {e}")
        return {"is_valid": False, "confidence_score": 0.0, "reasoning": f"An error occurred during AI analysis: {str(e)}"}

