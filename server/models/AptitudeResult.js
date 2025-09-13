import mongoose from 'mongoose';
const { Schema } = mongoose;

const ScoreSchema = new Schema({
  topic: { type: String, required: true },
  score: { type: Number, required: true },
  total: { type: Number, required: true }
});

const AptitudeResultSchema = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'StudentDetails',
    required: true
  },
  testId: {
    type: Schema.Types.ObjectId,
    ref: 'AptitudeTest',
    required: true
  },
  overallScore: {
    type: Number,
    required: true
  },
  scoresByTopic: [ScoreSchema],
  report: {
    personalityInsights: { type: String },
    strengths: [String],
    areasForImprovement: [String],
    overallSummary: { type: String }
  },
  userAnswers: [{
    questionId: Schema.Types.ObjectId,
    answer: String
  }],
  completedAt: {
    type: Date,
    default: Date.now
  }
});

const AptitudeResult = mongoose.model('AptitudeResult', AptitudeResultSchema);
export default AptitudeResult;