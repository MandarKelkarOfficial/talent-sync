// // models/StudentDetails.js
// import mongoose from "mongoose";

// const studentDetailsSchema = new mongoose.Schema({
//   name: { type: String, required: true, trim: true },
//   email: { type: String, required: true, unique: true, lowercase: true },
//   password: { type: String, required: true, minlength: 6 },
//   phoneNumber: { type: String, required: true },
//   address: { type: String, default: "" },   // store whole address string
//   pincode: { type: String, default: "" },   // pincode field
//   dateOfBirth: { type: Date },
//   gender: { type: String, enum: ["Male", "Female", "Other"] },
//   isVerified: { type: Boolean, default: false } // important!
// }, { timestamps: true });

// export default mongoose.model("StudentDetails", studentDetailsSchema);


// models/StudentDetails.js
import mongoose from "mongoose";

const studentDetailsSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  phoneNumber: { type: String, required: true },
  address: { type: String, default: "" },
  pincode: { type: String, default: "" },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  isVerified: { type: Boolean, default: false },
  // Avatar/Profile picture URL (for regular uploads)
  avatarUrl: { type: String, default: "" },
  // Face verification status
  faceVerified: { type: Boolean, default: false },
  // Last login timestamp
  lastLogin: { type: Date },
  // Account status
  accountStatus: { type: String, enum: ["active", "suspended", "deactivated"], default: "active" }
}, { timestamps: true });

// Index for better query performance
studentDetailsSchema.index({ email: 1 });
studentDetailsSchema.index({ phoneNumber: 1 });

export default mongoose.model("StudentDetails", studentDetailsSchema);