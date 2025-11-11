/**
 *  @author Mandar K.
 * @date 2025-09-13
 * 
 */


import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    jobId: { type: String, required: true, unique: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "StudentDetails", required: true },

    filename: { type: String },
    contentType: { type: String },
    source: { type: String }, // e.g. "upload" | "url"
    createdAt: { type: Date, default: Date.now },

    extracted: {
      text_snippet: { type: String },
      issuer: {
        name: { type: String },
        domain: { type: String },
      },
      qr_urls: [{ type: String }],
    },

    verification: {
      status: { type: String, enum: ["valid", "suspicious", "invalid", "rejected"] },
      confidence: { type: Number },
      heuristics: {
        score: { type: Number },
        methods: [{ type: String }],
        evidence: { type: mongoose.Schema.Types.Mixed }, // flexible field
      },
      qr_verification: {
        ok: { type: Boolean },
        score: { type: Number },
        methods: [{ type: String }],
        evidence: { type: mongoose.Schema.Types.Mixed },
      },
      checkedAt: { type: Date },
    },

    encrypted_blob: {
      nonce_b64: { type: String },
      ciphertext_b64: { type: String },
      saved_path: { type: String },
    },

    blob_hash_sha256: { type: String },
  },
  { timestamps: true }
);

const Certificate = mongoose.model("Certificate", certificateSchema);
export default Certificate;