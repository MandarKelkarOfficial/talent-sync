/**
 *  @author Mandar K.
 * @date 2025-09-13
 * 
 */

import mongoose from 'mongoose';
const { Schema } = mongoose;

const QuestionSchema = new Schema({
  topic: {
    type: String,
    required: true,
    enum: ['Personality', 'Technical Skills', 'General Knowledge', 'Quantitative Aptitude', 'Logical Reasoning']
  },
  questionText: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: String,
    required: true
  }
});

const AptitudeTestSchema = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'StudentDetails',
    required: true,
    index: true
  },
  questions: [QuestionSchema],
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const AptitudeTest = mongoose.model('AptitudeTest', AptitudeTestSchema);
export default AptitudeTest;