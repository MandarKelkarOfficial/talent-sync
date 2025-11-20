/**
 *  @author Mandar K.
 * @date 2025-09-13
 * 
 */

// server/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import StudentDetails from '../models/StudentDetails.js';
import dotenv from 'dotenv';

dotenv.config();

export const protect = async (req, res, next) => {
  let token;

  console.log('\n=== AUTH MIDDLEWARE ===');
  console.log('Headers:', req.headers);
  console.log('Authorization header:', req.headers.authorization);

  // Check for the token in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (e.g., "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];
      console.log('Token found:', token.substring(0, 30) + '...');

      // Verify token
      console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'EXISTS' : 'MISSING');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully:', decoded);

      // Get user from the token's ID and attach it to the request
      // We also add studentId for consistency with your other code
      req.user = await StudentDetails.findById(decoded.id).select('-password');
      req.studentId = decoded.id; 

      if (!req.user) {
         console.log('User not found in database for ID:', decoded.id);
         return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      console.log('User found:', req.user.name);
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