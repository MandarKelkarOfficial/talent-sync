/**
 * @fileoverview Recruiter Authentication Controller
 * @author Mandar K.
 * @date 2025-11-20
 * * @description
 * Handles registration and login logic specifically for Recruiter accounts.
 * Note: OTP is omitted for recruiters for simplicity, they are auto-verified here.
 */

import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import Recruiter from "../models/Recruiter.js";
import StudentDetails from "../models/StudentDetails.js";

export const recruiterAuthController = {
  // Recruiter Registration - simpler than student registration (no OTP/pending state)
  register: async (req, res) => {
    const { 
      name, email, password, address, 
      companyName, companyEmail, phoneNumber, age 
    } = req.body;

    // Basic Validation
    if (!name || !email || !password || !companyName || !companyEmail || !phoneNumber) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    try {
      // Check if email already exists in either table
      const existingStudent = await StudentDetails.findOne({ email });
      const existingRecruiter = await Recruiter.findOne({ email });

      if (existingStudent || existingRecruiter) {
        return res.status(409).json({ success: false, message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newRecruiter = new Recruiter({
        name,
        email,
        password: hashedPassword,
        phoneNumber,
        companyName,
        companyEmail,
        address,
        age,
        isVerified: true, // Auto-verify for simplicity
        accountStatus: 'active'
      });
      await newRecruiter.save();

      // Recruiter login is handled separately, but we return success here
      res.status(201).json({
        success: true,
        message: "Recruiter registered successfully. You can now log in."
      });

    } catch (error) {
      console.error("Recruiter registration error:", error);
      // Handle potential duplicate key error (11000) for email not caught above
      if (error.code === 11000) {
        return res.status(409).json({ success: false, message: "Email already registered." });
      }
      res.status(500).json({ success: false, message: "Server error during registration" });
    }
  },

  // Recruiter Login
  login: async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    try {
      const recruiter = await Recruiter.findOne({ email });

      if (!recruiter) {
        return res.status(400).json({ success: false, message: "Invalid credentials (Recruiter not found)" });
      }

      if (recruiter.accountStatus !== 'active') {
        return res.status(400).json({ success: false, message: "Account is suspended. Contact support." });
      }

      const isMatch = await bcrypt.compare(password, recruiter.password);

      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Invalid credentials" });
      }

      // Create JWT Payload - Note: we add a 'role'
      const payload = {
        id: recruiter._id,
        name: recruiter.name,
        role: 'recruiter' // IMPORTANT: Distinguish recruiter from student
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
      
      // Update last login
      recruiter.lastLogin = new Date();
      await recruiter.save();

      // Return user data (exclude password)
      const { password: _, ...userData } = recruiter._doc;

      res.json({
        success: true,
        message: "Recruiter login successful",
        token: token, 
        user: {
          ...userData,
          role: 'recruiter' // Return the role to the client
        }
      });

    } catch (error) {
      console.error("Recruiter login error:", error);
      res.status(500).json({ success: false, message: "Server error during recruiter login" });
    }
  }
};