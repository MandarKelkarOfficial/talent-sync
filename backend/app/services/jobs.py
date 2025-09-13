# File: app/services/jobs.py

"""
Background Job Service

Author: Mandar . k
Date: 2024-10-10

This module manages the state of processing jobs. It includes the main
background task that orchestrates the entire certificate verification flow.
"""

from datetime import datetime
from typing import Dict, Any, Optional, List
import httpx

from app.core.config import settings
from app.utils import security
from app.services import certificate_processing as cert_proc
from app.services import verification

# In-memory store for jobs. In a production environment, this would be
# replaced with a persistent store like Redis or a database.
JOBS: Dict[str, Dict[str, Any]] = {}

def get_job_status(job_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves the sanitized status of a job."""
    job = JOBS.get(job_id)
    if not job:
        return None
    # Return a copy with sensitive data removed (like raw_bytes)
    return {
        key: job.get(key) for key in 
        ["jobId", "userid", "status", "createdAt", "startedAt", 
         "finishedAt", "result", "error"]
    }

async def process_and_forward(job_id: str):
    """
    The main background task for processing a certificate verification request.
    This function orchestrates file downloading, text extraction, verification,
    and forwarding the results.
    
    :param job_id: The ID of the job to process.
    """
    job = JOBS[job_id]
    job["status"] = "processing"
    job["startedAt"] = datetime.utcnow().isoformat()

    file_bytes = job.get("raw_bytes")
    content_type = job.get("content_type")
    username = job.get("userid")

    # --- Step 1: Fetch content if a URL was provided ---
    if not file_bytes and job.get("url"):
        try:
            async with httpx.AsyncClient(timeout=settings.POST_TIMEOUT_SECONDS) as client:
                resp = await client.get(job["url"])
                resp.raise_for_status()
                file_bytes = resp.content
                content_type = resp.headers.get("content-type", content_type)
        except Exception as e:
            job["status"] = "failed"
            job["error"] = f"Failed to download from URL: {str(e)}"
            return

    # --- Step 2: Handle URL-based verification (no file) ---
    page_verif: Optional[Dict[str, Any]] = None
    if job.get("verification_url"):
        page_verif = await verification.verify_verification_page(
            job["verification_url"], username
        )

    # If there's no file to process, the result is based solely on the page verification
    if not file_bytes:
        if not page_verif:
            job["status"] = "failed"
            job["error"] = "No file or valid verification URL provided."
            return
        
        # In this case, we can short-circuit and build a payload based on the URL check
        status_result = "valid" if page_verif.get("ok") else "invalid"
        # (This path could be expanded to create and forward a full payload)
        job["status"] = "done"
        job["result"] = {"verification": {"status": status_result, "page_verification": page_verif}}
        return


    # --- Step 3: Extract Data from File ---
    extracted_text = ""
    qr_urls: List[str] = []

    if "pdf" in (content_type or ""):
        extracted_text = cert_proc.extract_text_from_pdf_bytes(file_bytes)
        # If text extraction fails, fall back to OCR
        if not extracted_text.strip():
            imgs = cert_proc.images_from_pdf_bytes(file_bytes)
            ocr_texts = [cert_proc.ocr_image(im) for im in imgs]
            extracted_text = "\n".join(filter(None, ocr_texts))
    else: # Assume image
        try:
            pil_img = cert_proc.Image.open(io.BytesIO(file_bytes)).convert("RGB")
            extracted_text = cert_proc.ocr_image(pil_img)
        except Exception:
            extracted_text = ""

    qr_urls = cert_proc.scan_qr_from_bytes(file_bytes, content_type or "")

    # --- Step 4: Perform Verifications ---
    issuer = cert_proc.detect_issuer_from_text(extracted_text, qr_urls)
    heur_score = cert_proc.heuristics_score(extracted_text, issuer, qr_urls)
    qr_verif = await verification.verify_via_qr_or_link(qr_urls, extracted_text)

    # Combine scores
    total_score = min(
        heur_score.get("score", 0.0) + 
        qr_verif.get("score", 0.0) + 
        (page_verif.get("score", 0.0) if page_verif else 0.0), 
        1.0
    )

    # Determine final status
    is_verified = qr_verif.get("ok") or (page_verif and page_verif.get("ok"))
    if is_verified and total_score >= 0.8:
        status_result = "valid"
    elif total_score >= 0.75:
        status_result = "valid"
    elif total_score >= 0.5:
        status_result = "suspicious"
    else:
        status_result = "invalid"

    # --- Step 5: Validate Username Match ---
    name_in_file = cert_proc.name_matches_authenticated(username or "", extracted_text)
    name_in_page = page_verif and page_verif.get("evidence", {}).get("matched_name", False)

    if not (name_in_file or name_in_page):
        job["status"] = "rejected"
        job["result"] = {
            "status": "rejected",
            "reason": "Authenticated username not found in certificate evidence.",
            "confidence": total_score,
        }
        return

    # --- Step 6: Encrypt, Hash, and Prepare Payload ---
    blob_hash = security.sha256_hex(file_bytes)
    encrypted_data = security.encrypt_aes_gcm(file_bytes)
    save_path = cert_proc.save_encrypted_blob_file(
        job_id, encrypted_data["nonce_b64"], encrypted_data["ciphertext_b64"], job.get("filename")
    )
    
    payload = {
        "jobId": job_id,
        "userid": username,
        "filename": job.get("filename"),
        "source": job.get("source"),
        "extracted": {
            "text_snippet": (extracted_text or "")[:500],
            "issuer": issuer,
            "qr_urls": qr_urls,
        },
        "verification": {
            "status": status_result,
            "confidence": total_score,
            "heuristics": heur_score,
            "qr_verification": qr_verif,
            "page_verification": page_verif,
            "checkedAt": datetime.utcnow().isoformat()
        },
        "encrypted_blob_path": save_path,
        "blob_hash_sha256": blob_hash,
    }

    # --- Step 7: Forward to Downstream Server ---
    post_resp = await verification.post_to_server(payload)
    job["status"] = "done" if post_resp.get("ok") else "forward_failed"
    job["result"] = post_resp
    job["finishedAt"] = datetime.utcnow().isoformat()