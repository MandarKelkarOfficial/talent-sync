/**
 *  @author Mandar K.
 * @date 2025-09-13
 * 
 */


import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';


const FileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const CertificateUploader = () => {
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); 
    const [message, setMessage] = useState('');
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (selectedFile.type !== 'application/pdf') {
            setStatus('error');
            setMessage('Invalid file type. Please upload a PDF.');
            return;
        }
        if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
            setStatus('error');
            setMessage('File is too large. Please upload a PDF under 10MB.');
            return;
        }
        setFile(selectedFile);
        setStatus('idle');
        setMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !user) {
            setStatus('error');
            setMessage('Please select a file and ensure you are logged in.');
            return;
        }

        setStatus('uploading');
        setMessage('Uploading and verifying... This may take a moment.');

        const formData = new FormData();
        // The backend expects the file to be named 'file', not 'certificate'
        formData.append('file', file);

        // ❗ REMOVED: We no longer need to send studentId and studentName manually.
        // The authentication token handled by our new 'api' service does this securely.
        // formData.append('studentId', user._id);
        // formData.append('studentName', user.name);

        try {
            // ✅ CORRECTED: Use the 'api' instance for the request.
            // The full URL is no longer needed because we set a baseURL in api.js.
            const response = await api.post('/api/certificates/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setStatus('success');
            setMessage(response.data.message || 'Certificate processed successfully!');
            setFile(null); // Clear the file input on success
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'An error occurred during verification.');
        }
    };

    return (
        <div className="max-w-2xl p-8 mx-auto bg-white border border-gray-100 rounded-xl shadow-lg">
            <h2 className="mb-2 text-2xl font-bold text-gray-800">Certificate Verification</h2>
            <p className="mb-6 text-sm text-gray-500">Upload your PDF certificate to have it verified and stored securely.</p>

            <form onSubmit={handleSubmit}>
                <div
                    className="relative p-6 text-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="application/pdf"
                        className="hidden"
                    />
                    <div className="flex flex-col items-center">
                        <FileIcon />
                        {file ? (
                            <p className="mt-2 text-sm font-medium text-gray-700">{file.name}</p>
                        ) : (
                            <p className="mt-2 text-sm text-gray-600">Click to upload or drag & drop a PDF</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">PDF only, max 10MB</p>
                    </div>
                </div>

                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`mt-4 p-3 rounded-lg text-sm text-center
                                ${status === 'success' ? 'bg-green-50 text-green-800' : ''}
                                ${status === 'error' ? 'bg-red-50 text-red-800' : ''}
                                ${status === 'uploading' ? 'bg-blue-50 text-blue-800' : ''}
                            `}
                        >
                            {message}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-6">
                    <button
                        type="submit"
                        disabled={!file || status === 'uploading'}
                        className="flex items-center justify-center w-full px-4 py-3 font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {status === 'uploading' ? (
                            <>
                                <div className="w-5 h-5 mr-3 border-b-2 border-white rounded-full animate-spin"></div>
                                <span>Processing...</span>
                            </>
                        ) : (
                            'Verify My Certificate'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CertificateUploader;