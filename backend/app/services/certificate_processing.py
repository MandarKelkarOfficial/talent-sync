# File: app/services/certificate_processing.py

"""
Certificate Processing Service
Author: Mandar K.
Date: 2024-10-10
Updated: 2025-11-02

This module provides functions for preparing certificate files for AI analysis,
such as converting PDFs to images and scanning for QR codes.
"""
import io
import re
import os
import logging
from typing import List, Optional
from PIL import Image
from pyzbar.pyzbar import decode as qr_decode
from pdf2image import convert_from_bytes
from app.core.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)


def get_image_from_bytes(file_bytes: bytes, content_type: str) -> Optional[Image.Image]:
    """
    Converts file bytes (PDF or image) into a single PIL Image object.
    For PDFs, it uses the first page.
    """
    log.info(f"Converting file of type {content_type} to image.")
    try:
        if "pdf" in content_type:
            # Use poppler-utils to convert PDF from bytes
            images = convert_from_bytes(file_bytes, first_page=1, last_page=1)
            if images:
                log.info("PDF converted to image successfully.")
                return images[0]
            else:
                log.warning("pdf2image returned no images for the file.")
                return None
        else:
            # Handle standard image formats
            img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
            log.info("Image file loaded successfully.")
            return img
    except Exception as e:
        log.error(f"Error converting file to image: {e}", exc_info=True)
        return None

def scan_qr_from_image(pil_img: Image.Image) -> List[str]:
    """Scans a PIL image for QR codes and returns their decoded data."""
    try:
        decoded_qrs = qr_decode(pil_img)
        if decoded_qrs:
            urls = [d.data.decode("utf-8", errors="ignore") for d in decoded_qrs]
            log.info(f"Found {len(urls)} QR codes: {urls}")
            return urls
        else:
            log.warning("No QR codes found in the image.")
            return []
    except Exception as e:
        log.error(f"Error during QR code scanning: {e}", exc_info=True)
        return []

def save_encrypted_blob_file(job_id: str, nonce_b64: str, ciphertext_b64: str, filename_hint: Optional[str] = None) -> str:
    """
    Saves the encrypted file content (nonce and ciphertext) to disk.
    
    Args:
        job_id: The unique job ID.
        nonce_b64: Base64 encoded nonce.
        ciphertext_b64: Base64 encoded ciphertext.
        filename_hint: The original filename, used to make the saved file more readable.

    Returns:
        The path to the saved file.
    """
    try:
        # Clean the filename hint to prevent path traversal
        safe_hint = "".join(c for c in (filename_hint or "") if c.isalnum() or c in "._-")[:60]
        fname = f"{job_id}_{safe_hint}.enc" if safe_hint else f"{job_id}.enc"
        path = os.path.join(settings.UPLOAD_DIR, fname)
        
        # Save as text, with nonce on the first line and ciphertext on the second
        with open(path, "w", encoding="utf-8") as f:
            f.write(f"{nonce_b64}\n{ciphertext_b64}")
            
        log.info(f"Saved encrypted blob to {path}")
        return path
    except Exception as e:
        log.error(f"Failed to save encrypted blob file: {e}", exc_info=True)
        return ""

