// import mongoose from 'mongoose';

// const resumeSchema = new mongoose.Schema({
//   studentId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     ref: 'User'
//   },
//   title: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   filename: {
//     type: String,
//     required: true
//   },
//   contentType: {
//     type: String,
//     required: true
//   },
  
//   // Basic extracted info
//   email: {
//     type: String,
//     default: null
//   },
//   phone: {
//     type: String,
//     default: null
//   },
  
//   // Enhanced fields from AI parsing
//   skills: [{
//     type: String,
//     trim: true
//   }],
  
//   education: [{
//     institution: {
//       type: String,
//       trim: true
//     },
//     degree: {
//       type: String,
//       trim: true
//     },
//     startDate: {
//       type: String
//     },
//     endDate: {
//       type: String
//     },
//     gpa: {
//       type: String
//     }
//   }],
  
//   experience: [{
//     company: {
//       type: String,
//       trim: true
//     },
//     position: {
//       type: String,
//       trim: true
//     },
//     startDate: {
//       type: String
//     },
//     endDate: {
//       type: String
//     },
//     description: {
//       type: String,
//       trim: true
//     }
//   }],
  
//   projects: [{
//     name: {
//       type: String,
//       trim: true
//     },
//     description: {
//       type: String,
//       trim: true
//     },
//     technologies: [{
//       type: String,
//       trim: true
//     }],
//     url: {
//       type: String,
//       trim: true
//     }
//   }],
  
//   certifications: [{
//     name: {
//       type: String,
//       trim: true
//     },
//     issuer: {
//       type: String,
//       trim: true
//     },
//     date: {
//       type: String
//     }
//   }],
  
//   // Store the full text for ATS analysis
//   fullText: {
//     type: String,
//     required: true
//   },
  
//   // Store the complete structured data from AI
//   structuredData: {
//     personalInfo: {
//       name: String,
//       email: String,
//       phone: String,
//       location: String,
//       linkedin: String,
//       github: String
//     },
//     skills: [String],
//     experience: [{
//       company: String,
//       position: String,
//       startDate: String,
//       endDate: String,
//       description: String
//     }],
//     education: [{
//       institution: String,
//       degree: String,
//       startDate: String,
//       endDate: String,
//       gpa: String
//     }],
//     projects: [{
//       name: String,
//       description: String,
//       technologies: [String],
//       url: String
//     }],
//     certifications: [{
//       name: String,
//       issuer: String,
//       date: String
//     }]
//   },
  
//   // ATS scoring data
//   ats: {
//     score: {
//       type: Number,
//       min: 0,
//       max: 100
//     },
//     summary: String,
//     matchedKeywords: [String],
//     improvementTips: [String],
//     matchInfo: {
//       level: {
//         type: String,
//         enum: ['Low', 'Good', 'High', 'Top']
//       },
//       description: String
//     }
//   },
  
//   // Metadata
//   uploadedAt: {
//     type: Date,
//     default: Date.now
//   },
//   aiEnhanced: {
//     type: Boolean,
//     default: false
//   },
//   parseMethod: {
//     type: String,
//     enum: ['basic', 'gemini', 'fallback'],
//     default: 'basic'
//   }
// }, {
//   timestamps: true
// });

// // Index for faster queries
// resumeSchema.index({ studentId: 1, createdAt: -1 });
// resumeSchema.index({ 'ats.score': -1 });

// // Virtual for getting resume age
// resumeSchema.virtual('ageInDays').get(function() {
//   return Math.floor((Date.now() - this.uploadedAt) / (1000 * 60 * 60 * 24));
// });

// // Method to update ATS data
// resumeSchema.methods.updateATS = function(atsData) {
//   this.ats = {
//     ...this.ats,
//     ...atsData
//   };
//   return this.save();
// };

// // Method to get summary stats
// resumeSchema.methods.getSummaryStats = function() {
//   return {
//     skillsCount: this.skills.length,
//     experienceCount: this.experience.length,
//     educationCount: this.education.length,
//     projectsCount: this.projects.length,
//     certificationsCount: this.certifications.length,
//     atsScore: this.ats?.score || null,
//     aiEnhanced: this.aiEnhanced
//   };
// };

// export default mongoose.model('Resume', resumeSchema);



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