/**
 *  @author Mandar K.
 * @date 2025-09-13
 * 
 */

import React, { useState, useEffect, useCallback } from 'react';

const MAX_JD_CHARS = 12000;

const AtsCalculator = ({ resumes = [], selectedResumeId, onCalculationComplete }) => {
  const [selectedResume, setSelectedResume] = useState(selectedResumeId || '');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState('');
  const [lastResult, setLastResult] = useState(null);

  // Keep selection synced with incoming props and resume list
  useEffect(() => {
    // If parent forces a selectedResumeId, respect it
    if (selectedResumeId) {
      setSelectedResume(selectedResumeId);
      return;
    }

    // If current selectedResume is missing from updated list (deleted), pick first
    if (Array.isArray(resumes) && resumes.length > 0) {
      const found = resumes.find(r => r._id === selectedResume);
      if (!found) {
        setSelectedResume(resumes[0]._id);
      }
    } else {
      setSelectedResume(''); // no resumes available
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumes, selectedResumeId]);

  const getMatchCategory = (score) => {
    if (score >= 85) return { text: "Top Match", color: "text-green-600" };
    if (score >= 70) return { text: "High Match", color: "text-blue-600" };
    if (score >= 50) return { text: "Good Match", color: "text-yellow-600" };
    return { text: "Low Match", color: "text-red-600" };
  };

  const simulateProgress = useCallback(() => {
    const steps = [
      { step: 'Analyzing resume content...', duration: 900 },
      { step: 'Extracting keywords...', duration: 700 },
      { step: 'Comparing with job description...', duration: 1100 },
      { step: 'Generating AI insights...', duration: 1800 },
      { step: 'Calculating final score...', duration: 400 }
    ];

    let accumulated = 0;
    steps.forEach((stepInfo, index) => {
      accumulated += stepInfo.duration;
      setTimeout(() => {
        setAnalysisStep(stepInfo.step);
        setProgress(((index + 1) / steps.length) * 100);
      }, accumulated);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedResume) {
      setError('Please select a resume.');
      return;
    }
    if (!jobDescription.trim()) {
      setError('Please provide a job description.');
      return;
    }
    if (jobDescription.length > MAX_JD_CHARS) {
      setError(`Job description is too long. Max ${MAX_JD_CHARS} characters.`);
      return;
    }

    setLoading(true);
    setProgress(0);
    setAnalysisStep('Starting analysis...');
    simulateProgress();

    try {
      const response = await fetch(`/api/resumes/${selectedResume}/calculate-ats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Analysis failed');
      }

      if (!data.ats || typeof data.ats.score !== 'number') {
        throw new Error('Invalid ATS response from server.');
      }

      const matchInfo = getMatchCategory(data.ats.score);
      const resultObj = {
        ...data.ats,
        matchInfo,
        aiEnhanced: !!data.aiEnhanced,
      };

      // local UI immediate state
      setLastResult(resultObj);

      // pass to parent for further handling (and DB refresh if parent does that)
      if (onCalculationComplete) onCalculationComplete(resultObj);

      setProgress(100);
      setAnalysisStep('Analysis complete!');
      setError('');
    } catch (err) {
      console.error('ATS analysis error:', err);
      setError(err.message || 'An error occurred during analysis.');
      setLastResult(null);
      if (onCalculationComplete) onCalculationComplete(null);
      setProgress(0);
      setAnalysisStep('');
    } finally {
      // small delay so user sees completion
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
        setAnalysisStep('');
      }, 900);
    }
  };

  const selectedResumeData = resumes?.find(r => r._id === selectedResume);

  const renderSummaryCard = () => {
    if (!lastResult) return null;

    const {
      score,
      matchInfo,
      detailedInsights = {},
      matchedKeywords = [],
      improvementTips = []
    } = lastResult;

    const confidence = matchInfo?.confidence ?? lastResult?.analysis?.confidence ?? null;
    const topMatched = matchedKeywords.slice(0, 8);
    const topMissing = (detailedInsights.missingKeywords || detailedInsights.skillsAlignment?.missing || []).slice(0, 8);

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-gray-600">ATS Score</div>
            <div className="flex items-baseline gap-3">
              <div className="text-3xl font-bold text-gray-800">{score}%</div>
              <div className={`text-sm font-medium ${matchInfo?.color || 'text-gray-700'}`}>
                {matchInfo?.text || 'Match'}
              </div>
              {confidence !== null && (
                <div className="ml-2 text-xs text-gray-500">Confidence: {confidence}%</div>
              )}
            </div>
            <div className="mt-2 text-sm text-gray-700">
              {lastResult.summary || lastResult.detailedInsights?.overallFeedback || ''}
            </div>
          </div>

          <div className="w-44">
            <div className="text-xs text-gray-500 mb-1">Top matched keywords</div>
            <div className="flex flex-wrap gap-1">
              {topMatched.length ? topMatched.map((k, i) => (
                <span key={i} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-700">
                  {k}
                </span>
              )) : <span className="text-xs text-gray-400">None</span>}
            </div>

            <div className="text-xs text-gray-500 mt-3 mb-1">Top missing (suggestions)</div>
            <div className="flex flex-wrap gap-1">
              {topMissing.length ? topMissing.map((k, i) => (
                <span key={i} className="px-2 py-1 bg-yellow-50 border border-yellow-100 rounded text-xs text-yellow-800">
                  {k}
                </span>
              )) : <span className="text-xs text-gray-400">None</span>}
            </div>
          </div>
        </div>

        {/* Improvement tips */}
        {improvementTips && improvementTips.length > 0 && (
          <div className="mt-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Recommended actions</div>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              {improvementTips.slice(0, 5).map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // quick resume chips - shows all resumes, clickable to switch
  const renderResumeChips = () => {
    if (!resumes || resumes.length === 0) return null;
    return (
      <div className="mb-4 flex flex-wrap gap-2">
        {resumes.map(r => {
          const isActive = r._id === selectedResume;
          return (
            <button
              key={r._id}
              type="button"
              onClick={() => setSelectedResume(r._id)}
              className={`text-xs px-3 py-1 rounded-full border ${isActive ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200'} focus:outline-none`}
              title={`${r.title} — ${r.filename}`}
            >
              {r.title}{r.ats?.score ? ` • ${r.ats.score}%` : ''}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        ATS Analysis
        <span className="text-sm font-normal text-gray-500 ml-2">Powered by AI</span>
      </h2>

      {/* Resume Info Display */}
      {selectedResumeData && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            <div className="font-medium text-gray-800">{selectedResumeData.title}</div>
            <div className="flex items-center gap-4 mt-1">
              <span>📄 {selectedResumeData.filename}</span>
              {selectedResumeData.structuredData && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">AI Enhanced</span>
              )}
              {selectedResumeData.ats?.score && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  Last Score: {selectedResumeData.ats.score}%
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Resume Selection - ALWAYS show list when there is at least one resume */}
        {resumes && resumes.length > 0 ? (
          <>
            <label className="block text-sm font-medium text-gray-700 mb-2">Choose Resume</label>
            {/* chips for fast switching */}
            {renderResumeChips()}

            {/* explicit select for accessibility / long lists */}
            <div className="mb-4">
              <select
                id="resume-select"
                value={selectedResume}
                onChange={(e) => setSelectedResume(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                disabled={loading}
                required
              >
                <option value="" disabled>-- Select a resume --</option>
                {resumes.map(resume => (
                  <option key={resume._id} value={resume._id}>
                    {resume.title}{resume.structuredData ? ' (AI Enhanced)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <div className="mb-4 text-sm text-gray-500">No resumes available. Upload one to get started.</div>
        )}

        {/* Job Description */}
        <div className="mb-4">
          <label htmlFor="job-description" className="block text-sm font-medium text-gray-700 mb-1">
            Job Description
          </label>
          <textarea
            id="job-description"
            rows="8"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the complete job description here for accurate ATS analysis..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 resize-vertical"
            required
            disabled={loading}
            maxLength={MAX_JD_CHARS}
          />
          <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
            <div>Tip: Include the complete job posting for the most accurate analysis</div>
            <div>{jobDescription.length}/{MAX_JD_CHARS}</div>
          </div>
        </div>

        {/* Progress Bar */}
        {loading && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{analysisStep}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !selectedResume || !jobDescription.trim()}
          className={`w-full py-3 px-4 rounded-md font-medium transition-all duration-200 ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          } text-white`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Analyzing with AI...
            </div>
          ) : (
            'Get AI-Powered ATS Analysis'
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Quick Tips */}
        {!loading && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-2">For Best Results:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Include the complete job description with requirements</li>
              <li>• Ensure your resume contains relevant keywords</li>
              <li>• Use the same terminology as the job posting</li>
            </ul>
          </div>
        )}
      </form>

      {/* Inline result summary for quick glance */}
      {renderSummaryCard()}
    </div>
  );
};

export default AtsCalculator;
