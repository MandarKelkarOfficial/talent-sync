
# # File: app/main.py

# """
# CertProcessor Microservice (FastAPI)

# Author: Mandar . k
# Date: 2024-10-10
# Updated: 2025-09-14

# This is the main entry point for the FastAPI application. It defines the API
# endpoints for certificate verification and face analysis.
# """
# import uuid
# from datetime import datetime
# from typing import Optional, Dict, Any
# import base64

# from fastapi import FastAPI, File, UploadFile, Form, BackgroundTasks, Request, HTTPException, Header
# from fastapi.middleware.cors import CORSMiddleware
# from contextlib import asynccontextmanager

# from app.core.config import settings
# from app.models.schemas import VerifyRequest
# from app.services import jobs, face_analysis
# from app.utils import security

# # --- Lifespan event handler to initialize resources on startup ---
# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     """Handles application startup and shutdown events."""
#     print("🚀 Application startup...")
#     try:
#         # Decode the base64 key from settings and initialize the security module
#         key_bytes = base64.b64decode(settings.AES_KEY_BASE64)
#         security.initialize_aes_key(key_bytes)
#     except Exception as e:
#         print(f"❌ FATAL: Could not initialize AES key from .env: {e}")
#     yield
#     print("👋 Application shutdown.")


# # --- FastAPI App Initialization ---
# app = FastAPI(
#     title="TalentSync Verification Microservice",
#     description="Processes and verifies certificates and face profiles.",
#     version="1.0.0",
#     lifespan=lifespan
# )

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # In production, restrict this to specific domains
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# # --- API Endpoints ---
# @app.post("/verify", status_code=202, response_model=Dict[str, str])
# async def create_verification_job(
#     background_tasks: BackgroundTasks,
#     file: UploadFile = File(...),
#     metadata: str = Form(...), # <<< METADATA FIX: Now correctly expecting a 'metadata' form field.
#     x_user: Optional[str] = Header(None, alias="X-User")
# ):
#     """
#     Accepts a certificate for verification via multipart/form-data and queues it for background processing.
#     The Node.js server sends the file and a 'metadata' field containing a JSON string.
#     """
#     job_id = uuid.uuid4().hex
    
#     # The 'userid' here is the student's name from the header, used for name validation.
#     # The actual studentId ObjectId is inside the metadata string.
#     userid = x_user.strip() if x_user else "default_user"

#     job_data: Dict[str, Any] = {
#         "jobId": job_id,
#         "userid": userid,
#         "createdAt": datetime.utcnow().isoformat(),
#         "status": "queued",
#         "source": "upload",
#         "filename": file.filename,
#         "content_type": file.content_type,
#         "raw_bytes": await file.read(),
#         "metadata": metadata  # Pass the received metadata string directly to the job.
#     }

#     jobs.JOBS[job_id] = job_data
#     background_tasks.add_task(jobs.process_and_forward, job_id)

#     return {"jobId": job_id, "status": "queued"}


# @app.get("/verify/{job_id}", response_model=Dict[str, Any])
# async def get_verification_status(job_id: str):
#     """
#     Retrieves the status and result of a verification job.
#     """
#     job = jobs.get_job_status(job_id)
#     if not job:
#         raise HTTPException(status_code=404, detail="Job not found")
#     return job


# @app.post("/analyze-face", response_model=Dict[str, Any])
# async def analyze_face_endpoint(file: UploadFile = File(...)):
#     """
#     Analyzes an uploaded image to assess its suitability as a profile picture.
#     """
#     try:
#         file_bytes = await file.read()
#         analysis_result = face_analysis.analyze_face_image(file_bytes)
        
#         if "error" in analysis_result:
#             raise HTTPException(status_code=400, detail=analysis_result["error"])
        
#         is_acceptable = (
#             analysis_result.get("face_detected") and
#             analysis_result.get("face_count") == 1 and
#             analysis_result.get("quality_score", 0.0) >= 0.5
#         )
        
#         return {
#             "success": True,
#             "acceptable": is_acceptable,
#             "analysis": analysis_result,
#             "recommendations": face_analysis.get_face_recommendations(analysis_result)
#         }
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"An internal error occurred: {str(e)}")


# @app.get("/health", response_model=Dict[str, str])
# async def health_check():
#     """A simple health check endpoint."""
#     return {"status": "ok", "downstream_endpoint": settings.SERVER_ENDPOINT}





# File: app/main.py

"""
CertProcessor Microservice (FastAPI)

Author: Mandar . k
Date: 2024-10-10
Updated: 2025-09-15

This is the main entry point for the FastAPI application. It defines the API
endpoints for certificate verification and face analysis.
"""
import uuid
from datetime import datetime
from typing import Optional, Dict, Any
import base64
import asyncio

from fastapi import FastAPI, File, UploadFile, Form, BackgroundTasks, Request, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.services import jobs, face_analysis, model_loader # <-- IMPORT NEW SERVICE
from app.utils import security

# --- Lifespan event handler to initialize resources on startup ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handles application startup and shutdown events."""
    print("🚀 Application startup...")
    try:
        key_bytes = base64.b64decode(settings.AES_KEY_BASE64)
        security.initialize_aes_key(key_bytes)
    except Exception as e:
        print(f"❌ FATAL: Could not initialize AES key from .env: {e}")
    
    # --- START MODEL WARMER ---
    # Create a background task that runs the warm_up_models function.
    warmup_task = asyncio.create_task(model_loader.warm_up_models())
    
    yield
    
    # --- CLEANUP ON SHUTDOWN ---
    print("👋 Application shutdown. Stopping model warmer...")
    warmup_task.cancel()
    print("Model warmer stopped.")


# --- FastAPI App Initialization ---
app = FastAPI(
    title="TalentSync Verification Microservice",
    description="Processes and verifies certificates and face profiles.",
    version="1.0.0",
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

# --- NEW ENDPOINT to check model status ---
@app.get("/model-status", response_model=Dict[str, Any])
async def get_model_status():
    """
    Returns the current operational status of the Hugging Face OCR models.
    """
    return model_loader.get_models_status()


@app.post("/verify", status_code=202, response_model=Dict[str, str])
async def create_verification_job(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    metadata: str = Form(...),
    x_user: Optional[str] = Header(None, alias="X-User")
):
    """
    Accepts a certificate for verification and queues it for background processing.
    """
    job_id = uuid.uuid4().hex
    userid = x_user.strip() if x_user else "default_user"

    job_data: Dict[str, Any] = {
        "jobId": job_id,
        "userid": userid,
        "createdAt": datetime.utcnow().isoformat(),
        "status": "queued",
        "source": "upload",
        "filename": file.filename,
        "content_type": file.content_type,
        "raw_bytes": await file.read(),
        "metadata": metadata
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
            analysis_get("quality_score", 0.0) >= 0.5
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
