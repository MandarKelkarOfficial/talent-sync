/**
 *  @author Mandar K.
 * @date 2025-09-13
 * 
 */

import express from 'express';
import multer from 'multer';
import { certificateController } from '../controllers/certificateController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer to handle file uploads in memory.
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route for the frontend to upload a certificate.
// router.post('/upload', upload.single('certificate'), certificateController.uploadAndVerify);

// --- Apply the Middleware to the Route ---
// We add 'upload.single('file')' right before the controller.
// It will process the file upload and attach it to `req.file`.
router.post(
  '/upload',
  protect,
  upload.single('file'), 
  certificateController.uploadAndVerify
);


// Webhook route for the FastAPI backend to post back the final verification results.
router.post('/save-result', express.json(), certificateController.saveVerificationResult);

// This route now requires a valid token and will get the user's own certificates
router.get('/', protect, certificateController.getCertificatesForStudent);

// ✅ NEW: DELETE route to remove a specific certificate
router.delete('/:id', protect, certificateController.deleteCertificate);

export default router;