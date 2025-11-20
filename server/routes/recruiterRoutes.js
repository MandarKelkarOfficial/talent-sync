import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { recruiterController } from '../controllers/recruiterController.js';

const router = express.Router();

// Filter and get students
router.get('/filter', protect, recruiterController.filterStudents);

export default router;