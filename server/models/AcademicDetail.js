import mongoose from "mongoose";

const academicDetailSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentDetails",
      required: true,
    },
    schoolName: { type: String, required: true },
    degree: { type: String, required: true }, // e.g. BTech, Diploma, etc.
    specialization: { type: String },
    course: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    grade: { type: String }, // e.g. "8.5 CGPA" or "85%"
  },
  { timestamps: true }
);

const AcademicDetail = mongoose.model("AcademicDetail", academicDetailSchema);
export default AcademicDetail;
