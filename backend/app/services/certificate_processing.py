# # File: app/services/certificate_processing.py

# """
# Certificate Processing Service
# Author: Mandar . k
# Date: 2024-10-10

# This module provides functions for extracting data from certificate files (PDFs, images).
# This includes text extraction, OCR, QR code scanning, and heuristic analysis.
# """
# import io
# import os
# import re
# from typing import Optional, List, Dict, Any
# from PIL import Image
# import pytesseract
# from pyzbar.pyzbar import decode as qr_decode
# from pypdf import PdfReader
# from pdf2image import convert_from_bytes
# from app.core.config import settings

# # Configure Tesseract command if specified in settings
# if settings.TESSERACT_CMD:
#     pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD

# # --- Constants ---
# KNOWN_ISSUERS = [
#     ("coursera", "coursera.org"),
#     ("udemy", "udemy.com"),
#     ("accredible", "accredible.com"),
#     ("credly", "credly.com"),
#     ("edx", "edx.org"),
# ]

# # --- Helper Functions ---
# def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
#     """Extracts text content directly from a PDF file's bytes."""
#     try:
#         reader = PdfReader(io.BytesIO(pdf_bytes))
#         return "\n".join(page.extract_text() or "" for page in reader.pages).strip()
#     except Exception:
#         return ""

# def images_from_pdf_bytes(pdf_bytes: bytes, max_pages: int = 2) -> List[Image.Image]:
#     """Converts the first few pages of a PDF into PIL Image objects."""
#     try:
#         return convert_from_bytes(pdf_bytes, first_page=1, last_page=max_pages)
#     except Exception:
#         return []

# def ocr_image(pil_img: Image.Image) -> str:
#     """Performs Optical Character Recognition (OCR) on a PIL Image."""
#     try:
#         return pytesseract.image_to_string(pil_img) or ""
#     except Exception:
#         return ""

# def scan_qr_from_image(pil_img: Image.Image) -> List[str]:
#     """Scans a PIL image for QR codes and returns their decoded data."""
#     try:
#         decoded = qr_decode(pil_img)
#         return [d.data.decode("utf-8", errors="ignore") for d in decoded]
#     except Exception:
#         return []

# def scan_qr_from_bytes(file_bytes: bytes, content_type: str) -> List[str]:
#     """Scans a file (PDF or image) from bytes for any QR codes."""
#     try:
#         if "pdf" in content_type:
#             images = images_from_pdf_bytes(file_bytes, max_pages=2)
#             all_urls = []
#             for img in images:
#                 all_urls.extend(scan_qr_from_image(img))
#             return all_urls
#         else:
#             img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
#             return scan_qr_from_image(img)
#     except Exception:
#         return []

# def detect_issuer_from_text(text: str, qr_urls: List[str]) -> Optional[Dict[str, str]]:
#     """Detects a known certificate issuer from text content or QR URLs."""
#     lower_text = (text or "").lower()
#     all_content = lower_text + " ".join(qr_urls)
    
#     for name, domain in KNOWN_ISSUERS:
#         if name in all_content or domain in all_content:
#             return {"name": name, "domain": domain}
#     return None

# def name_matches_authenticated(username: str, extracted_text: str) -> bool:
#     """Checks if the authenticated username appears in the extracted text."""
#     if not username or not extracted_text:
#         return False
        
#     user_tokens = [t for t in re.split(r'\W+', username.strip().lower()) if len(t) > 2]
#     if not user_tokens:
#         return False
        
#     text_lower = extracted_text.lower()
#     matches = sum(1 for token in user_tokens if token in text_lower)
    
#     # Require at least 2 name parts to match, or 1 if it's a single name
#     return matches >= 2 if len(user_tokens) >= 2 else matches >= 1

# def heuristics_score(text: str, issuer: Optional[Dict], qr_urls: List[str]) -> Dict[str, Any]:
#     """Calculates a confidence score based on heuristics found in the file."""
#     score = 0.0
#     methods = []
#     evidence = []
    
#     if issuer:
#         score += 0.25
#         methods.append("issuer-detected")
#         evidence.append({"issuer": issuer})
#     if re.search(r"certificate id|credential id|cert id", (text or "").lower()):
#         score += 0.20
#         methods.append("has-cert-id-label")
#     if re.search(r"\b(20\d{2})\b", (text or "")): # Finds a 4-digit year
#         score += 0.10
#         methods.append("has-year")
#     if qr_urls:
#         score += 0.20
#         methods.append("has-qr")
#         evidence.append({"qr_urls": qr_urls})
        
#     return {"score": min(score, 1.0), "methods": methods, "evidence": evidence}

# def save_encrypted_blob_file(job_id: str, nonce_b64: str, ciphertext_b64: str, filename_hint: Optional[str] = None) -> str:
#     """Saves the encrypted file content to disk."""
#     safe_hint = "".join(c for c in (filename_hint or "") if c.isalnum() or c in "._-")[:60]
#     fname = f"{job_id}_{safe_hint}.enc" if safe_hint else f"{job_id}.enc"
#     path = os.path.join(settings.UPLOAD_DIR, fname)
    
#     with open(path, "w", encoding="utf-8") as f:
#         f.write(f"{nonce_b64}\n{ciphertext_b64}")
        
#     return path


# File: app/services/certificate_processing.py

"""
Certificate Processing Service
Author: Mandar K.
Date: 2024-10-10
Updated: 2025-09-15

This module provides functions for preparing certificate files for AI analysis,
such as converting PDFs to images and scanning for QR codes.
"""
import io
import re
from typing import List, Dict, Optional, Any
from PIL import Image
from pyzbar.pyzbar import decode as qr_decode
from pdf2image import convert_from_bytes

# --- Constants ---
# Expanded list of known issuers to improve detection
KNOWN_ISSUERS = [
    ("coursera", "coursera.org"),
    ("udemy", "udemy.com"),
    ("accredible", "accredible.com"),
    ("credly", "credly.com"),
    ("edx", "edx.org"),
    ("ibm", "ibm.com"),
    ("cisco", "cisco.com"),
    ("wadhwani", "wadhwani.foundation"),
    ("skillvertex", "skillvertex.com"),
    ("microsoft", "microsoft.com"),
    ("google", "google.com"),
    ("aws", "amazon.com")
]

def get_image_from_bytes(file_bytes: bytes, content_type: str) -> Optional[Image.Image]:
    """
    Converts file bytes (PDF or image) into a single PIL Image object.
    For PDFs, it uses the first page.
    """
    try:
        if "pdf" in content_type:
            images = convert_from_bytes(file_bytes, first_page=1, last_page=1)
            return images[0] if images else None
        else:
            return Image.open(io.BytesIO(file_bytes)).convert("RGB")
    except Exception as e:
        print(f"Error converting file to image: {e}")
        return None

def scan_qr_from_image(pil_img: Image.Image) -> List[str]:
    """Scans a PIL image for QR codes and returns their decoded data."""
    try:
        decoded = qr_decode(pil_img)
        return [d.data.decode("utf-8", errors="ignore") for d in decoded]
    except Exception:
        return []

def detect_issuer_from_text(text: str, qr_urls: List[str]) -> Optional[Dict[str, str]]:
    """Detects a known certificate issuer from text content or QR URLs."""
    lower_text = (text or "").lower()
    all_content = lower_text + " ".join(qr_urls)
    
    for name, domain in KNOWN_ISSUERS:
        if name in all_content or domain in all_content:
            return {"name": name, "domain": domain}
    return None

def name_matches_authenticated(username: str, extracted_text: str) -> bool:
    """Checks if the authenticated username appears in the extracted text."""
    if not username or not extracted_text:
        return False
        
    user_tokens = [t for t in re.split(r'\W+', username.strip().lower()) if len(t) > 2]
    if not user_tokens:
        return False
        
    text_lower = extracted_text.lower()
    matches = sum(1 for token in user_tokens if token in text_lower)
    
    return matches >= 2 if len(user_tokens) >= 2 else matches >= 1

