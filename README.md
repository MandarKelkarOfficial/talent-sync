
# TalentSync: Intelligent Talent Management Platform

TalentSync is a comprehensive, full-stack application designed to streamline and modernize the recruitment and talent management process. It leverages a powerful combination of a React-based user interface, a robust Node.js backend, and an intelligent Python microservice for advanced AI-powered features.

This platform empowers recruiters and candidates alike by providing tools for resume analysis, aptitude testing, secure certificate verification, and much more, all within a sleek and intuitive interface.

## ✨ Key Features

  - **Seamless User Authentication**: Secure registration and login functionality using JWT for session management.
  - **Interactive Dashboard**: A modern and responsive user interface built with React and Vite for a fast and engaging user experience.
  - **AI-Powered Resume Analysis**: Upload resumes and get instant insights and scoring to identify top candidates quickly.
  - **Aptitude Testing**: Integrated aptitude tests to assess candidate skills effectively.
  - **Advanced Certificate Verification**: Securely upload, encrypt, and verify candidate certificates using advanced OCR and QR code analysis.
  - **Facial Recognition**: An innovative feature for candidate profile verification, ensuring authenticity and security.
  - **Robust API Endpoints**: A well-structured backend with separate modules for handling authentication, resumes, certificates, and more.
  - **Scalable Architecture**: A microservice-based approach with a dedicated Python service for handling computationally intensive tasks.

## 🚀 Tech Stack

The project is built with a modern and powerful technology stack:

| Category          | Technologies                                                                                             |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| **Frontend** | React, Vite, React Router, Axios, Framer Motion, Tailwind CSS, styled-components                     |
| **Backend (API)** | Node.js, Express, MongoDB (with Mongoose), JWT, BcryptJS, Multer, Nodemailer                     |
| **Backend (AI)** | Python, FastAPI, OpenCV, PyTesseract, Face-Recognition, Pydantic                                 |
| **Development** | Concurrently, ESLint, Vite                                                                       |

## ⚙️ Getting Started

Follow these instructions to get a local copy of the project up and running for development and testing purposes.

### Prerequisites

  - Node.js & npm
  - Python & pip
  - MongoDB instance (local or cloud)
  - Tesseract OCR

### Installation & Setup

1.  **Clone the Repository**

    ```sh
    git clone https://github.com/MandarKelkarOfficial/talent-sync.git
    cd talent-sync
    ```

2.  **Frontend & Node.js Backend Setup**

      - Install dependencies from `package.json`:
        ```sh
        npm install
        ```
      - Create a `.env` file in the root directory and add your environment variables:
        ```env
        MONGO_URI=your_mongodb_connection_string
        JWT_SECRET=your_jwt_secret
        GOOGLE_API_KEY=your_api_key
        PORT=your_email_port
        EMAIL_USER=your_email_user
        EMAIL_PASS=your_email_password
        AES_KEY_BASE64=######
        HUGGINGFACE_API_KEY=#########
        ```

3.  **Python Backend Setup**

      - Navigate to the Python backend directory:
        ```sh
        cd backend
        ```
      - Create Virtual Environment and activate it:
        ```sh
        python -m virtualenv venv
        .\venv\Scripts\activate
        ```
      - Install the required Python packages from `requirements.txt`:
        ```sh
        pip install -r requirements.txt
        ```
      - Create a `.env` file in the `backend` directory for Python-specific variables if needed.

### Running the Application

  - Use the `dev` script to run both the frontend and the Node.js server concurrently:
    ```sh
    npm run dev
    ```
  - Start the Python FastAPI server from the `backend` directory:
    ```sh
    uvicorn app.main:app --reload
    ```

Your application should now be running locally\!

## 📂 Project Structure

The project is organized into a clean and maintainable structure:

```
talent-sync/
├── backend/            # Python FastAPI microservice for AI tasks
│   ├── app/
│   ├── encrypted_uploads/
│   └── requirements.txt
├── server/             # Node.js Express backend
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── src/                # React frontend application
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── pages/
│   └── services/
├── package.json        # Project dependencies and scripts
└── README.md           # You are here!
```

## ✍️ Author

  - **Mandar Kelkar**

## 📜 License

This project is licensed under the MIT License - see the `LICENSE` file for details. (You may want to add a LICENSE file).