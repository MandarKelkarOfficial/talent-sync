// routes/faceProfileRoutes.js
import express from 'express';
import multer from 'multer';
import { faceProfileController } from '../controllers/faceProfileController.js';

const router = express.Router();

// Configure multer for memory storage (we'll store in MongoDB as Buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Multer error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size allowed is 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed'
    });
  }
  
  next(err);
};

// Face profile routes
router.post('/capture', upload.single('faceImage'), handleMulterError, faceProfileController.capture);
router.get('/:studentId', faceProfileController.getProfile);
router.get('/:studentId/image', faceProfileController.getFaceImage);
router.post('/:studentId/verify', upload.single('verificationImage'), handleMulterError, faceProfileController.verifyFace);
router.delete('/:studentId', faceProfileController.deactivateProfile);

export default router;