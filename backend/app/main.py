# File: app/main.py

"""
CertProcessor Microservice (FastAPI)

Author: Mandar . k
Date: 2024-10-10

This is the main entry point for the FastAPI application. It defines the API
endpoints for certificate verification and face analysis.
"""
import uuid
from datetime import datetime
from typing import Optional, Dict, Any

from fastapi import FastAPI, File, UploadFile, Body, BackgroundTasks, Request, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.models.schemas import VerifyRequest
from app.services import jobs, face_analysis

from contextlib import asynccontextmanager
from .core.config import settings
from .utils import security
import base64




# --- NEW: Lifespan event handler to initialize resources on startup ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Code to run on startup
    print("🚀 Application startup...")
    try:
        key_bytes = base64.b64decode(settings.AES_KEY_BASE64)
        security.initialize_aes_key(key_bytes)
    except Exception as e:
        print(f"❌ FATAL: Could not initialize AES key from .env: {e}")
        # In a real app, you might want to exit if the key is essential
    yield
    # Code to run on shutdown
    print("👋 Application shutdown.")



# --- FastAPI App Initialization ---
app = FastAPI(
    title="TalentSync Verification Microservice",
    description="Processes and verifies certificates and face profiles.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- API Endpoints ---
@app.post("/verify", status_code=202, response_model=Dict[str, str])
async def create_verification_job(
    request: Request,
    background_tasks: BackgroundTasks,
    file: Optional[UploadFile] = File(None),
    payload: Optional[VerifyRequest] = Body(None),
    x_user: Optional[str] = Header(None, alias="X-User")
):
    """
    Accepts a certificate for verification and queues it for background processing.

    This endpoint can handle:
    - **multipart/form-data**: With a `file` upload and an `X-User` header.
    - **application/json**: With a `url` or `verification_url` and `username`.
    - **Raw binary (e.g., application/pdf)**: With an `X-User` header.

    It immediately returns a `jobId` that can be used to poll the status.
    """
    job_id = uuid.uuid4().hex
    userid = x_user.strip() if x_user else (payload.username.strip() if payload and payload.username else "default_user")

    job_data: Dict[str, Any] = {
        "jobId": job_id,
        "userid": userid,
        "createdAt": datetime.utcnow().isoformat(),
        "status": "queued",
    }

    if file:
        job_data.update({
            "source": "upload",
            "filename": file.filename,
            "content_type": file.content_type,
            "raw_bytes": await file.read(),
        })
    elif payload and (payload.url or payload.verification_url):
        job_data.update({
            "source": "url" if payload.url else "verify_page",
            "url": payload.url,
            "verification_url": payload.verification_url,
        })
    else:
        raise HTTPException(status_code=400, detail="Request must contain a file upload or a valid URL in the JSON payload.")

    jobs.JOBS[job_id] = job_data
    background_tasks.add_task(jobs.process_and_forward, job_id)

    return {"jobId": job_id, "status": "queued"}


@app.get("/verify/{job_id}", response_model=Dict[str, Any])
async def get_verification_status(job_id: str):
    """
    Retrieves the status and result of a verification job.

    Poll this endpoint using the `jobId` returned from the `/verify` POST request.
    """
    job = jobs.get_job_status(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@app.post("/analyze-face", response_model=Dict[str, Any])
async def analyze_face_endpoint(file: UploadFile = File(...)):
    """
    Analyzes an uploaded image to assess its suitability as a profile picture for verification.

    Checks for:
    - Presence of a single face.
    - Image quality and face framing.

    Returns an `acceptable` boolean flag and a list of recommendations.
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
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {str(e)}")


@app.get("/health", response_model=Dict[str, str])
async def health_check():
    """A simple health check endpoint."""
    return {"status": "ok", "downstream_endpoint": settings.SERVER_ENDPOINT}