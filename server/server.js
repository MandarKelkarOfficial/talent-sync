import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';

// Route imports
import authRoutes from "./routes/authRoutes.js";
import resumeRoutes from './routes/resumeRoutes.js'; 
import aptitudeRoutes from './routes/aptitudeRoutes.js';
import faceProfileRoutes from './routes/faceProfileRoutes.js'; 
import certificateRoutes from './routes/certificateRoutes.js'; 

dotenv.config();

const app = express();

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for face images
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Increased limit for face images

// ADDED: Middleware to serve uploaded files statically from the 'uploads' directory
// This allows the frontend to access uploaded resumes if needed.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection - Using your new connection setup
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'student';

mongoose
  .connect(`${MONGODB_URI}/${DB_NAME}`, {
    // useNewUrlParser and useUnifiedTopology are deprecated but won't cause harm
  })
  .then(() => console.log(`Connected to MongoDB - Database: ${DB_NAME}`))
  .catch((err) => console.error("MongoDB connection error:", err));

// Basic root route
app.get("/", (req, res) => {
  res.send("TalentSync API is running...");
});

// --- API Routes ---
app.use("/api/auth", authRoutes);
app.use('/api/resumes', resumeRoutes); 
app.use('/api/aptitude', aptitudeRoutes);
app.use('/api/face-profile', faceProfileRoutes); 
app.use('/api/certificates', certificateRoutes); 

// Error handling middleware (catches errors from routes)
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Handle multer errors specifically
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: "File size too large. Maximum size allowed is 5MB."
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: "Unexpected file upload."
    });
  }
  
  res.status(500).json({
    success: false,
    message: "Something went wrong on the server!"
  });
});

// 404 handler (catches all other requests)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Database: ${DB_NAME}`);
});