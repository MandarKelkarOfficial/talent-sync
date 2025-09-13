

// // export default ResumeUploader;
// import React, { useState } from 'react';
// import axios from 'axios';
// // Corrected import path to be more standard, letting the bundler resolve the extension.
// import { useAuth } from '../context/AuthContext'; 

// const ResumeUploader = ({ onUploadSuccess }) => {
//   const [title, setTitle] = useState('');
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const { user } = useAuth(); // Get user from AuthContext

//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//     setError('');
//     setSuccess('');
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!title || !file) {
//       setError('Please provide both a title and a file.');
//       return;
//     }

//     // Check if user and user ID are available from the context
//     if (!user || !user._id) {
//         setError('You must be logged in to upload a resume.');
//         return;
//     }

//     setLoading(true);
//     setError('');
//     setSuccess('');

//     const formData = new FormData();
//     formData.append('title', title);
//     formData.append('resumeFile', file);
//     // Use the dynamic student ID from the authenticated user object
//     formData.append('studentId', user._id);

//     try {
//       const { data } = await axios.post('http://localhost:5000/api/resumes/upload', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       setSuccess(data.message || 'Resume uploaded successfully!');
//       setTitle('');
//       setFile(null);
      
//       // Ensure the file input element exists before trying to clear it
//       const fileInput = document.getElementById('resume-file-input');
//       if (fileInput) {
//         fileInput.value = ''; 
//       }

//       // Notify the parent component of the new resume data
//       if(onUploadSuccess) onUploadSuccess(data.resume);

//     } catch (err) {
//       setError(err.response?.data?.message || 'An error occurred during upload.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-6 bg-white rounded-lg shadow-md w-full max-w-lg">
//       <h2 className="text-2xl font-bold mb-4 text-gray-800">1. Upload Your Resume</h2>
//       <form onSubmit={handleSubmit}>
//         <div className="mb-4">
//           <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Resume Title</label>
//           <input
//             type="text"
//             id="title"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             placeholder="e.g., Data Scientist Application"
//             className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//             required
//           />
//         </div>
//         <div className="mb-4">
//           <label htmlFor="resume-file-input" className="block text-sm font-medium text-gray-700 mb-1">Resume File (PDF or DOCX)</label>
//           <input
//             type="file"
//             id="resume-file-input"
//             onChange={handleFileChange}
//             className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
//             accept=".pdf,.docx,.doc"
//             required
//           />
//         </div>
//         <button
//           type="submit"
//           disabled={loading || !user} // Disable button if loading or not logged in
//           className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
//         >
//           {loading ? 'Uploading...' : 'Upload & Parse'}
//         </button>
//         {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
//         {success && <p className="text-green-500 text-sm mt-2">{success}</p>}
//         {!user && <p className="text-yellow-600 text-sm mt-2">Please log in to upload a resume.</p>}
//       </form>
//     </div>
//   );
// };

// export default ResumeUploader;



// export default ResumeUploader;
import React, { useState } from 'react';
import axios from 'axios';
// Corrected import path to be more standard, letting the bundler resolve the extension.
import { useAuth } from '../context/AuthContext'; 

const ResumeUploader = ({ onUploadSuccess }) => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth(); // Get user from AuthContext

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
    setSuccess('');
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !file) {
      setError('Please provide both a title and a file.');
      return;
    }

    // Check if user and user ID are available from the context
    if (!user || !user._id) {
        setError('You must be logged in to upload a resume.');
        return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('resumeFile', file);
    // Use the dynamic student ID from the authenticated user object
    formData.append('studentId', user._id);

    try {
      const { data } = await axios.post('http://localhost:5000/api/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess(data.message || 'Resume uploaded successfully!');
      setTitle('');
      setFile(null);
      
      // Ensure the file input element exists before trying to clear it
      const fileInput = document.getElementById('resume-file-input');
      if (fileInput) {
        fileInput.value = ''; 
      }

      // Notify the parent component of the new resume data
      if(onUploadSuccess) onUploadSuccess(data.resume);

    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during upload.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative p-6 bg-white rounded-2xl shadow-lg w-full max-w-lg ring-1 ring-gray-100">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-2xl">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-4 border-indigo-300 border-t-indigo-700 animate-spin" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.12s' }} />
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.24s' }} />
            </div>
            <div className="text-sm text-indigo-700 font-medium">Uploading & analyzing — hang tight!</div>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">1. Upload Your Resume</h2>
          <p className="text-sm text-gray-500 mt-1">We’ll parse and enhance it with AI so you can run ATS checks.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold">Step 1</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Resume Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Data Scientist Application"
            className="w-full px-4 py-2 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="resume-file-input" className="block text-sm font-medium text-gray-700 mb-2">Resume File (PDF or DOCX)</label>

          <div className="flex items-center gap-3">
            <label
              htmlFor="resume-file-input"
              className="flex items-center gap-3 cursor-pointer px-4 py-2 rounded-xl border border-dashed border-gray-200 hover:border-indigo-300 transition bg-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4h10v12M7 20h10" />
              </svg>
              <div className="text-sm text-gray-700">
                <div className="font-medium">Choose file</div>
                <div className="text-xs text-gray-400">PDF, DOCX (max 10MB)</div>
              </div>
            </label>

            <input
              type="file"
              id="resume-file-input"
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.docx,.doc"
              required
              disabled={loading}
            />

            {/* File preview */}
            <div className="ml-auto text-right">
              {file ? (
                <div className="text-sm text-gray-700">
                  <div className="font-medium">{file.name}</div>
                  <div className="text-xs text-gray-400">{formatBytes(file.size)}</div>
                </div>
              ) : (
                <div className="text-sm text-gray-400">No file chosen</div>
              )}
            </div>
          </div>
        </div>

        {/* Upload button */}
        <div>
          <button
            type="submit"
            disabled={loading || !user}
            className={`w-full relative overflow-hidden group inline-flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-medium text-white disabled:opacity-60`}
            style={{ backgroundImage: 'linear-gradient(90deg,#4f46e5 0%, #7c3aed 100%)' }}
          >
            {/* Animated icon */}
            <span className="absolute left-4 transform -translate-x-2 transition-transform group-hover:translate-x-0">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>

            <span className="ml-6">Upload &amp; Parse</span>

            {/* subtle moving shine */}
            <span className="absolute inset-0 opacity-10 bg-gradient-to-r from-white/30 via-white/5 to-transparent transform translate-x-[-40%] group-hover:translate-x-0 transition-transform duration-700" />
          </button>
        </div>

        {/* messages */}
        <div className="space-y-2">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-sm text-green-700">
              {success}
            </div>
          )}
          {!user && (
            <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-100 text-sm text-yellow-700">
              Please log in to upload a resume.
            </div>
          )}
        </div>
      </form>

      {/* Helpful tips footer */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          <strong className="text-gray-700">Pro tip:</strong> Use a clear file name and title so you can find the resume later.
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1 4h1m-6 4h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v11a2 2 0 002 2z" />
          </svg>
          <span>We currently accept PDF and DOCX files. Parsing may take a few seconds.</span>
        </div>
      </div>
    </div>
  );
};

export default ResumeUploader;
