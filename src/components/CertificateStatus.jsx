/**
 * @fileoverview Component to display and manage a user's uploaded certificates.
 * @description This component fetches the user's certificates from the backend,
 * displays them in a list with their current verification status, and provides
 * an option to delete each certificate.
 */
import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Use the configured 'api' service for all authenticated requests.

/**
 * A simple SVG icon for the delete button.
 * @returns {JSX.Element}
 */
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const CertificateStatus = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    /**
     * Fetches the user's certificates from the server when the component mounts.
     */
    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                setLoading(true);
                const response = await api.get('/api/certificates');

                if (response.data && response.data.success) {
                    setCertificates(response.data.data);
                } else {
                    throw new Error(response.data.message || 'Failed to fetch certificate data.');
                }
            } catch (err) {
                setError('Failed to load your certificate data. Please try refreshing the page.');
                console.error('Fetch certificates error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCertificates();
    }, []); // The empty dependency array ensures this runs only once.

    /**
     * Handles the deletion of a certificate after user confirmation.
     * @param {string} certificateId - The ID of the certificate to delete.
     */
    const handleDelete = async (certificateId) => {
            try {
                await api.delete(`/api/certificates/${certificateId}`);
                // Instantly update the UI by removing the deleted certificate from the state.
                setCertificates(certificates.filter(cert => cert._id !== certificateId));
            } catch (err) {
                console.error('Failed to delete certificate:', err);
                setError(err.response?.data?.message || 'Could not delete the certificate. Please try again.');
            }
        
    };

    /**
     * Returns Tailwind CSS classes for the status badge based on verification status.
     * @param {string} status - The verification status string.
     * @returns {string} The CSS classes for the badge.
     */
    const getStatusBadge = (status) => {
        const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
        switch (status) {
            case 'valid':
                return `${baseClasses} bg-green-100 text-green-800`;
            case 'suspicious':
                return `${baseClasses} bg-yellow-100 text-yellow-800`;
            case 'invalid':
            case 'rejected':
                return `${baseClasses} bg-red-100 text-red-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    };

    if (loading) {
        return <div className="p-4 text-center text-gray-500">Loading your certificates...</div>;
    }

    return (
        <div className="p-6 mt-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-1 text-2xl font-semibold text-gray-800">My Certificates</h2>
            <p className="mb-4 text-sm text-gray-500">Manage your uploaded and verified certificates.</p>

            {error && <div className="p-3 mb-4 text-center text-red-800 bg-red-100 rounded-lg">{error}</div>}

            {certificates.length === 0 ? (
                <p className="py-4 text-center text-gray-500">You have not uploaded any certificates yet.</p>
            ) : (
                <ul className="divide-y divide-gray-200">
                    {certificates.map((cert) => (
                        <li key={cert._id} className="flex items-center justify-between py-4 space-x-4">
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-700 truncate" title={cert.filename}>
                                    {cert.filename}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Uploaded on: {new Date(cert.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex items-center shrink-0">
                                <span className={getStatusBadge(cert.verification?.status || 'pending')}>
                                    {cert.verification?.status || 'Processing...'}
                                </span>
                                <button
                                    onClick={() => handleDelete(cert._id)}
                                    className="ml-4 p-2 text-gray-400 rounded-full hover:bg-red-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150"
                                    title="Delete Certificate"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CertificateStatus;