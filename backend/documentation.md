## **CertProcessor Microservice Documentation**

This document provides a high-level overview of the CertProcessor FastAPI backend. The service is designed to receive digital certificates (via file upload or URL), process them asynchronously, perform various verification checks, and analyze user-provided face images for quality.

### Start Command

```
uvicorn app.main:app --reload
```

### **Directory Structure**

The project is organized into a modular structure to separate concerns, making it clean and maintainable.

```
backend/
│
├── .env                  # Stores configuration and secrets
├── requirements.txt      # Lists all Python package dependencies
│
└── app/
    ├── main.py           # Main application file with API endpoints
    │
    ├── core/
    │   └── config.py     # Handles loading environment variables
    │
    ├── models/
    │   └── schemas.py    # Defines Pydantic data models for requests
    │
    ├── services/
    │   ├── certificate_processing.py # Logic for file parsing, OCR, and QR scanning
    │   ├── face_analysis.py        # Logic for face detection and quality analysis
    │   ├── jobs.py                 # Manages and runs background verification tasks
    │   └── verification.py         # Handles external verification via web scraping
    │
    └── utils/
        └── security.py             # Helper functions for encryption and hashing
```

-----

### **Component Breakdown**

Here is a summary of what each file and its key functions are responsible for.

#### 📍 `app/main.py`

This is the main entry point for the API. It initializes the FastAPI application and defines all the public-facing endpoints.

  * **`create_verification_job(/verify)`**: The primary endpoint that accepts certificate verification requests. It handles file uploads, JSON payloads with URLs, and raw binary data. It creates a new job, adds it to a background queue, and immediately returns a `jobId`.
  * **`get_verification_status(/verify/{job_id})`**: Allows clients to poll for the status and result of a previously submitted job.
  * **`analyze_face_endpoint(/analyze-face)`**: An endpoint dedicated to analyzing an uploaded face image for quality, returning an `acceptable` status and recommendations.
  * **`health_check(/health)`**: A simple endpoint to confirm that the service is running.

#### ⚙️ `app/services/jobs.py`

This module orchestrates the entire asynchronous verification process.

  * **`JOBS`**: An in-memory dictionary that acts as a simple job queue for this proof-of-concept.
  * **`process_and_forward(job_id)`**: The core background task. It takes a `jobId` and performs the full workflow: downloading files, extracting data, running verification checks, validating the user's name, encrypting the original file, and finally posting the complete payload to a downstream server.

#### 📄 `app/services/certificate_processing.py`

This service contains all the logic for extracting information directly from the certificate files.

  * **`extract_text_from_pdf_bytes()`**: Parses a PDF file to extract its textual content directly.
  * **`ocr_image()`**: Uses `pytesseract` to perform Optical Character Recognition (OCR) on images, for certificates where text isn't embedded.
  * **`scan_qr_from_bytes()`**: Scans an image or PDF for QR codes and decodes their contents.
  * **`heuristics_score()`**: Calculates a confidence score based on keywords and patterns found in the file, such as "certificate id" or the presence of a QR code.

#### 🖼️ `app/services/face_analysis.py`

This service handles all image processing related to biometric verification.

  * **`analyze_face_image()`**: Takes image bytes and uses the `face_recognition` library to detect the number of faces, their location, and calculates a quality score based on the face's size and position in the image. It has a fallback to a basic OpenCV classifier if the primary library isn't available.
  * **`get_face_recommendations()`**: Generates user-friendly feedback based on the analysis results (e.g., "Multiple faces detected").

#### 🔗 `app/services/verification.py`

This module is responsible for all external network operations required for verification.

  * **`verify_verification_page()`**: Takes a URL (often from a QR code), fetches the webpage, and scrapes its content using `BeautifulSoup` to look for verification keywords and the expected user's name.
  * **`post_to_server()`**: Sends the final, processed payload to the downstream server defined in the environment variables, complete with retry logic.

#### 🔒 `app/utils/security.py`

This utility module provides cryptographic functions.

  * **`sha256_hex()`**: Computes the SHA-256 hash of the original certificate file.
  * **`encrypt_aes_gcm()`**: Encrypts the certificate file using AES-256-GCM to ensure the original document is stored securely.

#### 📝 **Configuration & Models**

  * **`app/core/config.py`**: Uses Pydantic to load, validate, and provide access to all environment variables from the `.env` file, such as API keys and server endpoints.
  * **`app/models/schemas.py`**: Defines the `VerifyRequest` Pydantic model, ensuring that incoming JSON payloads to the `/verify` endpoint have the correct structure and data types.