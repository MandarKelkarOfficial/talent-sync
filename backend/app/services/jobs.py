# File: app/services/jobs.py

"""
Background Job Service

Author: Mandar K.
Date: 2024-10-10
Updated: 2025-11-02

This module manages the state of processing jobs and orchestrates the
entire certificate verification flow.
"""

from datetime import datetime
from typing import Dict, Any, Optional
import json
import logging

from app.core.config import settings
from app.utils import security
from app.services import certificate_processing as cert_proc
from app.services import verification
from app.services import gemini_service

# Configure logging
logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

# In-memory store for jobs.
# WARNING: This is not persistent. If the server restarts, all jobs are lost.
# For production, this should be replaced with Redis or a database.
JOBS: Dict[str, Dict[str, Any]] = {}

def get_job_status(job_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves the sanitized status of a specific job."""
    job = JOBS.get(job_id)
    if not job:
        return None
    # Return a copy, omitting sensitive data like raw_bytes
    return {
        key: job.get(key) for key in
        ["jobId", "status", "createdAt", "startedAt", "finishedAt", "result", "error"]
    }

async def process_and_forward(job_id: str):
    """
    The main background task for processing a certificate.
    
    Flow:
    1.  Parse metadata (studentId, providedName).
    2.  Convert file (PDF/img) to a standard image.
    3.  Scan image for QR codes.
    4.  Crawl the URL from the QR code (using Playwright fallback).
    5.  Send the crawled text to Gemini for verification.
    6.  Encrypt the original file and save it.
    7.  Post the final JSON result back to the Node.js server.
    """
    job = JOBS[job_id]
    job["status"] = "processing"
    job["startedAt"] = datetime.utcnow().isoformat()

    file_bytes = job.get("raw_bytes")
    content_type = job.get("content_type")
    
    # Initialize variables
    status_result = "invalid" # Default to invalid
    gemini_analysis = None
    qr_urls = []
    crawled_text = None
    verification_url = None
    total_score = 0.0
    student_id_from_metadata = None
    
    try:
        # --- 1. Metadata Handling ---
        metadata_str = job.get("metadata", "{}")
        metadata_dict = json.loads(metadata_str)
        student_id_from_metadata = metadata_dict.get("studentId")
        student_name_for_validation = metadata_dict.get("providedName") 
        
        if not student_id_from_metadata or not student_name_for_validation:
            raise ValueError("'studentId' and 'providedName' are required in metadata.")
        
        log.info(f"✅ Starting job {job_id} for studentId: {student_id_from_metadata}, name: {student_name_for_validation}")

        # --- 2. Prepare Image ---
        certificate_image = cert_proc.get_image_from_bytes(file_bytes, content_type)
        if not certificate_image:
            raise ValueError("Could not process the uploaded file into an image.")
            
        # --- 3. Scan QR ---
        qr_urls = cert_proc.scan_qr_from_image(certificate_image)
        if not qr_urls:
            raise ValueError("No QR code or verification URL found on the certificate.")
        
        verification_url = next((url for url in qr_urls if url.startswith("http")), None)
        if not verification_url:
             raise ValueError(f"QR code data found, but it is not a valid URL: {qr_urls[0]}")

        log.info(f"Job {job_id}: Found verification URL: {verification_url}")

        # --- 4. Crawl Verification URL (with Playwright fallback) ---
        crawled_text = await verification.crawl_page_text(verification_url)
        if not crawled_text or len(crawled_text) < 20: # 20 char min to be useful
            raise ValueError(f"Failed to crawl or extract sufficient text from: {verification_url}")

        # --- 5. Get Gemini Verification ---
        log.info(f"Job {job_id}: Sending crawled text to Gemini for verification...")
        gemini_analysis = await gemini_service.verify_page_content(
            crawled_text=crawled_text,
            student_name=student_name_for_validation
        )

        # --- 6. Determine Final Status ---
        if gemini_analysis.get("is_verified"):
            status_result = "valid"
            total_score = 1.0
        else:
            status_result = "invalid"
            total_score = 0.0
        
        log.info(f"Job {job_id}: Gemini verification result: {status_result}")

    except Exception as e:
        log.error(f"❌ Job {job_id} failed during processing: {e}", exc_info=True)
        job["status"] = "failed"
        job["error"] = str(e)
        status_result = "invalid"
        total_score = 0.0
    
    # --- 7. Encrypt, Hash, and Prepare Payload (Always run) ---
    blob_hash = security.sha256_hex(file_bytes)
    encrypted_data = security.encrypt_aes_gcm(file_bytes)
    save_path = cert_proc.save_encrypted_blob_file(
        job_id, encrypted_data["nonce_b64"], encrypted_data["ciphertext_b64"], job.get("filename")
    )
    
    payload = {
        "jobId": job_id,
        "userid": student_id_from_metadata, # Use the ID from metadata
        "filename": job.get("filename"),
        "contentType": content_type,
        "source": job.get("source"),
        "extracted": {
            "text_snippet": (crawled_text or "Crawl failed")[:500],
            "issuer": {"name": gemini_analysis.get("issuer") if gemini_analysis else "Unknown"},
            "qr_urls": qr_urls,
        },
        "verification": {
            "status": status_result,
            "confidence": total_score,
            "ai_analysis": gemini_analysis, # Include the full Gemini reasoning
            "page_verification": {
                "ok": status_result == "valid",
                "score": total_score,
                "evidence": {
                    "url": verification_url,
                    "matched_name": gemini_analysis.get("name_found") if gemini_analysis else None,
                    "error": job.get("error") # Will be null if no error
                }
            },
            "checkedAt": datetime.utcnow().isoformat()
        },
        "encrypted_blob_path": save_path,
        "blob_hash_sha256": blob_hash,
    }

    # --- 8. Forward to Downstream Server ---
    log.info(f"Forwarding final payload for job {job_id} to {settings.SERVER_ENDPOINT}")
    post_resp = await verification.post_to_server(payload)
    
    if job["status"] != "failed": # If processing didn't fail
        job["status"] = "done" if post_resp.get("ok") else "forward_failed"
        if not post_resp.get("ok"):
            job["error"] = f"Failed to post result to server: {post_resp.get('error')}"
    
    job["result"] = post_resp
    job["finishedAt"] = datetime.utcnow().isoformat()
    log.info(f"✅ Job {job_id} finished with final status: {job['status']}")

