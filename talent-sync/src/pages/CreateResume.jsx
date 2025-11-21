// src/pages/CreateResume.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ResumeCreator from "../components/ResumeCreator";
import { useAuth } from "../context/AuthContext";

const CreateResume = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [createdResume, setCreatedResume] = useState(null);

  const handleCreateSuccess = (resume) => {
    setCreatedResume(resume || null);
    // optionally navigate to summaries or analysis page:
    // navigate('/resume-analysis'); // comment/uncomment as desired
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Create Resume</h1>
          <p className="text-sm text-gray-600 mt-1">
            Build a professional resume step-by-step. Preview is shown below the editor.
          </p>
        </header>

        <div className="bg-white rounded-xl shadow p-6">
          <ResumeCreator onCreateSuccess={handleCreateSuccess} />
        </div>

        {createdResume && (
          <div className="mt-6 p-4 bg-green-50 rounded-md border border-green-100">
            <div className="text-sm text-green-800 font-semibold">Resume created successfully.</div>
            <div className="text-xs text-gray-700 mt-1">It is available in the Summaries list.</div>
            <div className="mt-3">
              <button
                onClick={() => navigate('/resume-analysis')}
                className="px-3 py-2 bg-indigo-600 text-white rounded-md"
              >
                View in Summaries
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateResume;
