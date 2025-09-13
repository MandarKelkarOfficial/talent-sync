import express from 'express';
import multer from 'multer';
import { certificateController } from '../controllers/certificateController.js';

const router = express.Router();

// Configure multer to handle file uploads in memory.
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route for the frontend to upload a certificate.
router.post('/upload', upload.single('certificate'), certificateController.uploadAndVerify);

// Webhook route for the FastAPI backend to post back the final verification results.
router.post('/save-result', express.json(), certificateController.saveVerificationResult);

export default router;