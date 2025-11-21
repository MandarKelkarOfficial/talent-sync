/**
 * Resume Creation UI Page
 * Author: Mandar K.
 */

import React, { useState } from "react";

const ResumeCreation = () => {
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");

  const handleGenerate = () => {
    alert("Resume created successfully! (Connect backend here)");
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Resume Creation
      </h2>

      {/* Name */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700">Full Name</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-md mt-1"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* Summary */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700">Profile Summary</label>
        <textarea
          rows={3}
          className="w-full px-3 py-2 border rounded-md mt-1"
          placeholder="Short profile summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </div>

      {/* Skills */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700">Skills</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-md mt-1"
          placeholder="e.g., JavaScript, React, Node.js"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
        />
      </div>

      {/* Experience */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700">Experience</label>
        <textarea
          rows={3}
          className="w-full px-3 py-2 border rounded-md mt-1"
          placeholder="Add work experience"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
        />
      </div>

      {/* Education */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700">Education</label>
        <textarea
          rows={3}
          className="w-full px-3 py-2 border rounded-md mt-1"
          placeholder="Add educational background"
          value={education}
          onChange={(e) => setEducation(e.target.value)}
        />
      </div>

      <button
        onClick={handleGenerate}
        className="w-full py-3 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 transition"
      >
        Generate Resume
      </button>
    </div>
  );
};

export default ResumeCreation;
