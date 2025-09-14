/**
 *  @author Mandar K.
 * @date 2025-09-13
 * 
 */

// server/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import StudentDetails from '../models/StudentDetails.js';

export const protect = async (req, res, next) => {
  let token;

  // Check for the token in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (e.g., "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token's ID and attach it to the request
      // We also add studentId for consistency with your other code
      req.user = await StudentDetails.findById(decoded.id).select('-password');
      req.studentId = decoded.id; 

      if (!req.user) {
         return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      next(); // Proceed to the next middleware/controller
    } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};