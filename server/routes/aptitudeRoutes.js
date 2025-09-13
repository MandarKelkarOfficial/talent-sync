import express from 'express';
import { aptitudeController } from '../controllers/aptitudeController.js';

const router = express.Router();

// @route   POST /api/aptitude/generate
// @desc    Generate a new aptitude test
router.post('/generate', aptitudeController.generateTest);

// @route   POST /api/aptitude/submit/:testId
// @desc    Submit answers and get the result
router.post('/submit/:testId', aptitudeController.submitTest);

// @route   GET /api/aptitude/result/:resultId
// @desc    Get a specific test result
router.get('/result/:resultId', aptitudeController.getTestResult);


router.get('/student/:studentId/results', aptitudeController.getStudentResults);
router.get('/student/:studentId/progress', aptitudeController.getStudentProgress);



export default router;