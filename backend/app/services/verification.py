# File: app/services/verification.py

# """
# External Verification Service

# Author: Mandar . k
# Date: 2024-10-10

# This module contains functions for performing verifications that require
# external network calls, such as checking QR code links, parsing verification
# pages, and posting the final results to a downstream server.
# """
# import httpx
# import asyncio
# import re
# from typing import List, Dict, Any, Optional
# from bs4 import BeautifulSoup
# from app.core.config import settings

# async def verify_verification_page(page_url: str, expected_username: Optional[str]) -> Dict[str, Any]:
#     """
#     Scrapes and analyzes a verification URL (e.g., from Coursera) for evidence.

#     :param page_url: The URL of the verification page to check.
#     :param expected_username: The name of the user to look for on the page.
#     :return: A dictionary with the verification result.
#     """
#     evidence: Dict[str, Any] = {"url": page_url}
#     try:
#         async with httpx.AsyncClient(timeout=settings.POST_TIMEOUT_SECONDS, follow_redirects=True) as client:
#             r = await client.get(page_url)
#             if r.status_code != 200:
#                 evidence["status_code"] = r.status_code
#                 return {"ok": False, "score": 0.0, "methods": [], "evidence": evidence}

#             soup = BeautifulSoup(r.text, "html.parser")
#             page_text_low = soup.get_text(separator=" ").lower()

#             # --- Heuristics ---
#             keywords = ["verify", "verified", "certificate", "credential", "valid"]
#             has_keywords = any(k in page_text_low for k in keywords)
#             matched_name = False
#             if expected_username:
#                 simple_name = expected_username.strip().lower()
#                 matched_name = simple_name and simple_name in page_text_low
            
#             score, methods = 0.0, []
#             if has_keywords:
#                 score += 0.50
#                 methods.append("verification-page-keywords")
#             if matched_name:
#                 score += 0.50
#                 methods.append("name-on-verification-page")

#             evidence.update({
#                 "status_code": r.status_code,
#                 "matched_name": matched_name,
#                 "has_keywords": has_keywords,
#                 "text_snippet": page_text_low[:800]
#             })

#             return {"ok": score >= 0.5, "score": min(score, 1.0), "methods": methods, "evidence": evidence}
#     except Exception as e:
#         return {"ok": False, "score": 0.0, "methods": [], "evidence": {"error": str(e), "url": page_url}}


# async def verify_via_qr_or_link(qr_urls: List[str], extracted_text: str) -> Dict[str, Any]:
#     """
#     Iterates through QR code URLs and checks them for verification evidence.

#     :param qr_urls: A list of URLs found in QR codes.
#     :param extracted_text: The text extracted from the certificate file.
#     :return: A dictionary with the best verification result found.
#     """
#     for url in qr_urls:
#         if not (url.startswith("http://") or url.startswith("https://")):
#             continue
#         # For simplicity, we can reuse the more robust verification page logic
#         result = await verify_verification_page(url, extracted_text)
#         if result.get("ok"):
#             return result # Return the first successful verification
            
#     return {"ok": False, "score": 0.0, "methods": [], "evidence": None}


# async def post_to_server(payload: Dict[str, Any]) -> Dict[str, Any]:
#     """
#     Posts the final processed payload to the configured server endpoint with retries.

#     :param payload: The JSON payload to send.
#     :return: A dictionary indicating the outcome of the POST request.
#     """
#     async with httpx.AsyncClient(timeout=settings.POST_TIMEOUT_SECONDS) as client:
#         last_exc = None
#         for attempt in range(settings.POST_RETRIES):
#             try:
#                 r = await client.post(settings.SERVER_ENDPOINT, json=payload, timeout=settings.POST_TIMEOUT_SECONDS)
#                 r.raise_for_status() # Raise exception for 4xx/5xx responses
#                 return {"ok": True, "status_code": r.status_code, "response_text": r.text}
#             except Exception as e:
#                 last_exc = e
#                 await asyncio.sleep(1) # Wait before retrying
#     return {"ok": False, "error": str(last_exc)}


# File: app/services/verification.py

"""
External Verification Service

Author: Mandar . k
Date: 2024-10-10
Updated: 2025-09-14

This module contains functions for performing verifications that require
external network calls, such as checking QR code links, parsing verification
pages, and posting the final results to a downstream server.
"""
import httpx
import asyncio
import re
from typing import List, Dict, Any, Optional
from bs4 import BeautifulSoup
from app.core.config import settings

async def verify_verification_page(page_url: str, expected_username: Optional[str]) -> Dict[str, Any]:
    """
    Scrapes and analyzes a verification URL (e.g., from a QR code) for evidence of validity.

    This function visits the given URL, extracts its text content, and then applies
    a series of checks to determine if the page validates the certificate.

    Args:
        page_url: The URL of the verification page to check.
        expected_username: The name of the user to look for on the page.

    Returns:
        A dictionary containing the verification result, including a boolean `ok` flag,
        a confidence `score`, and the `evidence` found.
    """
    evidence: Dict[str, Any] = {"url": page_url, "status_code": None, "matched_name": False, "has_keywords": False}
    try:
        async with httpx.AsyncClient(timeout=settings.POST_TIMEOUT_SECONDS, follow_redirects=True) as client:
            r = await client.get(page_url)
            evidence["status_code"] = r.status_code
            r.raise_for_status() # Raise an exception for non-2xx status codes

            soup = BeautifulSoup(r.text, "html.parser")
            page_text_low = soup.get_text(separator=" ").lower()
            evidence["text_snippet"] = page_text_low[:800]

            # --- Heuristic Checks ---
            score = 0.0
            methods = []

            # 1. Check for verification-related keywords
            keywords = ["verify", "verified", "certificate", "credential", "valid", "issued to", "completed"]
            if any(k in page_text_low for k in keywords):
                score += 0.50
                methods.append("verification-page-keywords")
                evidence["has_keywords"] = True

            # 2. Check for the user's name on the page
            if expected_username:
                # Normalize and split the name to check for partial matches (e.g., first and last name)
                name_tokens = [token for token in re.split(r'\W+', expected_username.lower()) if len(token) > 2]
                matches = sum(1 for token in name_tokens if token in page_text_low)
                
                # Require at least two name parts to match for a confident result
                if matches >= 2:
                    score += 0.50
                    methods.append("name-on-verification-page")
                    evidence["matched_name"] = True

            return {"ok": score >= 0.75, "score": min(score, 1.0), "methods": methods, "evidence": evidence}

    except httpx.RequestError as e:
        evidence["error"] = f"Network error fetching URL: {str(e)}"
        return {"ok": False, "score": 0.0, "methods": [], "evidence": evidence}
    except Exception as e:
        evidence["error"] = f"An unexpected error occurred during page verification: {str(e)}"
        return {"ok": False, "score": 0.0, "methods": [], "evidence": evidence}


async def verify_via_qr_or_link(qr_urls: List[str], extracted_text: str, student_name: str) -> Dict[str, Any]:
    """
    Iterates through QR code URLs and uses the most reliable one for verification.

    Args:
        qr_urls: A list of URLs found in QR codes.
        extracted_text: The text extracted from the certificate file (used as a fallback for name matching).
        student_name: The name of the student for validation.

    Returns:
        A dictionary with the best verification result found.
    """
    if not qr_urls:
        return {"ok": False, "score": 0.0, "methods": [], "evidence": None}

    # Attempt to verify each URL found and return the first successful one
    for url in qr_urls:
        if not (url.startswith("http://") or url.startswith("https://")):
            continue
        
        # Pass the student's name for a more reliable check
        result = await verify_verification_page(url, student_name or extracted_text)
        if result.get("ok"):
            return result
            
    # If no URL yields a positive verification, return a default failure response
    return {"ok": False, "score": 0.0, "methods": [], "evidence": {"checked_urls": qr_urls}}


async def post_to_server(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Posts the final processed payload to the configured server endpoint with retries.

    Args:
        payload: The JSON payload to send.

    Returns:
        A dictionary indicating the outcome of the POST request.
    """
    async with httpx.AsyncClient(timeout=settings.POST_TIMEOUT_SECONDS) as client:
        last_exc = None
        for attempt in range(settings.POST_RETRIES):
            try:
                r = await client.post(settings.SERVER_ENDPOINT, json=payload, timeout=settings.POST_TIMEOUT_SECONDS)
                r.raise_for_status()
                return {"ok": True, "status_code": r.status_code, "response_text": r.text}
            except Exception as e:
                last_exc = e
                await asyncio.sleep(1) # Wait 1 second before retrying
    return {"ok": False, "error": str(last_exc)}
