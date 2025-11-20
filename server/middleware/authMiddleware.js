/**
 * @author Mandar K.
 * @date 2025-09-13
 * */

// server/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import StudentDetails from '../models/StudentDetails.js';
import Recruiter from '../models/Recruiter.js'; // NEW: Import Recruiter Model
import dotenv from 'dotenv';

dotenv.config();

export const protect = async (req, res, next) => {
  let token;

  console.log('\n=== AUTH MIDDLEWARE ===');
  console.log('Authorization header:', req.headers.authorization);

  // Check for the token in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (e.g., "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];
      console.log('Token found:', token.substring(0, 30) + '...');

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully:', decoded);
      
      // Get user role from decoded payload, default to 'student' if not present
      const role = decoded.role || 'student'; 
      console.log('User role inferred as:', role);

      let user = null;
      if (role === 'recruiter') {
        user = await Recruiter.findById(decoded.id).select('-password');
      } else {
        user = await StudentDetails.findById(decoded.id).select('-password');
      }

      req.user = user;
      // We keep req.studentId for backward compatibility with student-specific routes (like /api/students/filter)
      // but note that recruiter routes will use req.user.role to enforce logic.
      req.studentId = decoded.id; 
      req.user.role = role; // Ensure role is consistently attached to req.user

      if (!req.user) {
         console.log(`${role} not found in database for ID:`, decoded.id);
         return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      console.log(`${role} found:`, req.user.name);
      return next(); // Proceed to the next middleware/controller
    } catch (error) {
      console.error('Token verification error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  // No token found
  console.log('No Bearer token found in authorization header');
  return res.status(401).json({ success: false, message: 'Not authorized, no token' });
};