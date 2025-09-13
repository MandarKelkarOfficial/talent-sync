# # main.py (updated - verification page integrated)
# import os
# import io
# import re
# import uuid
# import base64
# import hashlib
# import asyncio
# from datetime import datetime
# from typing import Optional, List, Dict, Any
# import cv2
# import numpy as np

# from bs4 import BeautifulSoup
# from fastapi import FastAPI, File, UploadFile, Body, BackgroundTasks, Request, HTTPException, Header
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from PIL import Image
# import pytesseract
# from pyzbar.pyzbar import decode as qr_decode
# from pypdf import PdfReader
# import httpx
# from pdf2image import convert_from_bytes
# from dotenv import load_dotenv
# from cryptography.hazmat.primitives.ciphers.aead import AESGCM

# # Load environment
# load_dotenv()

# SERVER_ENDPOINT = os.getenv("SERVER_ENDPOINT", "http://localhost:5000/api/certificates")
# AES_KEY_BASE64 = os.getenv("AES_KEY_BASE64", "")
# UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./encrypted_uploads")
# POST_TIMEOUT_SECONDS = int(os.getenv("POST_TIMEOUT_SECONDS", "10"))
# POST_RETRIES = int(os.getenv("POST_RETRIES", "3"))
# TESSERACT_CMD = os.getenv("TESSERACT_CMD", None)

# if TESSERACT_CMD:
#     pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD

# # Validate AES key
# if not AES_KEY_BASE64:
#     raise RuntimeError("AES_KEY_BASE64 must be set in .env (base64 of 32 random bytes).")
# try:
#     AES_KEY = base64.b64decode(AES_KEY_BASE64)
# except Exception as e:
#     raise RuntimeError("AES_KEY_BASE64 is not valid base64.") from e
# if len(AES_KEY) != 32:
#     raise RuntimeError("AES_KEY_BASE64 must decode to 32 bytes (AES-256 key).")

# os.makedirs(UPLOAD_DIR, exist_ok=True)

# app = FastAPI(title="CertProcessor Microservice (FastAPI)")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # In-memory JOB store for PoC
# JOBS: Dict[str, Dict[str, Any]] = {}

# # Known issuers heuristics (simple)
# KNOWN_ISSUERS = [
#     ("coursera", "coursera.org"),
#     ("udemy", "udemy.com"),
#     ("accredible", "accredible.com"),
#     ("credly", "credly.com"),
#     ("edx", "edx.org"),
#     ("openbadge", "openbadges.org"),
#     ("blockcerts", "blockcerts.org"),
# ]

# # Pydantic model for JSON URL payload
# class VerifyRequest(BaseModel):
#     url: Optional[str] = None                # direct file URL (pdf/png/jpg)
#     verification_url: Optional[str] = None   # issuer verification page (coursera verify link)
#     username: Optional[str] = None           # authenticated username

# # Helpers: file persistence, hashing, AES-GCM encryption
# def sha256_hex(b: bytes) -> str:
#     h = hashlib.sha256()
#     h.update(b)
#     return h.hexdigest()

# def encrypt_aes_gcm(plaintext: bytes) -> Dict[str, str]:
#     aesgcm = AESGCM(AES_KEY)
#     nonce = os.urandom(12)
#     ct = aesgcm.encrypt(nonce, plaintext, associated_data=None)
#     return {
#         "nonce_b64": base64.b64encode(nonce).decode("utf-8"),
#         "ciphertext_b64": base64.b64encode(ct).decode("utf-8"),
#     }

# def save_encrypted_blob_file(job_id: str, nonce_b64: str, ciphertext_b64: str, filename_hint: Optional[str] = None) -> str:
#     fname = f"{job_id}"
#     if filename_hint:
#         safe = "".join(ch for ch in filename_hint if ch.isalnum() or ch in "._-")[:60]
#         fname = f"{job_id}_{safe}"
#     path = os.path.join(UPLOAD_DIR, fname + ".enc")
#     with open(path, "w", encoding="utf-8") as f:
#         f.write(nonce_b64 + "\n")
#         f.write(ciphertext_b64)
#     return path

# # PDF / image extraction helpers
# def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
#     try:
#         reader = PdfReader(io.BytesIO(pdf_bytes))
#         texts = []
#         for page in reader.pages:
#             text = page.extract_text() or ""
#             texts.append(text)
#         return "\n".join(texts).strip()
#     except Exception:
#         return ""

# def images_from_pdf_bytes(pdf_bytes: bytes, max_pages: int = 2) -> List[Image.Image]:
#     try:
#         pil_pages = convert_from_bytes(pdf_bytes, first_page=1, last_page=max_pages)
#         return pil_pages
#     except Exception:
#         return []

# def ocr_image(pil_img: Image.Image) -> str:
#     try:
#         return pytesseract.image_to_string(pil_img) or ""
#     except Exception:
#         return ""

# def scan_qr_from_image(pil_img: Image.Image) -> List[str]:
#     try:
#         decoded = qr_decode(pil_img)
#         urls = []
#         for d in decoded:
#             data = d.data.decode("utf-8", errors="ignore")
#             urls.append(data)
#         return urls
#     except Exception:
#         return []

# def scan_qr_from_bytes(b: bytes, content_type: str) -> List[str]:
#     try:
#         if content_type and "pdf" in content_type:
#             imgs = images_from_pdf_bytes(b, max_pages=2)
#             urls = []
#             for img in imgs:
#                 urls.extend(scan_qr_from_image(img))
#             return urls
#         else:
#             img = Image.open(io.BytesIO(b)).convert("RGB")
#             return scan_qr_from_image(img)
#     except Exception:
#         return []

# def detect_issuer_from_text(text: str, qr_urls: List[str]) -> Optional[Dict[str,str]]:
#     lower = (text or "").lower()
#     for name, domain in KNOWN_ISSUERS:
#         if name in lower or domain in lower:
#             return {"name": name, "domain": domain}
#     for u in qr_urls:
#         for name, domain in KNOWN_ISSUERS:
#             if domain in u or name in u:
#                 return {"name": name, "domain": domain}
#     return None

# # Name matching helper
# def name_matches_authenticated(username: str, extracted_text: str) -> bool:
#     if not username or not extracted_text:
#         return False
#     u = username.strip().lower()
#     text = extracted_text.lower()
#     tokens = [t for t in re.split(r"\W+", u) if len(t) > 2]
#     if not tokens:
#         return False
#     matches = sum(1 for t in tokens if t in text)
#     if len(tokens) >= 2:
#         return matches >= 2
#     else:
#         return matches >= 1

# # Heuristics scoring (file-level)
# def heuristics_score(extracted_text: str, issuer: Optional[Dict[str,str]], qr_urls: List[str]) -> Dict[str, Any]:
#     score = 0.0
#     methods = []
#     evidence = []
#     if issuer:
#         score += 0.25
#         methods.append("issuer-detected")
#         evidence.append({"issuer": issuer})
#     if re.search(r"certificate id|credential id|cert id|credential id", (extracted_text or "").lower()):
#         score += 0.2
#         methods.append("has-cert-id-label")
#     if re.search(r"\b(20\d{2})\b", (extracted_text or "")):
#         score += 0.1
#         methods.append("has-year")
#     if qr_urls:
#         score += 0.2
#         methods.append("has-qr")
#         evidence.append({"qr_urls": qr_urls})
#     return {"score": min(score,1.0), "methods": methods, "evidence": evidence}

# # Verify via QR or linked verification pages (existing function)
# async def verify_via_qr_or_link(qr_urls: List[str], extracted_text: str) -> Dict[str, Any]:
#     async with httpx.AsyncClient(timeout=POST_TIMEOUT_SECONDS, follow_redirects=True) as client:
#         for url in qr_urls:
#             try:
#                 if not (url.startswith("http://") or url.startswith("https://")):
#                     continue
#                 r = await client.get(url)
#                 if r.status_code == 200:
#                     body = r.text.lower()
#                     name_candidates = re.findall(r"[A-Z][a-z]{2,}\s[A-Z][a-z]{2,}", extracted_text)
#                     matched_name = any((nc.lower() in body) for nc in name_candidates) if name_candidates else False
#                     verified_text = ("verified" in body) or ("certificate" in body) or ("credential" in body) or ("credential id" in body)
#                     evidence = {
#                         "url": url,
#                         "status_code": r.status_code,
#                         "matched_name": matched_name,
#                         "has_verified_words": verified_text,
#                         "snippet": body[:1000],
#                     }
#                     score = 0.0
#                     methods = []
#                     if matched_name:
#                         score += 0.35; methods.append("name-match-on-verification-page")
#                     if verified_text:
#                         score += 0.5; methods.append("verification-page-keywords")
#                     return {"ok": True, "score": min(score, 1.0), "methods": methods, "evidence": evidence}
#             except Exception:
#                 continue
#     return {"ok": False, "score": 0.0, "methods": [], "evidence": None}

# # New: verify issuer verification page (BeautifulSoup)
# async def verify_verification_page(page_url: str, expected_username: Optional[str] = None) -> Dict[str, Any]:
#     evidence: Dict[str, Any] = {"url": page_url}
#     try:
#         async with httpx.AsyncClient(timeout=POST_TIMEOUT_SECONDS, follow_redirects=True) as client:
#             r = await client.get(page_url)
#             if r.status_code != 200:
#                 return {"ok": False, "score": 0.0, "methods": [], "evidence": {"url": page_url, "status_code": r.status_code}}

#             text = r.text or ""
#             soup = BeautifulSoup(text, "html.parser")
#             page_text_low = soup.get_text(separator=" ").lower()

#             # heuristics
#             keywords = ["verify", "verified", "certificate", "credential", "credential id", "identity"]
#             has_keywords = any(k in page_text_low for k in keywords)

#             matched_name = False
#             name_snippet = None
#             if expected_username:
#                 simple_name = expected_username.strip().lower()
#                 if simple_name and simple_name in page_text_low:
#                     matched_name = True
#                     name_snippet = simple_name

#             meta_title = (soup.title.string if soup.title else "") or ""
#             anchors = [a.get("href", "") for a in soup.find_all("a", href=True)]
#             verify_links = [u for u in anchors if "verify" in u.lower()]

#             cert_id_match = None
#             m = re.search(r"\b([A-Z0-9\-]{8,})\b", page_text_low, flags=re.IGNORECASE)
#             if m:
#                 cert_id_match = m.group(1)

#             score = 0.0
#             methods: List[str] = []
#             if has_keywords:
#                 score += 0.45
#                 methods.append("verification-page-keywords")
#             if matched_name:
#                 score += 0.35
#                 methods.append("name-on-verification-page")
#             if verify_links:
#                 score += 0.15
#                 methods.append("verify-link-found")
#             if cert_id_match:
#                 score += 0.05
#                 methods.append("cert-id-found")

#             evidence.update({
#                 "status_code": r.status_code,
#                 "meta_title": meta_title,
#                 "verify_links_sample": verify_links[:5],
#                 "cert_id": cert_id_match,
#                 "name_snippet": name_snippet,
#                 "text_snippet": page_text_low[:800]
#             })

#             ok = score >= 0.5 or (matched_name and score >= 0.35)
#             return {"ok": ok, "score": min(score, 1.0), "methods": methods, "evidence": evidence}
#     except Exception as e:
#         return {"ok": False, "score": 0.0, "methods": [], "evidence": {"error": str(e), "url": page_url}}

# # Post to Node server with retries
# async def post_to_server(payload: Dict[str, Any]) -> Dict[str, Any]:
#     async with httpx.AsyncClient(timeout=POST_TIMEOUT_SECONDS) as client:
#         last_exc = None
#         for attempt in range(1, POST_RETRIES + 1):
#             try:
#                 r = await client.post(SERVER_ENDPOINT, json=payload)
#                 return {"ok": True, "status_code": r.status_code, "response_text": r.text}
#             except Exception as e:
#                 last_exc = e
#                 await asyncio.sleep(1)
#         return {"ok": False, "error": str(last_exc)}

# # The main background job
# async def process_and_forward(job_id: str):
#     JOBS[job_id]["status"] = "processing"
#     JOBS[job_id]["startedAt"] = datetime.utcnow().isoformat()
#     job = JOBS[job_id]

#     file_bytes = job.get("raw_bytes")
#     ct = job.get("content_type")
#     filename = job.get("filename")
#     url = job.get("url")
#     verification_url = job.get("verification_url")
#     username = job.get("userid")

#     page_verif: Optional[Dict[str, Any]] = None
#     qr_verif: Dict[str, Any] = {"ok": False, "score": 0.0, "methods": [], "evidence": None}

#     # If URL was provided, download it
#     if not file_bytes and url:
#         try:
#             async with httpx.AsyncClient(timeout=POST_TIMEOUT_SECONDS) as client:
#                 resp = await client.get(url)
#                 if resp.status_code == 200:
#                     file_bytes = resp.content
#                     job["content_type"] = resp.headers.get("content-type", ct)
#                     ct = job["content_type"]
#                 else:
#                     JOBS[job_id]["status"] = "failed"
#                     JOBS[job_id]["error"] = f"Failed to fetch URL: {url} status {resp.status_code}"
#                     return
#         except Exception as e:
#             JOBS[job_id]["status"] = "failed"
#             JOBS[job_id]["error"] = f"Exception while fetching URL: {str(e)}"
#             return

#     # If verification_url was provided or downloaded content is HTML, run verification page check
#     page_url_to_check = verification_url or (url if url else None)
#     if page_url_to_check and ((ct and "html" in (ct or "")) or verification_url):
#         page_verif = await verify_verification_page(page_url_to_check, username)
#         # if page_verif found name or keywords, we can treat that as qr_verif-like evidence
#         if page_verif and page_verif.get("ok"):
#             qr_verif = page_verif

#     if not file_bytes:
#         JOBS[job_id]["status"] = "failed"
#         JOBS[job_id]["error"] = "No file bytes to process"
#         return

#     # extract text: try PDF textual extraction then OCR fallback
#     extracted_text = ""
#     qr_urls: List[str] = []

#     # If content is HTML-only and we primarily did a page_verif, use the page text snippet as extracted_text
#     if page_verif and ("html" in (ct or "") or verification_url and not (ct and "pdf" in ct)):
#         extracted_text = page_verif.get("evidence", {}).get("text_snippet", "") or ""
#         # also collect verify links as qr-like evidence
#         candidate_links = page_verif.get("evidence", {}).get("verify_links_sample", [])
#         if candidate_links:
#             qr_urls.extend(candidate_links)

#     elif ct and "pdf" in (ct or ""):
#         extracted_text = extract_text_from_pdf_bytes(file_bytes)
#         if not extracted_text.strip():
#             imgs = images_from_pdf_bytes(file_bytes, max_pages=2)
#             tchunks = []
#             for im in imgs:
#                 t = ocr_image(im)
#                 if t:
#                     tchunks.append(t)
#                 qr_urls.extend(scan_qr_from_image(im))
#             extracted_text = "\n".join(tchunks)
#     else:
#         # try image OCR flow
#         try:
#             pil_img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
#             extracted_text = ocr_image(pil_img)
#             qr_urls = scan_qr_from_image(pil_img)
#         except Exception:
#             extracted_text = ""

#     # final QR scan attempt (PDF images fallback)
#     if not qr_urls:
#         qr_urls = scan_qr_from_bytes(file_bytes, job.get("content_type", "") or "")

#     issuer = detect_issuer_from_text(extracted_text, qr_urls)
#     heur = heuristics_score(extracted_text, issuer, qr_urls)
#     # if not set earlier from page_verif, try QR verify
#     if not qr_verif.get("ok", False) and qr_urls:
#         qr_verif = await verify_via_qr_or_link(qr_urls, extracted_text)

#     # combine scores: heuristics + qr_verif + page_verif (page_verif already merged into qr_verif if ok)
#     page_score = page_verif.get("score", 0.0) if page_verif else 0.0
#     total_score = min(heur["score"] + qr_verif.get("score", 0.0) + page_score, 1.0)

#     # Basic status decision
#     if (qr_verif.get("ok") or (page_verif and page_verif.get("ok"))) and total_score >= 0.8:
#         status_result = "valid"
#     elif total_score >= 0.75:
#         status_result = "valid"
#     elif total_score >= 0.5:
#         status_result = "suspicious"
#     else:
#         status_result = "invalid"

#     # Check authenticated username matches certificate text OR verification page evidence
#     name_ok = name_matches_authenticated(username or "", extracted_text or "")
#     # also check page_verif evidence for name match
#     if not name_ok and page_verif:
#         # check evidence name snippet
#         name_snip = page_verif.get("evidence", {}).get("name_snippet")
#         if name_snip and username and username.strip().lower() in name_snip:
#             name_ok = True

#     if not name_ok:
#         JOBS[job_id]["status"] = "rejected"
#         JOBS[job_id]["result"] = {
#             "status": "rejected",
#             "reason": "authenticated username does not appear in certificate text or verification page",
#             "confidence": total_score,
#             "evidence": {
#                 "heuristics": heur,
#                 "qr_verif": qr_verif,
#                 "page_verif": page_verif
#             }
#         }
#         return

#     # Encrypt blob and compute hash
#     blob_hash = sha256_hex(file_bytes)
#     enc = encrypt_aes_gcm(file_bytes)
#     save_path = save_encrypted_blob_file(job_id, enc["nonce_b64"], enc["ciphertext_b64"], filename_hint=filename)

#     # Build payload for server
#     payload = {
#         "jobId": job_id,
#         "userid": username,
#         "filename": filename,
#         "contentType": job.get("content_type"),
#         "source": job.get("source"),
#         "createdAt": job.get("createdAt"),
#         "extracted": {
#             "text_snippet": (extracted_text or "")[:400],
#             "issuer": issuer,
#             "qr_urls": qr_urls,
#         },
#         "verification": {
#             "status": status_result,
#             "confidence": total_score,
#             "heuristics": heur,
#             "qr_verification": qr_verif,
#             "page_verification": page_verif,
#             "checkedAt": datetime.utcnow().isoformat()
#         },
#         "encrypted_blob": {
#             "nonce_b64": enc["nonce_b64"],
#             "ciphertext_b64": enc["ciphertext_b64"],
#             "saved_path": save_path
#         },
#         "blob_hash_sha256": blob_hash,
#     }

#     # Send to server
#     post_resp = await post_to_server(payload)
#     JOBS[job_id]["status"] = "done" if post_resp.get("ok") else "forward_failed"
#     JOBS[job_id]["result"] = {
#         "forward_ok": post_resp.get("ok"),
#         "post_response": post_resp,
#         "sent_payload_excerpt": {
#             "jobId": job_id,
#             "userid": username,
#             "verification_status": status_result,
#             "confidence": total_score,
#         }
#     }
#     JOBS[job_id]["finishedAt"] = datetime.utcnow().isoformat()

# # API endpoints
# @app.post("/verify", response_model=dict)
# async def verify_endpoint(
#     request: Request,
#     background_tasks: BackgroundTasks,
#     file: Optional[UploadFile] = File(None),
#     payload: Optional[VerifyRequest] = Body(None),
#     x_user: Optional[str] = Header(None, convert_underscores=False)
# ):
#     """
#     Accepts:
#     - multipart/form-data with 'file' (pdf/png/jpg) + header X-User (authenticated username)
#     - application/json {"url":"...", "verification_url":"...", "username":"..."}
#     - direct binary upload (Content-Type: application/pdf or image/*) + header X-User
#     """
#     # debug prints (helpful during testing)
#     print(">>> HEADERS:", dict(request.headers))
#     content_type = request.headers.get("content-type", "").lower()
#     print(">>> content-type:", content_type)
#     userid = None

#     # Prefer header X-User, else look in JSON payload
#     if x_user:
#         userid = x_user.strip()
#     elif payload and payload.username:
#         userid = payload.username.strip()

#     # DEV fallback: allow tests without auth header (remove before prod)
#     if not userid:
#         userid = "maddy"

#     source = None
#     file_bytes = None
#     filename = None
#     ct = None
#     url = None
#     verification_url = None

#     # --- improved handling: file upload, JSON (pydantic or manual), or raw binary ---
#     if file is not None:
#         # multipart/form-data file upload
#         body = await file.read()
#         ct = file.content_type
#         filename = file.filename
#         file_bytes = body
#         source = "upload"

#     else:
#         # pydantic parsed JSON
#         if payload is not None and (getattr(payload, "url", None) or getattr(payload, "verification_url", None)):
#             url = getattr(payload, "url", None)
#             verification_url = getattr(payload, "verification_url", None)
#             source = "url" if url else ("verify_page" if verification_url else None)
#             if not userid and getattr(payload, "username", None):
#                 userid = payload.username.strip()
#         else:
#             # attempt to parse JSON manually if content-type indicates JSON
#             if content_type and "application/json" in content_type:
#                 try:
#                     data = await request.json()
#                     if isinstance(data, dict):
#                         url = data.get("url") or None
#                         verification_url = data.get("verification_url") or None
#                         if url or verification_url:
#                             source = "url" if url else "verify_page"
#                         if not userid and data.get("username"):
#                             userid = data.get("username").strip()
#                 except Exception:
#                     pass

#             # raw binary body (pdf/image)
#             if source is None:
#                 if content_type and ("application/pdf" in content_type or content_type.startswith("image/") or "application/octet-stream" in content_type):
#                     body = await request.body()
#                     if not body:
#                         raise HTTPException(status_code=400, detail="Empty body")
#                     ext = "bin"
#                     if "pdf" in content_type:
#                         ext = "pdf"
#                     elif "png" in content_type:
#                         ext = "png"
#                     elif "jpeg" in content_type or "jpg" in content_type:
#                         ext = "jpg"
#                     filename = f"{uuid.uuid4().hex}.{ext}"
#                     file_bytes = body
#                     ct = content_type
#                     source = "upload"
#                 else:
#                     raise HTTPException(status_code=400, detail="Unsupported content type or missing file/url")

#     job_id = uuid.uuid4().hex
#     created_at = datetime.utcnow().isoformat()

#     # create job record in memory
#     JOBS[job_id] = {
#         "jobId": job_id,
#         "userid": userid,
#         "source": source,
#         "url": url,
#         "verification_url": verification_url,
#         "filename": filename,
#         "content_type": ct,
#         "createdAt": created_at,
#         "status": "queued",
#     }
#     if file_bytes:
#         JOBS[job_id]["raw_bytes"] = file_bytes

#     # Launch background processing
#     background_tasks.add_task(process_and_forward, job_id)
#     return {"jobId": job_id, "status": "queued"}

# @app.get("/verify/{job_id}")
# async def get_result(job_id: str):
#     job = JOBS.get(job_id)
#     if not job:
#         raise HTTPException(status_code=404, detail="Job not found")
#     sanitized = {
#         "jobId": job.get("jobId"),
#         "userid": job.get("userid"),
#         "status": job.get("status"),
#         "createdAt": job.get("createdAt"),
#         "startedAt": job.get("startedAt"),
#         "finishedAt": job.get("finishedAt"),
#         "result": job.get("result"),
#         "error": job.get("error"),
#     }
#     return sanitized



# # Install these packages: pip install opencv-python face-recognition
# try:
#     import face_recognition
#     FACE_RECOGNITION_AVAILABLE = True
# except ImportError:
#     FACE_RECOGNITION_AVAILABLE = False
#     print("face_recognition not installed. Basic face detection will be used.")

# def analyze_face_image(image_bytes: bytes) -> Dict[str, Any]:
#     """
#     Analyze face image for quality and extract features
#     """
#     try:
#         # Convert bytes to numpy array
#         nparr = np.frombuffer(image_bytes, np.uint8)
#         image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
#         if image is None:
#             return {"error": "Invalid image format"}
        
#         # Convert BGR to RGB for face_recognition
#         rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
#         result = {
#             "image_dimensions": {
#                 "width": image.shape[1],
#                 "height": image.shape[0]
#             },
#             "face_detected": False,
#             "face_count": 0,
#             "quality_score": 0.0,
#             "face_encodings": [],
#             "face_locations": []
#         }
        
#         if FACE_RECOGNITION_AVAILABLE:
#             # Find face locations
#             face_locations = face_recognition.face_locations(rgb_image)
#             result["face_locations"] = face_locations
#             result["face_count"] = len(face_locations)
#             result["face_detected"] = len(face_locations) > 0
            
#             if len(face_locations) == 1:  # Exactly one face is ideal
#                 # Extract face encodings
#                 face_encodings = face_recognition.face_encodings(rgb_image, face_locations)
#                 if face_encodings:
#                     result["face_encodings"] = face_encodings[0].tolist()
                
#                 # Calculate quality score based on face size and position
#                 top, right, bottom, left = face_locations[0]
#                 face_width = right - left
#                 face_height = bottom - top
#                 image_area = image.shape[0] * image.shape[1]
#                 face_area = face_width * face_height
                
#                 # Face should be reasonably sized (not too small, not too large)
#                 face_ratio = face_area / image_area
#                 if 0.1 <= face_ratio <= 0.7:  # Face takes 10-70% of image
#                     quality_score = min(face_ratio * 2, 1.0)
#                 else:
#                     quality_score = 0.3
                
#                 result["quality_score"] = quality_score
                
#             elif len(face_locations) > 1:
#                 result["quality_score"] = 0.2  # Multiple faces reduce quality
            
#         else:
#             # Fallback to basic OpenCV face detection
#             face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
#             gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
#             faces = face_cascade.detectMultiScale(gray, 1.1, 4)
            
#             result["face_count"] = len(faces)
#             result["face_detected"] = len(faces) > 0
#             result["face_locations"] = faces.tolist()
            
#             if len(faces) == 1:
#                 result["quality_score"] = 0.8  # Basic quality score
        
#         return result
        
#     except Exception as e:
#         return {"error": f"Face analysis failed: {str(e)}"}

# # Add this endpoint to your FastAPI app
# @app.post("/analyze-face")
# async def analyze_face(
#     background_tasks: BackgroundTasks,
#     file: UploadFile = File(...),
#     x_user: Optional[str] = Header(None, convert_underscores=False)
# ):
#     """
#     Analyze uploaded face image for quality and extract features
#     """
#     try:
#         # Read file content
#         file_bytes = await file.read()
        
#         # Analyze the face
#         analysis_result = analyze_face_image(file_bytes)
        
#         if "error" in analysis_result:
#             return {"success": False, "error": analysis_result["error"]}
        
#         # Determine if the face image is acceptable
#         acceptable = (
#             analysis_result["face_detected"] and 
#             analysis_result["face_count"] == 1 and 
#             analysis_result["quality_score"] >= 0.5
#         )
        
#         return {
#             "success": True,
#             "acceptable": acceptable,
#             "analysis": analysis_result,
#             "recommendations": get_face_recommendations(analysis_result)
#         }
        
#     except Exception as e:
#         return {"success": False, "error": str(e)}

# def get_face_recommendations(analysis: Dict[str, Any]) -> List[str]:
#     """
#     Provide recommendations based on face analysis
#     """
#     recommendations = []
    
#     if not analysis["face_detected"]:
#         recommendations.append("No face detected. Please ensure your face is clearly visible.")
    
#     elif analysis["face_count"] > 1:
#         recommendations.append("Multiple faces detected. Please ensure only your face is in the image.")
    
#     elif analysis["quality_score"] < 0.5:
#         recommendations.extend([
#             "Image quality could be improved.",
#             "Ensure good lighting and face the camera directly.",
#             "Make sure your face takes up a reasonable portion of the image."
#         ])
    
#     if len(recommendations) == 0:
#         recommendations.append("Great! Your face image looks good for verification.")
    
#     return recommendations

# @app.get("/health")
# async def health():
#     return {"status": "ok", "server_endpoint": SERVER_ENDPOINT}



# File: app/main.py

"""
CertProcessor Microservice (FastAPI)
Author: Maddy (Originally by Gemini)

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

# --- FastAPI App Initialization ---
app = FastAPI(
    title="CertProcessor Microservice",
    description="Processes and verifies digital certificates and performs face analysis.",
    version="1.0.0"
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