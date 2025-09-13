import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { uploadResume, calculateAtsScore, getStudentResumes, getResumeById } from '../controllers/resumeController.js';

const router = express.Router();

// --- Multer Configuration ---
const UPLOAD_DIR = 'server/uploads/';

// Ensure the upload directory exists
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    // Sanitize filename to prevent directory traversal
    const safeFilename = path.basename(file.originalname);
    cb(null, `${Date.now()}-${safeFilename}`);
  }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Add a file size limit (e.g., 10MB)
    fileFilter: function (req, file, cb) {
        const allowedTypes = /pdf|doc|docx/;
        // Test mimetype and extension
        const mimetype = allowedTypes.test(file.mimetype);
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        // Reject file with a specific error message
        cb(new Error('File upload only supports PDF, DOC, and DOCX formats!'));
    }
});

// Middleware to handle multer errors gracefully
const handleUpload = (req, res, next) => {
    const uploadMiddleware = upload.single('resumeFile');

    uploadMiddleware(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred (e.g., file too large)
            return res.status(400).json({ message: err.message });
        } else if (err) {
            // An error from our file filter or an unknown error
            return res.status(400).json({ message: err.message });
        }
        // Everything went fine, proceed to the controller
        next();
    });
};


// --- Routes ---

// @route   POST /api/resumes/upload
// @desc    Upload a new resume
router.post('/upload', handleUpload, uploadResume);

// @route   POST /api/resumes/:resumeId/calculate-ats
// @desc    Calculate ATS score against a job description
router.post('/:resumeId/calculate-ats', calculateAtsScore);

// @route   GET /api/resumes
// @desc    Get all resumes for a specific student
router.get('/', getStudentResumes);

// @route   GET /api/resumes/:resumeId
// @desc    Get a specific resume by ID
router.get('/:resumeId', getResumeById);


export default router;