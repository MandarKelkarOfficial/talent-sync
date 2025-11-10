# File: app/main.py

"""
CertProcessor Microservice (FastAPI)

Author: Mandar . k
Date: 2024-10-10
Updated: 2025-10-30

This is the main entry point for the FastAPI application. It defines the API
endpoints for certificate verification and face analysis.
"""
import uuid
from datetime import datetime
from typing import Optional, Dict, Any
import base64
import asyncio
import logging

from fastapi import FastAPI, File, UploadFile, Form, BackgroundTasks, Request, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.services import jobs, face_analysis
from app.utils import security

# Configure logging
logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

# --- Lifespan event handler to initialize resources on startup ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handles application startup and shutdown events."""
    log.info("🚀 Application startup...")
    try:
        key_bytes = base64.b64decode(settings.AES_KEY_BASE64)
        security.initialize_aes_key(key_bytes)
    except Exception as e:
        log.critical(f"❌ FATAL: Could not initialize AES key from .env: {e}")
    
    yield
    
    # --- CLEANUP ON SHUTDOWN ---
    log.info("👋 Application shutdown.")


# --- FastAPI App Initialization ---
app = FastAPI(
    title="TalentSync Verification Microservice",
    description="Processes and verifies certificates and face profiles.",
    version="1.1.0", # Bump version
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- API Endpoints ---

@app.post("/verify", status_code=202, response_model=Dict[str, str])
async def create_verification_job(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    metadata: str = Form(...),
    x_user: Optional[str] = Header(None, alias="X-User") # x_user is deprecated but kept for compatibility
):
    """
    Accepts a certificate for verification and queues it for background processing.
    'metadata' field must contain a JSON string with 'studentId' and 'providedName'.
    """
    job_id = uuid.uuid4().hex
    
    # The 'userid' is a fallback, but we now rely on 'providedName' inside metadata
    userid_from_header = x_user.strip() if x_user else "default_user"

    log.info(f"Received verification job request, assigning job ID: {job_id}")

    job_data: Dict[str, Any] = {
        "jobId": job_id,
        "userid": userid_from_header, # Store header user for logging/fallback
        "createdAt": datetime.utcnow().isoformat(),
        "status": "queued",
        "source": "upload",
        "filename": file.filename,
        "content_type": file.content_type,
        "raw_bytes": await file.read(),
        "metadata": metadata # Pass the metadata string directly to the job
    }

    jobs.JOBS[job_id] = job_data
    background_tasks.add_task(jobs.process_and_forward, job_id)

    return {"jobId": job_id, "status": "queued"}


@app.get("/verify/{job_id}", response_model=Dict[str, Any])
async def get_verification_status(job_id: str):
    """
    Retrieves the status and result of a verification job.
    """
    job = jobs.get_job_status(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@app.post("/analyze-face", response_model=Dict[str, Any])
async def analyze_face_endpoint(file: UploadFile = File(...)):
    """
    Analyzes an uploaded image to assess its suitability as a profile picture.
    """
    try:
        file_bytes = await file.read()
        analysis_result = face_analysis.analyze_face_image(file_bytes)
        
        if "error" in analysis_result:
            raise HTTPException(status_code=400, detail=analysis_result["error"])
        
        is_acceptable = (
            analysis_result.get("face_detected") and
            analysis_result.get("face_count") == 1 and
            analysis_result.get("quality_score", 0.0) >= 0.5
        )
        
        return {
            "success": True,
            "acceptable": is_acceptable,
            "analysis": analysis_result,
            "recommendations": face_analysis.get_face_recommendations(analysis_result)
        }
    except Exception as e:
        log.error(f"Face analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {str(e)}")


@app.get("/health", response_model=Dict[str, str])
async def health_check():
    """A simple health check endpoint."""
    return {"status": "ok", "downstream_endpoint": settings.SERVER_ENDPOINT}
