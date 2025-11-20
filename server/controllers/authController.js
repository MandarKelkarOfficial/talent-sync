/**
 * @author Mandar K.
 * @date 2025-09-13
 * */

// controllers/authController.js
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import StudentDetails from "../models/StudentDetails.js";
import PendingRegistration from "../models/PendingRegistration.js";
// NEW: Import Recruiter Model
import Recruiter from "../models/Recruiter.js"; 


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Email transporter (same as your server.js)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || "sdbcontactme@gmail.com",
    pass: process.env.EMAIL_PASS || "fywacjgevdugsgtz",
  },
});

export const authController = {
  // Step 1: Register - Store temporarily and send OTP
  register: async (req, res) => {
    const { name, email, mobile, password, address, pincode, birthdate, gender } = req.body;

    // Validation
    if (!name || !email || !mobile || !password || !address || !pincode) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (birthdate) {
      const d = new Date(birthdate);
      if (Number.isNaN(d.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid birthdate" });
      }
    }
    // gender optional but if provided validate
    const allowedGenders = ["male", "female", "other"];
    if (gender && !allowedGenders.includes(gender)) {
      return res.status(400).json({ success: false, message: "Invalid gender" });
    }

    try {
      // Check if user already exists (checking both Student and Recruiter)
      const existingStudent = await StudentDetails.findOne({
        $or: [
          { email },
          { mobile },
          { phoneNumber: mobile } // Check against phoneNumber field as well
        ]
      });

      // NEW: Check recruiter table too
      const existingRecruiter = await Recruiter.findOne({ email });

      if (existingStudent || existingRecruiter) {
        return res.status(409).json({
          success: false,
          message: "Email or Mobile number already exists"
        });
      }

      // Check if there's already a pending registration
      const existingPending = await PendingRegistration.findOne({
        $or: [{ email }, { mobile }]
      });

      if (existingPending) {
        // Delete old pending registration
        await PendingRegistration.deleteOne({ _id: existingPending._id });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes



      const pendingRegistration = new PendingRegistration({
        name,
        email,
        password: hashedPassword,
        mobile,
        address,
        pincode,
        birthdate: birthdate || null,
        gender: gender || null,
        otp,
        otpExpiry
      });
      await pendingRegistration.save();

      // Send OTP email
      const templatePath = path.join(__dirname, "../templates", "otp-template.html");
      let htmlContent = fs.existsSync(templatePath)
        ? fs.readFileSync(templatePath, "utf8")
        : `<p>Your OTP: {{otp}}</p>`;

      htmlContent = htmlContent
        .replace(/{{otp}}/g, otp)
        .replace(/{{email}}/g, email);

      const mailOptions = {
        from: `"TalentSync Sol" <${process.env.EMAIL_USER || "sdbcontactme@gmail.com"}>`,
        to: email,
        subject: "Your Verification Code for TalentSync Sol",
        text: `Your OTP for verification is: ${otp}\nThis code will expire in 10 minutes.`,
        html: htmlContent,
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({
        success: true,
        message: "Registration data saved. OTP sent to email.",
        // Only send OTP in development
        otp: process.env.NODE_ENV === "development" ? otp : undefined
      });

    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during registration"
      });
    }
  },

  // Step 2: Verify OTP and complete registration
  verifyOtp: async (req, res) => {
    const { email, mobile, otp } = req.body;

    if (!otp || (!email && !mobile)) {
      return res.status(400).json({
        success: false,
        message: "OTP and email/mobile are required"
      });
    }

    try {
      // Find pending registration
      const pendingRegistration = await PendingRegistration.findOne({
        $or: [{ email }, { mobile }],
        otp,
        otpExpiry: { $gt: new Date() }
      });

      if (!pendingRegistration) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired OTP"
        });
      }

      // Create actual user - FIXED: Use phoneNumber and include all required fields
      const newUser = new StudentDetails({
        name: pendingRegistration.name,
        email: pendingRegistration.email,
        password: pendingRegistration.password,
        phoneNumber: pendingRegistration.mobile, // CHANGED: mobile -> phoneNumber
        address: pendingRegistration.address,
        pincode: pendingRegistration.pincode,
        isVerified: true,
        accountStatus: 'active',
        dateOfBirth: pendingRegistration.birthdate ? new Date(pendingRegistration.birthdate) : pendingRegistration.dateOfBirth || undefined,
        gender: pendingRegistration.gender
      });

      console.log("Creating new user:", newUser);
      await newUser.save();

      // Delete pending registration
      await PendingRegistration.deleteOne({ _id: pendingRegistration._id });

      const userObj = newUser.toObject();
      userObj.id = userObj._id;  // normalize
      delete userObj.password; // never return password

      res.status(200).json({
        success: true,
        message: "Registration completed successfully",
        user: userObj
      });

    } catch (error) {
      console.error("OTP verification error:", error);

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Email or mobile already exists"
        });
      }

      res.status(500).json({
        success: false,
        message: "Server error during verification"
      });
    }
  },

  // Resend OTP
  resendOtp: async (req, res) => {
    const { email, mobile } = req.body;

    if (!email && !mobile) {
      return res.status(400).json({
        success: false,
        message: "Email or mobile is required"
      });
    }

    try {
      const pendingRegistration = await PendingRegistration.findOne({
        $or: [{ email }, { mobile }]
      });

      if (!pendingRegistration) {
        return res.status(404).json({
          success: false,
          message: "No pending registration found"
        });
      }

      // Generate new OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

      // Update pending registration
      pendingRegistration.otp = otp;
      pendingRegistration.otpExpiry = otpExpiry;
      await pendingRegistration.save();

      // Send email
      const templatePath = path.join(__dirname, "../templates", "otp-template.html");
      let htmlContent = fs.existsSync(templatePath)
        ? fs.readFileSync(templatePath, "utf8")
        : `<p>Your OTP: {{otp}}</p>`;

      htmlContent = htmlContent
        .replace(/{{otp}}/g, otp)
        .replace(/{{email}}/g, pendingRegistration.email);

      const mailOptions = {
        from: `"TalentSync Sol" <${process.env.EMAIL_USER || "sdbcontactme@gmail.com"}>`,
        to: pendingRegistration.email,
        subject: "Your New Verification Code for TalentSync Sol",
        text: `Your new OTP for verification is: ${otp}\nThis code will expire in 10 minutes.`,
        html: htmlContent,
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({
        success: true,
        message: "New OTP sent successfully",
        otp: process.env.NODE_ENV === "development" ? otp : undefined
      });

    } catch (error) {
      console.error("Resend OTP error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during OTP resend"
      });
    }
  },

  // Login (Modified to handle isRecruiter flag implicitly - this is the student login route)
  login: async (req, res) => {
    const { email, password } = req.body; // isRecruiter check is done on the client side now

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    try {
      // Find Student
      const user = await StudentDetails.findOne({ email });

      if (!user) {
        // If student not found, try to find a recruiter (client should have hit /api/recruiter-auth/login if isRecruiter was true, but we try anyway for safety)
        return res.status(400).json({
          success: false,
          message: "User not found (Try Recruiter login if applicable)"
        });
      }

      if (!user.isVerified) {
        return res.status(400).json({
          success: false,
          message: "Please verify your email first"
        });
      }

      if (user.accountStatus !== 'active') {
        return res.status(400).json({
          success: false,
          message: "Account is suspended or deactivated. Contact support."
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Invalid credentials"
        });
      }

      // Create JWT Payload - Add role
      const payload = {
        id: user._id,
        name: user.name,
        role: 'student' // IMPORTANT: Define role
      };

      // Sign the token
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '1d', // Token expires in 1 day
      });

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Return user data (exclude password)
      const { password: _, ...userData } = user._doc;

      res.json({
        success: true,
        message: "Login successful",
        token: token, 
        user: {
          ...userData,
          role: 'student' // Return the role to the client
        }
      });

    } catch (error) {
      console.error("Student Login error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during login"
      });
    }
  },

  // Check duplicate email/mobile
  checkDuplicate: async (req, res) => {
    const { email, mobile } = req.body;

    try {
      // Check both mobile and phoneNumber fields for compatibility in Student table
      const existingStudent = await StudentDetails.findOne({
        $or: [
          { email },
          { mobile },
          { phoneNumber: mobile }
        ]
      });

      // NEW: Check recruiter table too
      const existingRecruiter = await Recruiter.findOne({ email });

      if (existingStudent || existingRecruiter) {
        // We just return a generic 'already exists' message for security/simplicity
        return res.status(409).json({
            success: false,
            message: "Email or Mobile number already exists"
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error checking duplicates:", error);
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  },

  // Get user profile (NEW)
  getProfile: async (req, res) => {
    try {
      const { userId } = req.params;

      // Check both student and recruiter tables
      let user = await StudentDetails.findById(userId).select('-password');
      if (!user) {
        user = await Recruiter.findById(userId).select('-password');
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      
      const role = user.companyName ? 'recruiter' : 'student';

      res.json({
        success: true,
        user: {
            ...user.toObject(),
            role // Attach role to the response
        }
      });

    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  },

  // Update user profile (NEW)
  updateProfile: async (req, res) => {
    try {
      const { userId } = req.params;
      const { mobile, address, pincode } = req.body;
      
      // Check both student and recruiter tables
      let user = await StudentDetails.findById(userId);
      let role = 'student';

      if (!user) {
        user = await Recruiter.findById(userId);
        role = 'recruiter';

        // Additional fields for recruiter update
        if (role === 'recruiter') {
            const { companyName, companyEmail, age } = req.body;
            if (companyName !== undefined) user.companyName = companyName;
            if (companyEmail !== undefined) user.companyEmail = companyEmail;
            if (age !== undefined) user.age = age;
        }
      }


      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      // Update common allowed fields
      if (mobile !== undefined) user.phoneNumber = mobile;
      if (address !== undefined) user.address = address;
      if (pincode !== undefined) user.pincode = pincode;

      await user.save();

      const { password: _, ...userData } = user._doc;

      res.json({
        success: true,
        message: "Profile updated successfully",
        user: {
            ...userData,
            role // Return the role
        }
      });

    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }
};