/**
 * @fileoverview Recruiter Authentication Routes
 * @author Mandar K.
 * @date 2025-11-20
 * * @description
 * Routes dedicated to Recruiter login and registration.
 */

import express from "express";
import { recruiterAuthController } from "../controllers/recruiterAuthController.js";

const router = express.Router();

// Recruiter Registration
router.post("/register", recruiterAuthController.register);

// Recruiter Login (used when isRecruiter=true on frontend)
router.post("/login", recruiterAuthController.login);


export default router;