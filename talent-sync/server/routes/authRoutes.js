/**
 *  @author Mandar K.
 * @date 2025-09-13
 * 
 */

import express from "express";
import { authController } from "../controllers/authController.js";

const router = express.Router();

// Registration flow
router.post("/register", authController.register);
router.post("/verify-otp", authController.verifyOtp);
router.post("/resend-otp", authController.resendOtp);

// Login
router.post("/login", authController.login);


// Profile management (NEW)
router.get("/profile/:userId", authController.getProfile);
router.patch("/profile/:userId", authController.updateProfile);

// Utility routes
router.post("/check-duplicate", authController.checkDuplicate);

export default router;