/**
 *  @author 
 * @date 2025-09-13
 */

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { AtsSummary, ImprovementSuggestions } from '../components/AtsResult';
import { useAuth } from '../context/AuthContext';

const AtsSummaryPage = () => {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [fetchError, setFetchError] = useState('');
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  const fetchResumes = useCallback(async () => {
    setLoading(true);
    try {
      if (!user || !user._id) {
        setResumes([]);
        return;
      }
      const { data } = await axios.get(`/api/resumes?studentId=${user._id}`);
      setResumes(data || []);
    } catch (error) {
      console.error("Résumé fetch failed:", error);
      setFetchError("Unable to load resumes. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const selectedResume = resumes.find(r => r._id === selectedResumeId);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Resume ATS Summaries</h1>
          <p className="mt-2 text-sm text-gray-600">
            View saved ATS results for all your uploaded resumes.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* LEFT: Resume list */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Uploaded Resumes</h2>

            {loading ? (
              <div className="text-sm text-gray-500">Loading resumes...</div>
            ) : fetchError ? (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded">
                {fetchError}
              </div>
            ) : resumes.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-500">
                No resumes found. Upload one from the <strong>Upload & Analyze</strong> page.
              </div>
            ) : (
              <div className="space-y-3">
                {resumes.map((r) => {
                  const isActive = r._id === selectedResumeId;
                  return (
                    <div
                      key={r._id}
                      className={`p-3 rounded-md border cursor-pointer transition 
                          ${isActive ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:bg-gray-50'}
                        `}
                      onClick={() => setSelectedResumeId(r._id)}
                    >
                      <div className="text-sm font-medium text-gray-900">{r.title}</div>
                      <div className="text-xs text-gray-500">{r.filename}</div>

                      {r.ats?.score && (
                        <div className="mt-2 text-xs">
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                            Score: {r.ats.score}%
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: Summary Viewer */}
          <div className="flex flex-col gap-6">
            {!selectedResume ? (
              <div className="p-6 bg-white rounded-lg shadow-md text-center">
                <h3 className="text-lg font-semibold text-gray-700">
                  Select a resume to view its ATS summary
                </h3>
                <p className="text-gray-500 mt-1">Choose any resume from the left.</p>
              </div>
            ) : selectedResume.ats ? (
              <>
                <AtsSummary
                  summary={selectedResume.ats.summary}
                  score={selectedResume.ats.score}
                  matchInfo={selectedResume.ats.matchInfo}
                  detailedInsights={selectedResume.ats.detailedInsights}
                />

                <ImprovementSuggestions
                  tips={selectedResume.ats.improvementTips}
                  keywords={selectedResume.ats.matchedKeywords}
                  detailedInsights={selectedResume.ats.detailedInsights}
                />
              </>
            ) : (
              <div className="p-6 bg-white rounded-lg shadow-md text-center">
                <h3 className="text-lg font-semibold text-gray-800">No analysis available</h3>
                <p className="text-gray-500 mt-1">Run an ATS analysis first.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AtsSummaryPage;
