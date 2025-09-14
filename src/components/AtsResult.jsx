/**
 *  @author Mandar K.
 * @date 2025-09-13
 * 
 */

import React from 'react';

const AtsSummary = ({ summary, score, matchInfo, detailedInsights }) => {
  if (!summary) return null;

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score) => {
    if (score >= 85) return 'bg-green-100';
    if (score >= 70) return 'bg-blue-100';
    if (score >= 50) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md w-full">
      <h3 className="text-xl font-bold text-gray-800 mb-4">ATS Analysis Summary</h3>
      
      {/* Score Display */}
      <div className={`flex items-center mb-4 p-4 rounded-lg ${getScoreBackground(score)}`}>
        <div className="flex items-center">
          <p className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}%</p>
          <div className="ml-4">
            <p className={`text-2xl font-semibold ${getScoreColor(score)}`}>{matchInfo?.level} Match</p>
            <p className="text-sm text-gray-600">{matchInfo?.description}</p>
          </div>
        </div>
      </div>

      {/* Summary Text */}
      <div className="mb-4">
        <p className="text-gray-700">{summary}</p>
      </div>

      {/* Enhanced Insights */}
      {detailedInsights && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-semibold text-gray-800 mb-2">Match Statistics</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Keywords Matched: {detailedInsights.matchedCount} / {detailedInsights.totalKeywords}</p>
              <p>Match Rate: {detailedInsights.keywordMatchRate}</p>
              <p>Skills Listed: {detailedInsights.skillsCount}</p>
              <p>Experience Entries: {detailedInsights.experienceCount}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-semibold text-gray-800 mb-2">Analysis Type</h4>
            <div className="text-sm text-gray-600">
              <p className="flex items-center">
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                  detailedInsights.hasStructuredData ? 'bg-green-500' : 'bg-yellow-500'
                }`}></span>
                {detailedInsights.hasStructuredData ? 'AI-Enhanced Analysis' : 'Basic Analysis'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ImprovementSuggestions = ({ tips, keywords, detailedInsights }) => {
  if (!tips || tips.length === 0) return null;
  
  return (
    <div className="space-y-6">
      {/* Action Items */}
      <div className="p-6 bg-white rounded-lg shadow-md w-full">
        <h3 className="text-xl font-bold text-gray-800 mb-3">🎯 Action Items</h3>
        <ul className="space-y-2 list-disc list-inside text-gray-600">
          {tips.map((tip, index) => (
            <li key={index} className="leading-relaxed">{tip}</li>
          ))}
        </ul>
      </div>

      {/* Strengths */}
      {detailedInsights?.strengths && detailedInsights.strengths.length > 0 && (
        <div className="p-6 bg-green-50 rounded-lg shadow-md w-full">
          <h3 className="text-xl font-bold text-green-800 mb-3">✅ Strengths</h3>
          <ul className="space-y-2 list-disc list-inside text-green-700">
            {detailedInsights.strengths.map((strength, index) => (
              <li key={index} className="leading-relaxed">{strength}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Areas for Improvement */}
      {detailedInsights?.improvementAreas && detailedInsights.improvementAreas.length > 0 && (
        <div className="p-6 bg-orange-50 rounded-lg shadow-md w-full">
          <h3 className="text-xl font-bold text-orange-800 mb-3">🔧 Areas for Improvement</h3>
          <ul className="space-y-2 list-disc list-inside text-orange-700">
            {detailedInsights.improvementAreas.map((area, index) => (
              <li key={index} className="leading-relaxed">{area}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Keywords Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matched Keywords */}
        {keywords && keywords.length > 0 && (
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-800 mb-3">✅ Matched Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {keywords.slice(0, 15).map((keyword, index) => (
                <span key={index} className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {keyword}
                </span>
              ))}
              {keywords.length > 15 && (
                <span className="text-gray-500 text-xs">+{keywords.length - 15} more</span>
              )}
            </div>
          </div>
        )}

        {/* Missing Keywords */}
        {detailedInsights?.missingKeywords && detailedInsights.missingKeywords.length > 0 && (
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-800 mb-3">❌ Missing Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {detailedInsights.missingKeywords.slice(0, 10).map((keyword, index) => (
                <span key={index} className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {keyword}
                </span>
              ))}
              {detailedInsights.missingKeywords.length > 10 && (
                <span className="text-gray-500 text-xs">+{detailedInsights.missingKeywords.length - 10} more</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ResumeDataPreview = ({ resume }) => {
  if (!resume?.structuredData) return null;

  const { personalInfo, skills, experience, education, projects } = resume.structuredData;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md w-full">
      <h3 className="text-xl font-bold text-gray-800 mb-4">📄 Extracted Resume Data</h3>
      
      <div className="space-y-4">
        {/* Personal Info */}
        {personalInfo && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Personal Information</h4>
            <div className="bg-gray-50 p-3 rounded text-sm">
              {personalInfo.name && <p><span className="font-medium">Name:</span> {personalInfo.name}</p>}
              {personalInfo.email && <p><span className="font-medium">Email:</span> {personalInfo.email}</p>}
              {personalInfo.phone && <p><span className="font-medium">Phone:</span> {personalInfo.phone}</p>}
              {personalInfo.location && <p><span className="font-medium">Location:</span> {personalInfo.location}</p>}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Skills ({skills.length})</h4>
            <div className="flex flex-wrap gap-1">
              {skills.slice(0, 12).map((skill, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {skill}
                </span>
              ))}
              {skills.length > 12 && (
                <span className="text-gray-500 text-xs">+{skills.length - 12} more</span>
              )}
            </div>
          </div>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Experience ({experience.length})</h4>
            <div className="space-y-2">
              {experience.slice(0, 3).map((exp, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded text-sm">
                  <div className="font-medium">{exp.position} at {exp.company}</div>
                  <div className="text-gray-600">{exp.startDate} - {exp.endDate}</div>
                </div>
              ))}
              {experience.length > 3 && (
                <p className="text-gray-500 text-xs">+{experience.length - 3} more positions</p>
              )}
            </div>
          </div>
        )}

        {/* Education & Projects Summary */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {education && education.length > 0 && (
            <div>
              <span className="font-medium text-gray-700">Education:</span> {education.length} entries
            </div>
          )}
          {projects && projects.length > 0 && (
            <div>
              <span className="font-medium text-gray-700">Projects:</span> {projects.length} entries
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { AtsSummary, ImprovementSuggestions, ResumeDataPreview };