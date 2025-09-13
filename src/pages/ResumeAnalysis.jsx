import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ResumeUploader from '../components/ResumeUploader.jsx';
import AtsCalculator from '../components/AtsCalculator.jsx';
import { AtsSummary, ImprovementSuggestions } from '../components/AtsResult.jsx';
import { useAuth } from '../context/AuthContext';

const ResumeAnalysis = () => {
  const [resumes, setResumes] = useState([]);
  const [atsResult, setAtsResult] = useState(null);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // UI state
  const [activeTab, setActiveTab] = useState('analyze'); // 'analyze' | 'summaries'
  const [selectedSummaryResumeId, setSelectedSummaryResumeId] = useState(null);
  const [selectedForAnalyze, setSelectedForAnalyze] = useState(null); // resume id to preselect in analyzer

  const { user } = useAuth();

  const fetchResumes = useCallback(async () => {
    setIsLoadingResumes(true);
    setFetchError('');
    try {
      if (!user || !user._id) {
        setResumes([]);
        return;
      }
      const { data } = await axios.get(`/api/resumes?studentId=${user._id}`);
      setResumes(data || []);
    } catch (error) {
      console.error("Failed to fetch resumes:", error);
      setFetchError('Failed to load resumes. Try refreshing or check your network.');
    } finally {
      setIsLoadingResumes(false);
    }
  }, [user]);

  // initial fetch
  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleUploadSuccess = (newResume) => {
    // Re-fetch resumes after a new one is uploaded; select new resume for quick analysis
    fetchResumes();
    setAtsResult(null);
    if (newResume?._id) {
      setSelectedForAnalyze(newResume._id);
      setActiveTab('analyze');
    }
  };

  const handleCalculationComplete = (result) => {
    // result is either the ATS object or null if failed
    setAtsResult(result);

    // If analysis succeeded, refresh resume list so 'Last Score' chip updates immediately
    if (result) {
      // small debounce to let server finish saving if needed
      setTimeout(() => {
        fetchResumes();
      }, 400);
      // switch to summaries so user sees saved result (optional)
      setActiveTab('summaries');
    }
  };

  // convenience: supply default selected resume id (optional)
  const defaultResumeId = resumes && resumes.length > 0 ? resumes[0]._id : null;

  // when user clicks a resume in Summaries list, show its ATS (if any)
  const handleSelectSummaryResume = (resumeId) => {
    setSelectedSummaryResumeId(resumeId);
    const r = resumes.find(x => x._id === resumeId);
    if (r?.ats) {
      setAtsResult(r.ats);
    } else {
      setAtsResult(null);
    }
  };

  // click "Analyze" from a resume card -> go to analyze tab with that resume selected
  const handleAnalyzeResume = (resumeId) => {
    setSelectedForAnalyze(resumeId);
    setActiveTab('analyze');
    // clear previous result so calculator UI is fresh
    setAtsResult(null);
    // small scroll into view could be added if desired
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Resume Analysis Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Upload resumes, run AI-powered ATS checks, and inspect saved summaries.
          </p>

          {/* Tabs */}
          <div className="mt-6">
            <nav className="inline-flex rounded-lg bg-white shadow-sm ring-1 ring-gray-100">
              <button
                onClick={() => setActiveTab('analyze')}
                className={`px-4 py-2 rounded-l-lg text-sm font-medium transition ${
                  activeTab === 'analyze'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Upload & Analyze
              </button>
              <button
                onClick={() => { setActiveTab('summaries'); setSelectedForAnalyze(null); }}
                className={`px-4 py-2 rounded-r-lg text-sm font-medium transition ${ 
                  activeTab === 'summaries' 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Summaries
                <span className="ml-2 inline-block text-xs font-normal bg-white/10 px-2 py-0.5 rounded-full">
                  {resumes.length}
                </span>
              </button>
            </nav>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* LEFT: depending on activeTab */}
          <div className="flex flex-col gap-8">
            {activeTab === 'analyze' ? (
              <>
                <ResumeUploader onUploadSuccess={handleUploadSuccess} />

                {isLoadingResumes ? (
                  <div className="p-6 bg-white rounded-lg shadow-md">Loading resumes...</div>
                ) : fetchError ? (
                  <div className="p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-red-600 text-sm">{fetchError}</p>
                  </div>
                ) : (
                  <AtsCalculator
                    resumes={resumes}
                    selectedResumeId={selectedForAnalyze || defaultResumeId}
                    onCalculationComplete={handleCalculationComplete}
                  />
                )}
              </>
            ) : (
              // Summaries tab left column: list of resumes
              <div className="p-6 bg-white rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Uploaded Resumes</h2>
                    <p className="text-sm text-gray-500">Select a resume to view its latest analysis.</p>
                  </div>
                  <div>
                    <button
                      onClick={() => { setActiveTab('analyze'); setSelectedForAnalyze(defaultResumeId); }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md shadow hover:bg-indigo-700"
                    >
                      + Analyze New
                    </button>
                  </div>
                </div>

                {resumes.length === 0 ? (
                  <div className="py-12 text-center text-sm text-gray-500">
                    No resumes uploaded yet. Go to <strong>Upload & Analyze</strong> to add one.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {resumes.map(r => {
                      const hasAts = !!r.ats?.score;
                      return (
                        <div key={r._id} className="flex items-center justify-between gap-4 p-3 rounded-lg border border-gray-100 hover:shadow-sm transition">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-600 font-semibold">
                                {r.title?.charAt(0)?.toUpperCase() || 'R'}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-800">{r.title}</div>
                              <div className="text-xs text-gray-500 mt-0.5">{r.filename} • {new Date(r.createdAt).toLocaleDateString()}</div>
                              {hasAts && (
                                <div className="mt-2 text-xs">
                                  <span className="inline-block bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full mr-2">Score: {r.ats.score}%</span>
                                  <span className="inline-block bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                                    {r.ats.matchInfo?.level || r.ats.matchInfo?.description || '—'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSelectSummaryResume(r._id)}
                              className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-md hover:bg-gray-50"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleAnalyzeResume(r._id)}
                              className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                              Analyze
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: summary / result panel */}
          <div className="flex flex-col gap-8">
            {activeTab === 'analyze' ? (
              // show right-side placeholder while analyzing
              atsResult ? (
                <>
                  <AtsSummary 
                    summary={atsResult.summary} 
                    score={atsResult.score}
                    matchInfo={atsResult.matchInfo}
                  />
                  <ImprovementSuggestions 
                    tips={atsResult.improvementTips}
                    keywords={atsResult.matchedKeywords}
                  />
                </>
              ) : (
                <div className="p-6 bg-white rounded-lg shadow-md w-full h-full flex flex-col justify-center items-center text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-700">Your analysis will appear here.</h3>
                  <p className="text-gray-500 mt-1">Run an analysis or select a resume to see details.</p>
                </div>
              )
            ) : (
              // Summaries tab right column -> show selected resume summary or helpful message
              selectedSummaryResumeId ? (
                (() => {
                  const resume = resumes.find(r => r._id === selectedSummaryResumeId);
                  if (!resume) {
                    return (
                      <div className="p-6 bg-white rounded-lg shadow-md text-sm text-gray-500">Resume not found.</div>
                    );
                  }
                  return resume.ats ? (
                    <>
                      <AtsSummary summary={resume.ats.summary} score={resume.ats.score} matchInfo={resume.ats.matchInfo} />
                      <ImprovementSuggestions tips={resume.ats.improvementTips} keywords={resume.ats.matchedKeywords} />
                    </>
                  ) : (
                    <div className="p-6 bg-white rounded-lg shadow-md w-full text-center">
                      <h3 className="text-lg font-semibold text-gray-800">No ATS analysis found</h3>
                      <p className="text-sm text-gray-500 mt-2">Run an analysis to generate insights for this resume.</p>
                      <div className="mt-4">
                        <button
                          onClick={() => handleAnalyzeResume(resume._id)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                          Analyze now
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="p-6 bg-white rounded-lg shadow-md w-full h-full flex flex-col justify-center items-center text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-700">Select a resume to view summary</h3>
                  <p className="text-gray-500 mt-1">Pick any resume on the left to inspect its saved analysis.</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalysis;
