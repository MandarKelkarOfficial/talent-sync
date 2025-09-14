# # File: app/services/jobs.py

# """
# Background Job Service

# Author: Mandar K.
# Date: 2024-10-10
# Updated: 2025-09-13

# This module manages the state of processing jobs, including the main
# background task that orchestrates the entire certificate verification flow.
# It handles everything from file processing to sending the final results
# back to the primary application server.
# """

# from datetime import datetime
# import io
# from typing import Dict, Any, Optional, List
# import json
# import httpx

# from app.core.config import settings
# from app.utils import security
# from app.services import certificate_processing as cert_proc
# from app.services import verification

# # In-memory store for jobs. In production, this should be replaced
# # with a persistent, scalable solution like Redis or a database-backed queue.
# JOBS: Dict[str, Dict[str, Any]] = {}

# def get_job_status(job_id: str) -> Optional[Dict[str, Any]]:
#     """
#     Retrieves the sanitized status of a specific job.

#     This function provides a public-facing view of a job's state,
#     omitting sensitive internal data like raw file bytes.

#     Args:
#         job_id: The unique identifier for the job.

#     Returns:
#         A dictionary containing the job's public status information,
#         or None if the job does not exist.
#     """
#     job = JOBS.get(job_id)
#     if not job:
#         return None
#     # Return a copy with sensitive data removed for security.
#     return {
#         key: job.get(key) for key in
#         ["jobId", "status", "createdAt", "startedAt", "finishedAt", "result", "error"]
#     }

# async def process_and_forward(job_id: str):
#     """
#     The main background task for processing a certificate verification request.

#     This function orchestrates the entire workflow:
#     1.  Retrieves job data.
#     2.  Parses essential metadata, including the student's ID.
#     3.  Extracts text and QR codes from the certificate file (PDF/image).
#     4.  Performs heuristic, QR, and page-based verification checks.
#     5.  Encrypts and hashes the certificate file for secure storage.
#     6.  Constructs and sends a final payload to the Node.js webhook.

#     Args:
#         job_id: The ID of the job to process from the in-memory JOBS dictionary.
#     """
#     job = JOBS[job_id]
#     job["status"] = "processing"
#     job["startedAt"] = datetime.utcnow().isoformat()

#     file_bytes = job.get("raw_bytes")
#     content_type = job.get("content_type")

#     # --- METADATA FIX ---
#     # The 'metadata' field is now received as a stringified JSON object from the Node.js server.
#     # This block safely parses it and extracts the critical studentId.
#     metadata_str = job.get("metadata", "{}")
#     student_id_from_metadata = None
#     # The name from the X-User header is still used for name-matching validation.
#     student_name_for_validation = job.get("userid")

#     try:
#         metadata_dict = json.loads(metadata_str)
#         student_id_from_metadata = metadata_dict.get("studentId")
#         print(f"✅ Successfully extracted studentId: {student_id_from_metadata} for job {job_id}")
#     except json.JSONDecodeError:
#         job["status"] = "failed"
#         job["error"] = "Fatal: Could not decode metadata JSON. Cannot proceed."
#         print(f"❌ Error decoding metadata for job {job_id}. Raw metadata: {metadata_str}")
#         # Stop processing immediately if metadata is corrupt.
#         return

#     if not student_id_from_metadata:
#         job["status"] = "failed"
#         job["error"] = "Fatal: 'studentId' not found in metadata. Cannot post result."
#         print(f"❌ Error: 'studentId' missing in metadata for job {job_id}.")
#         # Stop processing immediately if the essential studentId is missing.
#         return
#     # --- END OF FIX ---


#     # --- Step 1: Fetch content if a URL was provided (unchanged) ---
#     if not file_bytes and job.get("url"):
#         try:
#             async with httpx.AsyncClient(timeout=settings.POST_TIMEOUT_SECONDS) as client:
#                 resp = await client.get(job["url"])
#                 resp.raise_for_status()
#                 file_bytes = resp.content
#                 content_type = resp.headers.get("content-type", content_type)
#         except Exception as e:
#             job["status"] = "failed"
#             job["error"] = f"Failed to download from URL: {str(e)}"
#             return

#     # --- Step 2: Handle URL-based verification (unchanged) ---
#     page_verif: Optional[Dict[str, Any]] = None
#     if job.get("verification_url"):
#         page_verif = await verification.verify_verification_page(
#             job["verification_url"], student_name_for_validation
#         )

#     if not file_bytes:
#         if not page_verif:
#             job["status"] = "failed"; job["error"] = "No file or valid verification URL provided."
#             return
#         status_result = "valid" if page_verif.get("ok") else "invalid"
#         job["status"] = "done"; job["result"] = {"verification": {"status": status_result, "page_verification": page_verif}}
#         return

#     # --- Step 3: Extract Data from File (unchanged) ---
#     extracted_text = ""
#     qr_urls: List[str] = []

#     if "pdf" in (content_type or ""):
#         extracted_text = cert_proc.extract_text_from_pdf_bytes(file_bytes)
#         if not extracted_text.strip():
#             imgs = cert_proc.images_from_pdf_bytes(file_bytes)
#             ocr_texts = [cert_proc.ocr_image(im) for im in imgs]
#             extracted_text = "\n".join(filter(None, ocr_texts))
#     else:
#         try:
#             pil_img = cert_proc.Image.open(io.BytesIO(file_bytes)).convert("RGB")
#             extracted_text = cert_proc.ocr_image(pil_img)
#         except Exception: extracted_text = ""
#     qr_urls = cert_proc.scan_qr_from_bytes(file_bytes, content_type or "")

#     # --- Step 4: Perform Verifications & Scoring (unchanged) ---
#     issuer = cert_proc.detect_issuer_from_text(extracted_text, qr_urls)
#     heur_score = cert_proc.heuristics_score(extracted_text, issuer, qr_urls)
#     qr_verif = await verification.verify_via_qr_or_link(qr_urls, extracted_text)

#     total_score = min(heur_score.get("score", 0.0) + qr_verif.get("score", 0.0) + (page_verif.get("score", 0.0) if page_verif else 0.0), 1.0)

#     is_verified = qr_verif.get("ok") or (page_verif and page_verif.get("ok"))
#     if is_verified and total_score >= 0.8: status_result = "valid"
#     elif total_score >= 0.75: status_result = "valid"
#     elif total_score >= 0.5: status_result = "suspicious"
#     else: status_result = "invalid"

#     # --- Step 5: Validate Username Match (unchanged) ---
#     name_in_file = cert_proc.name_matches_authenticated(student_name_for_validation or "", extracted_text)
#     name_in_page = page_verif and page_verif.get("evidence", {}).get("matched_name", False)
#     if not (name_in_file or name_in_page):
#         job["status"] = "rejected"; status_result = "rejected"

#     # --- Step 6: Encrypt, Hash, and Prepare Payload ---
#     blob_hash = security.sha256_hex(file_bytes)
#     encrypted_data = security.encrypt_aes_gcm(file_bytes)
#     save_path = cert_proc.save_encrypted_blob_file(
#         job_id, encrypted_data["nonce_b64"], encrypted_data["ciphertext_b64"], job.get("filename")
#     )
    
#     payload = {
#         "jobId": job_id,
#         # --- METADATA FIX ---
#         # The 'userid' field in the final payload now correctly contains the student's ObjectId.
#         "userid": student_id_from_metadata,
#         # --- END OF FIX ---
#         "filename": job.get("filename"),
#         "contentType": content_type,
#         "source": job.get("source"),
#         "extracted": {
#             "text_snippet": (extracted_text or "")[:500],
#             "issuer": issuer,
#             "qr_urls": qr_urls,
#         },
#         "verification": {
#             "status": status_result,
#             "confidence": total_score,
#             "heuristics": heur_score,
#             "qr_verification": qr_verif,
#             "page_verification": page_verif,
#             "checkedAt": datetime.utcnow().isoformat()
#         },
#         "encrypted_blob_path": save_path,
#         "blob_hash_sha256": blob_hash,
#     }

#     # --- Step 7: Forward to Downstream Server (unchanged) ---
#     print(f"Forwarding final payload for job {job_id} to {settings.SERVER_ENDPOINT}")
#     post_resp = await verification.post_to_server(payload)
    
#     job["status"] = "done" if post_resp.get("ok") else "forward_failed"
#     job["result"] = post_resp
#     job["finishedAt"] = datetime.utcnow().isoformat()
#     print(f"✅ Job {job_id} finished with status: {job['status']}")


# File: app/services/jobs.py

"""
Background Job Service

Author: Mandar K.
Date: 2024-10-10
Updated: 2025-09-15

This module manages the state of processing jobs, including the main
background task that orchestrates the entire certificate verification flow.
It handles everything from file processing to sending the final results
back to the primary application server.
"""

# File: app/services/jobs.py

"""
Background Job Service

Author: Mandar K.
Date: 2024-10-10
Updated: 2025-09-15

This module manages the state of processing jobs, including the main
background task that orchestrates the entire certificate verification flow
using Hugging Face AI models.
"""

from datetime import datetime
from typing import Dict, Any, Optional
import json

from app.core.config import settings
from app.utils import security
from app.services import certificate_processing as cert_proc
from app.services import huggingface as hf_service
from app.services import verification # For posting back the result

# In-memory store for jobs.
JOBS: Dict[str, Dict[str, Any]] = {}

def get_job_status(job_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves the sanitized status of a specific job."""
    job = JOBS.get(job_id)
    if not job:
        return None
    return {
        key: job.get(key) for key in
        ["jobId", "status", "createdAt", "startedAt", "finishedAt", "result", "error"]
    }

async def process_and_forward(job_id: str):
    """The main background task for processing a certificate using AI."""
    job = JOBS[job_id]
    job["status"] = "processing"
    job["startedAt"] = datetime.utcnow().isoformat()

    file_bytes = job.get("raw_bytes")
    content_type = job.get("content_type")

    # --- Metadata Handling ---
    metadata_str = job.get("metadata", "{}")
    try:
        metadata_dict = json.loads(metadata_str)
        student_id_from_metadata = metadata_dict.get("studentId")
        student_name_for_validation = metadata_dict.get("providedName")
        if not student_id_from_metadata or not student_name_for_validation:
            raise ValueError("'studentId' and 'providedName' are required in metadata.")
        print(f"✅ Starting job {job_id} for studentId: {student_id_from_metadata}")
    except (json.JSONDecodeError, ValueError) as e:
        job["status"] = "failed"; job["error"] = f"Fatal: Invalid metadata. {e}"
        return

    # --- Step 1: Prepare Image and Scan QR ---
    certificate_image = cert_proc.get_image_from_bytes(file_bytes, content_type)
    if not certificate_image:
        job["status"] = "failed"; job["error"] = "Could not process the uploaded file into an image."
        return
        
    qr_urls = cert_proc.scan_qr_from_image(certificate_image)
    qr_url = qr_urls[0] if qr_urls else None

    # --- Step 2: Extract Text using Hugging Face AI ---
    extracted_text = await hf_service.extract_text_from_image(certificate_image)
    if not extracted_text:
        job["status"] = "failed"; job["error"] = "AI failed to extract text from the certificate image."
        return

    # --- Step 3: Get AI Verification ---
    ai_analysis = await hf_service.get_ai_verification(
        text=extracted_text,
        qr_url=qr_url,
        student_name=student_name_for_validation
    )

    # --- Step 4: Determine Final Status from AI Analysis ---
    if ai_analysis.get("is_valid"):
        status_result = "valid"
    elif ai_analysis.get("confidence_score", 0.0) >= 0.5:
        status_result = "suspicious"
    else:
        status_result = "invalid"

    # --- Step 5: Encrypt, Hash, and Prepare Payload ---
    blob_hash = security.sha256_hex(file_bytes)
    encrypted_data = security.encrypt_aes_gcm(file_bytes)
    save_path = cert_proc.save_encrypted_blob_file(
        job_id, encrypted_data["nonce_b64"], encrypted_data["ciphertext_b64"], job.get("filename")
    )
    
    payload = {
        "jobId": job_id,
        "userid": student_id_from_metadata,
        "filename": job.get("filename"),
        "contentType": content_type,
        "source": job.get("source"),
        "extracted": {
            "text_snippet": (extracted_text or "")[:500],
            "issuer": {"name": ai_analysis.get("issuer")},
            "qr_urls": qr_urls,
        },
        "verification": {
            "status": status_result,
            "confidence": ai_analysis.get("confidence_score"),
            "ai_analysis": ai_analysis, # Include the full AI reasoning
            "checkedAt": datetime.utcnow().isoformat()
        },
        "encrypted_blob_path": save_path,
        "blob_hash_sha256": blob_hash,
    }

    # --- Step 6: Forward to Downstream Server ---
    print(f"Forwarding final payload for job {job_id} to {settings.SERVER_ENDPOINT}")
    post_resp = await verification.post_to_server(payload)
    
    job["status"] = "done" if post_resp.get("ok") else "forward_failed"
    job["result"] = post_resp
    job["finishedAt"] = datetime.utcnow().isoformat()
    print(f"✅ Job {job_id} finished with status: {job['status']}")

