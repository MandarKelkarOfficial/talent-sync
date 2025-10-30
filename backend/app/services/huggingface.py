# # File: app/services/huggingface.py

# """
# Hugging Face AI Service

# Author: Mandar K.
# Date: 2025-09-15

# This module encapsulates all interactions with the Hugging Face Inference API,
# including text extraction from images and AI-powered verification analysis.
# """
# import httpx
# import io
# import json
# import re
# from PIL import Image
# from typing import Dict, Any, Optional, List

# from app.core.config import settings
# from app.services.model_loader import get_best_available_model, MODELS_TO_MONITOR # <-- IMPORT from new service

# # The verification model is generally reliable and doesn't need warming.
# VERIFICATION_MODEL_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"

# async def extract_text_from_image(pil_image: Image.Image) -> Optional[str]:
#     """
#     Uses a Hugging Face OCR model to extract text from a certificate image.
#     It intelligently tries the best 'AWAKE' model first, then falls back to trying all models.

#     Args:
#         pil_image: A PIL Image object of the certificate.

#     Returns:
#         The extracted text as a single string, or None if all models fail.
#     """
#     if not pil_image:
#         return None

#     img_byte_arr = io.BytesIO()
#     pil_image.save(img_byte_arr, format='PNG')
#     image_bytes = img_byte_arr.getvalue()

#     headers = {"Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}"}
    
#     # --- INTELLIGENT SELECTION & FALLBACK LOGIC ---
#     models_to_try = []
    
#     # 1. Prioritize the best model that is already awake.
#     best_model = get_best_available_model()
#     if best_model:
#         print(f"Prioritizing 'AWAKE' model: {best_model['name']}")
#         models_to_try.append(best_model)
    
#     # 2. Add the rest of the models as fallbacks.
#     for model in MODELS_TO_MONITOR:
#         if not best_model or model["name"] != best_model["name"]:
#             models_to_try.append(model)

#     # Now, loop through the prioritized list.
#     for model in models_to_try:
#         print(f"Attempting OCR with model: {model['name']}...")
#         try:
#             async with httpx.AsyncClient(timeout=90.0) as client:
#                 response = await client.post(model['url'], headers=headers, data=image_bytes)
                
#                 if response.status_code == 200:
#                     result = response.json()
#                     if result and isinstance(result, list) and 'generated_text' in result[0]:
#                         print(f"✅ AI OCR successfully extracted text using {model['name']}.")
#                         return result[0]['generated_text']
#                     else:
#                         print(f"⚠️ Model {model['name']} gave an unexpected response: {result}")
#                         continue
                
#                 elif response.status_code >= 500 or response.status_code == 404:
#                     print(f"⚠️ Model {model['name']} is likely loading or unavailable (Status: {response.status_code}). Trying next model.")
#                     continue
                
#                 else:
#                     response.raise_for_status()

#         except httpx.HTTPStatusError as e:
#             print(f"❌ Hugging Face OCR HTTP Error for {model['name']}: {e.response.status_code} - {e.response.text}")
#             if e.response.status_code < 500 and e.response.status_code != 404:
#                 break
#         except Exception as e:
#             print(f"❌ General Error with model {model['name']}: {e}")
#             break

#     print("❌ All OCR models failed to process the image.")
#     return None

# async def get_ai_verification(text: str, qr_url: Optional[str], student_name: str) -> Dict[str, Any]:
#     """
#     Asks a Hugging Face LLM to verify the certificate based on its content.
#     """
#     prompt = f"""
#     You are an expert certificate verifier. Your task is to determine if a digital certificate is authentic and belongs to the specified recipient based on the evidence provided.

#     **CRITICAL INSTRUCTIONS:**
#     1.  **Analyze Evidence**: Review the `RECIPIENT_NAME`, `VERIFICATION_URL`, and `CERTIFICATE_TEXT`.
#     2.  **URL is Strongest Proof**: If a plausible, non-generic `VERIFICATION_URL` (like from coursera.org, udemy.com, credly.com) is present, the certificate is very likely authentic. This is your most important signal.
#     3.  **Name Match**: Confirm that the `RECIPIENT_NAME` (or a very close variation) is clearly written in the `CERTIFICATE_TEXT`.
#     4.  **Content Analysis**: The text should contain common certificate phrases like "successfully completed," "is awarded to," etc.
#     5.  **Final Judgment**: A valid URL plus a name match is "valid". A name match without a URL is "suspicious". No name match is "invalid".

#     **EVIDENCE:**
#     -   `RECIPIENT_NAME`: "{student_name}"
#     -   `VERIFICATION_URL`: "{qr_url if qr_url else 'Not Present'}"
#     -   `CERTIFICATE_TEXT`: "{text}"

#     **RESPONSE FORMAT:**
#     You MUST provide your response ONLY as a single, valid JSON object. Do not add any text before or after the JSON block.

#     {{
#       "is_valid": boolean,
#       "confidence_score": number (0.0 to 1.0),
#       "reasoning": "A brief, one-sentence explanation for your decision.",
#       "matched_name": "The full name found in the text, or null.",
#       "issuer": "The issuing organization found, or null."
#     }}
#     """

#     headers = {"Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}"}
#     payload = {"inputs": prompt, "parameters": {"max_new_tokens": 300, "temperature": 0.1, "return_full_text": False}}

#     try:
#         async with httpx.AsyncClient(timeout=60.0) as client:
#             response = await client.post(VERIFICATION_MODEL_URL, headers=headers, json=payload)
#             response.raise_for_status()
#             result = response.json()
#             if result and isinstance(result, list) and 'generated_text' in result[0]:
#                 generated_text = result[0]['generated_text']
#                 json_str_match = re.search(r'\{.*\}', generated_text, re.DOTALL)
#                 if json_str_match:
#                     print("✅ AI Verifier returned a valid JSON response.")
#                     return json.loads(json_str_match.group(0))
#         print(f"❌ AI Verifier returned an unexpected response format: {result}")
#         return {{"is_valid": False, "confidence_score": 0.1, "reasoning": "Failed to get a valid JSON response from the AI model."}}
#     except httpx.HTTPStatusError as e:
#         print(f"❌ Hugging Face Verification HTTP Error: {e.response.status_code} - {e.response.text}")
#         return {{"is_valid": False, "confidence_score": 0.0, "reasoning": f"AI analysis failed with HTTP status {e.response.status_code}."}}
#     except Exception as e:
#         print(f"❌ Hugging Face Verification General Error: {e}")
#         return {{"is_valid": False, "confidence_score": 0.0, "reasoning": f"An error occurred during AI analysis: {str(e)}"}}





"""
Hugging Face AI Service (Updated for Inference Providers API)

Author: Mandar K.
Date: 2025-10-28

This module encapsulates all interactions with the Hugging Face Inference Providers API,
including text extraction from images and AI-powered verification analysis.
"""

import os
import io
import json
import re
from typing import Dict, Any, Optional
from PIL import Image
from huggingface_hub import InferenceClient

from app.core.config import settings
from app.services.model_loader import get_best_available_model, MODELS_TO_MONITOR

# Initialize global inference client
client = InferenceClient(
    provider="hf-inference",
    api_key=settings.HUGGINGFACE_API_KEY
)

# New model endpoint reference
VERIFICATION_MODEL = "google/vit-base-patch16-224"


# ---------------------------------------------------------------------
# OCR FUNCTION (Image to Text)
# ---------------------------------------------------------------------
async def extract_text_from_image(pil_image: Image.Image) -> Optional[str]:
    """
    Uses Hugging Face OCR models to extract text from a certificate image.
    Tries the best 'awake' model first, then falls back to others if needed.
    """
    if not pil_image:
        return None

    # Convert image to bytes
    img_byte_arr = io.BytesIO()
    pil_image.save(img_byte_arr, format="PNG")
    image_bytes = img_byte_arr.getvalue()

    models_to_try = []

    best_model = get_best_available_model()
    if best_model:
        print(f"🧠 Prioritizing 'AWAKE' model: {best_model['name']}")
        models_to_try.append(best_model)

    for model in MODELS_TO_MONITOR:
        if not best_model or model["name"] != best_model["name"]:
            models_to_try.append(model)

    # Try all models one by one
    for model in models_to_try:
        print(f"🔍 Attempting OCR with: {model['name']}")

        try:
            # Use the new unified Inference Providers client
            output = client.image_to_text(
                image=image_bytes,
                model=model["name"]
            )

            if output and "generated_text" in output[0]:
                print(f"✅ OCR success with {model['name']}")
                return output[0]["generated_text"]

            print(f"⚠️ Unexpected OCR response from {model['name']}: {output}")

        except Exception as e:
            print(f"❌ Error using {model['name']}: {e}")
            continue

    print("❌ All OCR models failed.")
    return None


# ---------------------------------------------------------------------
# AI VERIFICATION FUNCTION
# ---------------------------------------------------------------------
async def get_ai_verification(text: str, qr_url: Optional[str], student_name: str) -> Dict[str, Any]:
    """
    Uses a Hugging Face LLM to verify if a certificate is authentic and belongs to the recipient.
    """

    prompt = f"""
    You are an expert certificate verifier. Your task is to determine if a digital certificate is authentic and belongs to the specified recipient based on the evidence provided.

    **CRITICAL INSTRUCTIONS:**
    1.  **Analyze Evidence**: Review `RECIPIENT_NAME`, `VERIFICATION_URL`, and `CERTIFICATE_TEXT`.
    2.  **URL is Strongest Proof**: If a plausible verification URL (like coursera.org, udemy.com, credly.com) is present, assume it's authentic.
    3.  **Name Match**: Confirm `RECIPIENT_NAME` appears in `CERTIFICATE_TEXT`.
    4.  **Content Analysis**: Look for certificate-related phrases like "successfully completed" or "is awarded to".
    5.  **Final Decision**: 
        - URL + Name match → "valid"
        - Only Name match → "suspicious"
        - No match → "invalid"

    **EVIDENCE:**
    - RECIPIENT_NAME: "{student_name}"
    - VERIFICATION_URL: "{qr_url if qr_url else 'Not Present'}"
    - CERTIFICATE_TEXT: "{text}"

    **OUTPUT FORMAT (STRICT JSON)**:
    {{
        "is_valid": boolean,
        "confidence_score": number (0.0 to 1.0),
        "reasoning": "A one-line summary.",
        "matched_name": "The name found or null.",
        "issuer": "The issuing organization or null."
    }}
    """

    try:
        response = client.text_generation(
            prompt,
            model=VERIFICATION_MODEL,
            max_new_tokens=300,
            temperature=0.1
        )

        # Extract the JSON object
        json_str_match = re.search(r"\{.*\}", response, re.DOTALL)
        if json_str_match:
            print("✅ AI Verifier returned valid JSON.")
            return json.loads(json_str_match.group(0))

        print(f"⚠️ Unexpected verification response: {response}")
        return {
            "is_valid": False,
            "confidence_score": 0.1,
            "reasoning": "Failed to parse AI model output as JSON."
        }

    except Exception as e:
        print(f"❌ Verification Error: {e}")
        return {
            "is_valid": False,
            "confidence_score": 0.0,
            "reasoning": f"Error during AI verification: {e}"
        }
