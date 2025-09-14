/**
 *  @author Mandar K.
 * @date 2025-09-13
 * 
 */

import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },
  
  // Basic extracted info
  email: String,
  phone: String,
  skills: [String],
  
  // Enhanced structured data from Gemini AI
  education: [{
    institution: String,
    degree: String,
    startDate: String,
    endDate: String,
    gpa: String
  }],
  experience: [{
    company: String,
    position: String,
    startDate: String,
    endDate: String,
    description: String
  }],
  projects: [{
    name: String,
    description: String,
    technologies: [String],
    url: String
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: String
  }],
  
  // Store the complete structured data from Gemini
  structuredData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  
  // Raw text content for ATS analysis
  fullText: {
    type: String,
    required: true,
  },
  
  // Enhanced ATS analysis results
  ats: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    
    // AI-generated summary and insights
    summary: String,
    
    // Detailed analysis from Gemini AI
    detailedInsights: {
      strengths: [String],
      improvementAreas: [String],
      missingKeywords: [String],
      keywordMatchRate: String,
      totalKeywords: Number,
      matchedCount: Number,
      skillsAlignment: {
        matched: [String],
        missing: [String],
        relevanceScore: Number
      },
      experienceRelevance: {
        score: Number,
        feedback: String
      },
      overallFeedback: String
    },
    
    // Matched keywords from job description
    matchedKeywords: [String],
    
    // Improvement suggestions
    improvementTips: [String],
    
    // Match classification
    matchInfo: {
      level: {
        type: String,
        enum: ['Top', 'High', 'Good', 'Low']
      },
      description: String,
      confidence: Number
    },
    
    // Analysis metadata
    analysis: {
      hasStructuredData: Boolean,
      skillsCount: Number,
      experienceCount: Number,
      bonusPoints: Number,
      aiEnhanced: Boolean,
      lastAnalyzed: {
        type: Date,
        default: Date.now
      }
    },
    
    // Store the job description used for analysis
    jobDescriptionHash: String, // Hash of the JD to avoid re-analysis
    analyzedAt: {
      type: Date,
      default: Date.now
    }
  },
  
}, {
  timestamps: true,
});

// Index for efficient querying
resumeSchema.index({ studentId: 1, createdAt: -1 });
resumeSchema.index({ 'ats.score': -1 });

export default mongoose.model('Resume', resumeSchema);