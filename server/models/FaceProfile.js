// models/FaceProfile.js
import mongoose from "mongoose";

const faceProfileSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'StudentDetails', 
    required: true, 
    unique: true 
  },
  faceImageBlob: { 
    type: Buffer, 
    required: true 
  },
  imageMetadata: {
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    dimensions: {
      width: { type: Number },
      height: { type: Number }
    }
  },
  faceDescriptor: {
    type: [Number], // Array of numbers for face recognition descriptor
    default: []
  },
  captureMetadata: {
    captureDate: { type: Date, default: Date.now },
    deviceInfo: { type: String },
    confidence: { type: Number }, // Face detection confidence score
    quality: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
  },
  isActive: { type: Boolean, default: true },
  verificationCount: { type: Number, default: 0 },
  lastVerification: { type: Date }
}, { timestamps: true });

// Index for faster queries
faceProfileSchema.index({ studentId: 1 });
faceProfileSchema.index({ isActive: 1 });

export default mongoose.model("FaceProfile", faceProfileSchema);