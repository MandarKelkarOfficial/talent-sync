/**
 * @fileoverview Recruiter Model Schema
 * @author Rutuja Patwari
 * @date 2025-11-20
 * * @description
 * Defines the Mongoose schema for Recruiter accounts.
 */

import mongoose from "mongoose";

const recruiterSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  phoneNumber: { type: String, required: true },
  companyName: { type: String, required: true, trim: true },
  companyEmail: { type: String, required: true, lowercase: true },
  address: { type: String, default: "" },
  age: { type: Number },
  isVerified: { type: Boolean, default: false },
  lastLogin: { type: Date },
  accountStatus: { type: String, enum: ["active", "suspended", "deactivated"], default: "active" }
}, { timestamps: true });

// Index for better query performance
recruiterSchema.index({ email: 1 });
recruiterSchema.index({ companyName: 1 });

export default mongoose.model("Recruiter", recruiterSchema);