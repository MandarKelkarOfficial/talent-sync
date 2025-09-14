// /**
//  * @fileoverview Certificate Controller for TalentSync
//  * @author Mandar K.
//  * @date 2025-09-13
//  *
//  * @description
//  * This controller manages the lifecycle of certificate verification. It handles:
//  * 1.  Receiving certificate uploads from authenticated students.
//  * 2.  Performing local text extraction and analysis using Gemini and heuristics.
//  * 3.  Forwarding the certificate and extracted metadata to the Python (FastAPI) microservice.
//  * 4.  Receiving the final verification results back from the Python service via a webhook.
//  * 5.  Providing an endpoint for students to view their own certificate statuses.
//  */

// import fs from 'fs';
// import path from 'path';
// import axios from 'axios';
// import FormData from 'form-data';
// import Certificate from '../models/Certificate.js';
// import crypto from 'crypto';

// // --- Configuration ---
// const FASTAPI_ENDPOINT = process.env.FASTAPI_VERIFY_ENDPOINT || 'http://localhost:8000/verify';

// // --- Helper Functions ---

// /**
//  * Normalizes a name string by converting to lowercase, removing titles,
//  * punctuation, and diacritics, and collapsing whitespace.
//  * @param {string} str - The name string to normalize.
//  * @returns {string} The normalized name.
//  */
// function normalizeName(str) {
//     if (!str || typeof str !== 'string') return '';
//     let s = str.trim().toLowerCase();
//     s = s.replace(/^(mr|mrs|ms|miss|dr|prof|mx|smt|shri|sri|late|shreemati|shrimati|msr)\.?\s+/i, '');
//     s = s.replace(/[.,'"\(\)\[\]\/\\@#*&:;<>?!|`~]/g, ' ');
//     s = s.normalize ? s.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : s;
//     s = s.replace(/\s+/g, ' ').trim();
//     return s;
// }

// /**
//  * Extracts the first and last words from a normalized name.
//  * @param {string} name - The full name.
//  * @returns {{first: string|null, last: string|null}} An object with the first and last name tokens.
//  */
// function extractFirstAndLast(name) {
//     const norm = normalizeName(name);
//     if (!norm) return { first: null, last: null };
//     const tokens = norm.split(' ').filter(Boolean);
//     if (tokens.length === 0) return { first: null, last: null };
//     return { first: tokens[0], last: tokens[tokens.length - 1] };
// }

// /**
//  * Compares two names by matching their first and last tokens after normalization.
//  * @param {string} userName - The first name to compare (e.g., from the logged-in user).
//  * @param {string} certName - The second name to compare (e.g., from the certificate).
//  * @returns {boolean} True if the names are considered a match.
//  */
// function namesMatch(userName, certName) {
//     if (!userName || !certName) return false;
//     const u = extractFirstAndLast(userName);
//     const c = extractFirstAndLast(certName);
//     if (!u.first || !u.last || !c.first || !c.last) {
//         return u.first === c.first && u.last === c.last;
//     }
//     return u.first === c.first && u.last === c.last;
// }

// /**
//  * Extracts text from a PDF buffer, with fallbacks.
//  * @param {Buffer} buffer - The PDF file buffer.
//  * @returns {Promise<string>} The extracted text content.
//  */
// async function extractTextFromPDFBuffer(buffer) {
//     try {
//         const mod = await import('pdf-parse-new').catch(() => null);
//         if (mod && mod.default) {
//             const data = await mod.default(buffer);
//             if (data?.text?.trim()) return data.text.trim();
//         }
//     } catch (e) { /* ignore */ }
//     return ''; // Simplified for brevity; your original OCR logic is fine here.
// }


// /**
//  * Sends raw text to the Gemini API to extract structured data.
//  * @param {string} rawText - The text extracted from the certificate.
//  * @returns {Promise<object|null>} A parsed JSON object with certificate data or null on failure.
//  */
// async function askGeminiToExtractCertificateData(rawText) {
//     if (!rawText || rawText.trim().length === 0) return null;

//     const prompt = `
//     You are a strict JSON extractor. Given the document text below, extract the recipient name and other obvious fields and return ONLY valid JSON.
//     Return exactly this JSON shape:
//     {
//       "recipientName": "Full recipient name",
//       "certificateTitle": "Title of certificate",
//       "issuer": "Issuing organization",
//       "dateIssued": "date if present"
//     }
//     Document Text:
//     ${rawText}`;

//     const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`;
//     try {
//         const body = { contents: [{ parts: [{ text: prompt }] }] };
//         const resp = await axios.post(url, body, { headers: { 'Content-Type': 'application/json' } });
//         const geminiText = resp.data?.candidates?.[0]?.content?.parts?.[0]?.text;
//         if (!geminiText) return null;
//         const jsonMatch = geminiText.match(/```json\s*([\s\S]*?)\s*```/i) || [null, geminiText];
//         const jsonStr = jsonMatch[1] || geminiText;
//         return JSON.parse(jsonStr.trim());
//     } catch (err) {
//         console.error('Gemini API error:', err.response?.data || err.message);
//         return null;
//     }
// }

// /**
//  * Finds a name in text using regex patterns as a fallback.
//  * @param {string} text - The text to search within.
//  * @param {string} providedStudentName - The student's name to use as a hint.
//  * @returns {string|null} The extracted name or null.
//  */
// function findNameHeuristics(text, providedStudentName = null) {
//     if (!text) return null;
//     const patterns = [
//         /This\s+is\s+to\s+certify\s+that[:,\s]*([A-Z][A-Za-z ,.'-]{2,120})/i,
//         /awarded\s+to[:,\s]*([A-Z][A-Za-z ,.'-]{2,120})/i,
//         /presented\s+to[:,\s]*([A-Z][A-Za-z ,.'-]{2,120})/i,
//     ];
//     for (const rx of patterns) {
//         const m = text.match(rx);
//         if (m && m[1] && m[1].trim().length > 2) return m[1].trim();
//     }
//     if (providedStudentName && text.toLowerCase().includes(providedStudentName.toLowerCase())) {
//         return providedStudentName;
//     }
//     return null;
// }

// // --- Main Controller Logic ---

// export const certificateController = {
//     /**
//      * @route   POST /api/certificates/upload
//      * @desc    Accepts a certificate upload from an authenticated user, processes it,
//      * and forwards it to the verification microservice.
//      * @access  Private (requires authentication token)
//      */
//     uploadAndVerify: async (req, res) => {
//         // --- ✅ CORRECTED SECTION ---
//         // The `protect` middleware has already verified the token and attached
//         // the user's information to the request object (`req`).
//         // We must use `req.studentId` and `req.user.name` now.
//         const studentId = req.studentId;
//         const studentName = req.user?.name; // Safely access the name from the user object
//         const file = req.file;

//         console.log(`Received upload request from studentId: ${studentId}, studentName: ${studentName}, file: ${file?.originalname}`);

//         // Validate that we have all necessary information after authentication.
//         if (!file || !studentId || !studentName) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Missing file or student authentication data. Please log in and try again.'
//             });
//         }
//         // --- END OF CORRECTION ---

//         try {
//             // Step 1: Extract text content from the uploaded file buffer.
//             const rawText = await extractTextFromPDFBuffer(file.buffer);
//             if (!rawText || rawText.length < 10) {
//                 return res.status(400).json({
//                     success: false,
//                     message: 'Could not extract readable text from the certificate.'
//                 });
//             }

//             // Step 2: Use AI and heuristics to find the recipient's name in the text.
//             const geminiParsed = await askGeminiToExtractCertificateData(rawText);
//             let extractedName = geminiParsed?.recipientName || findNameHeuristics(rawText, studentName);
//             let extractionMethod = geminiParsed?.recipientName ? 'gemini_json' : 'heuristic';

//             if (!extractedName) {
//                 return res.status(400).json({
//                     success: false,
//                     message: 'Failed to extract recipient name from the certificate.'
//                 });
//             }

//             // Step 3: Validate that the name on the certificate matches the logged-in user.
//             if (!namesMatch(studentName, extractedName)) {
//                 return res.status(400).json({
//                     success: false,
//                     message: `Validation failed: Name on certificate ("${extractedName}") does not match the logged-in user ("${studentName}").`
//                 });
//             }

//             // Step 4: Prepare and forward the data to the FastAPI microservice.
//             const formData = new FormData();
//             formData.append('file', file.buffer, {
//                 filename: file.originalname,
//                 contentType: file.mimetype,
//             });

//             // ✅ THIS METADATA PAYLOAD IS NOW CORRECTLY POPULATED
//             const metadata = {
//                 studentId, // Sourced from the authenticated user token
//                 providedName: studentName,
//                 extractedName,
//                 extractionMethod,
//                 geminiParsed: geminiParsed || null,
//                 rawTextHash: crypto.createHash('sha256').update(rawText).digest('hex')
//             };
//             formData.append('metadata', JSON.stringify(metadata));

//             const fastApiResponse = await axios.post(FASTAPI_ENDPOINT, formData, {
//                 headers: { ...formData.getHeaders(), 'X-User': studentName },
//                 timeout: 120000
//             });

//             // Step 5: Create a preliminary record in the local database.
//             await Certificate.updateOne(
//                 { jobId: fastApiResponse.data.jobId },
//                 {
//                     $set: {
//                         studentId,
//                         filename: file.originalname,
//                         contentType: file.mimetype,
//                         source: 'upload',
//                         verification: { status: 'pending' },
//                         blob_hash_sha256: crypto.createHash('sha256').update(file.buffer).digest('hex')
//                     }
//                 },
//                 { upsert: true }
//             );

//             // Step 6: Acknowledge the request was accepted for background processing.
//             return res.status(202).json({
//                 success: true,
//                 message: 'Certificate accepted for verification. The result will be available shortly.',
//                 jobId: fastApiResponse.data.jobId,
//             });

//         } catch (error) {
//             console.error('Certificate processing error:', error.response?.data || error.message || error);
//             return res.status(500).json({
//                 success: false,
//                 message: 'An internal error occurred while processing the certificate.'
//             });
//         }
//     },

//     /**
//      * @route   POST /api/certificates/save-result
//      * @desc    Webhook endpoint for the FastAPI service to post final verification results.
//      * @access  Public (but should be secured, e.g., via IP whitelist or a secret key)
//      */
//     saveVerificationResult: async (req, res) => {
//         try {
//             const verificationData = req.body;
//             if (!verificationData.jobId || !verificationData.userid) {
//                 return res.status(400).json({ success: false, message: 'Missing required jobId or userid.' });
//             }

//             await Certificate.updateOne(
//                 { jobId: verificationData.jobId },
//                 {
//                     $set: {
//                         studentId: verificationData.userid, // This now contains the correct studentId
//                         filename: verificationData.filename,
//                         contentType: verificationData.contentType,
//                         source: verificationData.source,
//                         extracted: verificationData.extracted,
//                         verification: verificationData.verification,
//                         encrypted_blob: verificationData.encrypted_blob,
//                         blob_hash_sha256: verificationData.blob_hash_sha256,
//                     }
//                 },
//                 { upsert: true }
//             );

//             console.log(`✅ Successfully saved verification for job: ${verificationData.jobId}`);
//             res.status(200).json({ success: true, message: 'Result saved successfully.' });

//         } catch (error) {
//             console.error('Error saving verification result:', error);
//             res.status(500).json({ success: false, message: 'Failed to save verification result.' });
//         }
//     },

//     /**
//      * @route   GET /api/certificates/
//      * @desc    Retrieves all certificates for the currently logged-in student.
//      * @access  Private (requires authentication token)
//      */
//     getCertificatesForStudent: async (req, res) => {
//         try {
//             if (!req.studentId) {
//                 return res.status(401).json({ success: false, message: 'Not authorized.' });
//             }

//             const certificates = await Certificate.find({ studentId: req.studentId }).sort({ createdAt: -1 });

//             res.status(200).json({
//                 success: true,
//                 count: certificates.length,
//                 data: certificates,
//             });
//         } catch (error) {
//             console.error('Error fetching certificates:', error);
//             res.status(500).json({ success: false, message: 'Server error while fetching certificates.' });
//         }
//     },


//     /**
//         * @route   DELETE /api/certificates/:id
//         * @desc    Deletes a specific certificate for the logged-in user.
//         * @access  Private
//         */
//     deleteCertificate: async (req, res) => {
//         try {
//             const certificateId = req.params.id;
//             const studentId = req.studentId; // From the 'protect' middleware

//             // Find the certificate and ensure it belongs to the authenticated user before deleting.
//             // This is a critical security step to prevent users from deleting others' certificates.
//             const certificate = await Certificate.findOneAndDelete({
//                 _id: certificateId,
//                 studentId: studentId,
//             });

//             if (!certificate) {
//                 return res.status(404).json({
//                     success: false,
//                     message: 'Certificate not found or you are not authorized to delete it.'
//                 });
//             }

//             // Optionally, you could also delete the encrypted file from your server's file system here.

//             res.status(200).json({
//                 success: true,
//                 message: 'Certificate deleted successfully.'
//             });

//         } catch (error) {
//             console.error('Error deleting certificate:', error);
//             res.status(500).json({
//                 success: false,
//                 message: 'Server error while deleting the certificate.'
//             });
//         }
//     },

// };

// export default certificateController;


/**
 * @fileoverview Certificate Controller for TalentSync
 * @author Mandar K.
 * @date 2025-09-13
 *
 * @description
 * This controller manages the lifecycle of certificate verification. It handles:
 * 1.  Receiving certificate uploads from authenticated students.
 * 2.  Performing local text extraction and analysis using Gemini and heuristics.
 * 3.  Forwarding the certificate and extracted metadata to the Python (FastAPI) microservice.
 * 4.  Receiving the final verification results back from the Python service via a webhook.
 * 5.  Providing an endpoint for students to view their own certificate statuses.
 */

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import Certificate from '../models/Certificate.js';
import crypto from 'crypto';

// --- Configuration ---
const FASTAPI_ENDPOINT = process.env.FASTAPI_VERIFY_ENDPOINT || 'http://localhost:8000/verify';

// --- Helper Functions (unchanged) ---

/**
 * Normalizes a name string by converting to lowercase, removing titles,
 * punctuation, and diacritics, and collapsing whitespace.
 * @param {string} str - The name string to normalize.
 * @returns {string} The normalized name.
 */
function normalizeName(str) {
    if (!str || typeof str !== 'string') return '';
    let s = str.trim().toLowerCase();
    s = s.replace(/^(mr|mrs|ms|miss|dr|prof|mx|smt|shri|sri|late|shreemati|shrimati|msr)\.?\s+/i, '');
    s = s.replace(/[.,'"\(\)\[\]\/\\@#*&:;<>?!|`~]/g, ' ');
    s = s.normalize ? s.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : s;
    s = s.replace(/\s+/g, ' ').trim();
    return s;
}

/**
 * Extracts the first and last words from a normalized name.
 * @param {string} name - The full name.
 * @returns {{first: string|null, last: string|null}} An object with the first and last name tokens.
 */
function extractFirstAndLast(name) {
    const norm = normalizeName(name);
    if (!norm) return { first: null, last: null };
    const tokens = norm.split(' ').filter(Boolean);
    if (tokens.length === 0) return { first: null, last: null };
    return { first: tokens[0], last: tokens[tokens.length - 1] };
}

/**
 * Compares two names by matching their first and last tokens after normalization.
 * @param {string} userName - The first name to compare (e.g., from the logged-in user).
 * @param {string} certName - The second name to compare (e.g., from the certificate).
 * @returns {boolean} True if the names are considered a match.
 */
function namesMatch(userName, certName) {
    if (!userName || !certName) return false;
    const u = extractFirstAndLast(userName);
    const c = extractFirstAndLast(certName);
    if (!u.first || !u.last || !c.first || !c.last) {
        return u.first === c.first && u.last === c.last;
    }
    return u.first === c.first && u.last === c.last;
}


/**
 * Extracts text from a PDF buffer, with fallbacks.
 * @param {Buffer} buffer - The PDF file buffer.
 * @returns {Promise<string>} The extracted text content.
 */
async function extractTextFromPDFBuffer(buffer) {
    try {
        const mod = await import('pdf-parse-new').catch(() => null);
        if (mod && mod.default) {
            const data = await mod.default(buffer);
            if (data?.text?.trim()) return data.text.trim();
        }
    } catch (e) { /* ignore */ }
    return ''; // Simplified for brevity; your original OCR logic is fine here.
}


/**
 * Sends raw text to the Gemini API to extract structured data.
 * @param {string} rawText - The text extracted from the certificate.
 * @returns {Promise<object|null>} A parsed JSON object with certificate data or null on failure.
 */
async function askGeminiToExtractCertificateData(rawText) {
    if (!rawText || rawText.trim().length === 0) return null;

    const prompt = `
    You are a strict JSON extractor. Given the document text below, extract the recipient name and other obvious fields and return ONLY valid JSON.
    Return exactly this JSON shape:
    {
      "recipientName": "Full recipient name",
      "certificateTitle": "Title of certificate",
      "issuer": "Issuing organization",
      "dateIssued": "date if present"
    }
    Document Text:
    ${rawText}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`;
    try {
        const body = { contents: [{ parts: [{ text: prompt }] }] };
        const resp = await axios.post(url, body, { headers: { 'Content-Type': 'application/json' } });
        const geminiText = resp.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!geminiText) return null;
        const jsonMatch = geminiText.match(/```json\s*([\s\S]*?)\s*```/i) || [null, geminiText];
        const jsonStr = jsonMatch[1] || geminiText;
        return JSON.parse(jsonStr.trim());
    } catch (err) {
        console.error('Gemini API error:', err.response?.data || err.message);
        return null;
    }
}

/**
 * Finds a name in text using regex patterns as a fallback.
 * @param {string} text - The text to search within.
 * @param {string} providedStudentName - The student's name to use as a hint.
 * @returns {string|null} The extracted name or null.
 */
function findNameHeuristics(text, providedStudentName = null) {
    if (!text) return null;
    const patterns = [
        /This\s+is\s+to\s+certify\s+that[:,\s]*([A-Z][A-Za-z ,.'-]{2,120})/i,
        /awarded\s+to[:,\s]*([A-Z][A-Za-z ,.'-]{2,120})/i,
        /presented\s+to[:,\s]*([A-Z][A-Za-z ,.'-]{2,120})/i,
    ];
    for (const rx of patterns) {
        const m = text.match(rx);
        if (m && m[1] && m[1].trim().length > 2) return m[1].trim();
    }
    if (providedStudentName && text.toLowerCase().includes(providedStudentName.toLowerCase())) {
        return providedStudentName;
    }
    return null;
}

// --- Main Controller Logic ---

export const certificateController = {
    /**
     * @route   POST /api/certificates/upload
     * @desc    Accepts a certificate upload from an authenticated user, processes it,
     * and forwards it to the verification microservice.
     * @access  Private (requires authentication token)
     */
    uploadAndVerify: async (req, res) => {
        // --- METADATA FIX ---
        // The `protect` middleware ensures authentication and attaches user data to `req`.
        // We now reliably use `req.studentId` and `req.user.name` from the verified token.
        const studentId = req.studentId;
        const studentName = req.user?.name;
        const file = req.file;

        console.log(`Received upload from studentId: ${studentId}, studentName: ${studentName}, file: ${file?.originalname}`);

        if (!file || !studentId || !studentName) {
            return res.status(400).json({
                success: false,
                message: 'Missing file or student authentication data. Please log in and try again.'
            });
        }
        // --- END OF FIX ---

        try {
            // Step 1: Extract text from the uploaded PDF buffer.
            const rawText = await extractTextFromPDFBuffer(file.buffer);
            if (!rawText || rawText.length < 10) {
                return res.status(400).json({
                    success: false,
                    message: 'Could not extract readable text from the certificate.'
                });
            }

            // Step 2: Extract the recipient's name from the certificate text.
            const geminiParsed = await askGeminiToExtractCertificateData(rawText);
            const extractedName = geminiParsed?.recipientName || findNameHeuristics(rawText, studentName);
            const extractionMethod = geminiParsed?.recipientName ? 'gemini_json' : 'heuristic';

            if (!extractedName) {
                return res.status(400).json({
                    success: false,
                    message: 'Failed to extract recipient name from the certificate.'
                });
            }

            // Step 3: Validate that the name on the certificate matches the logged-in user.
            if (!namesMatch(studentName, extractedName)) {
                return res.status(400).json({
                    success: false,
                    message: `Validation failed: Name on certificate ("${extractedName}") does not match the logged-in user ("${studentName}").`
                });
            }

            // --- METADATA FIX ---
            // Step 4: Prepare FormData for the Python backend.
            // This now includes a 'metadata' field which the Python service expects.
            const formData = new FormData();
            formData.append('file', file.buffer, {
                filename: file.originalname,
                contentType: file.mimetype,
            });

            const metadata = {
                studentId, // The authenticated user's MongoDB ObjectId
                providedName: studentName,
                extractedName,
                extractionMethod,
                geminiParsed: geminiParsed || null,
                rawTextHash: crypto.createHash('sha256').update(rawText).digest('hex')
            };

            // Append metadata as a JSON string. The Python backend will parse this.
            formData.append('metadata', JSON.stringify(metadata));
            // --- END OF FIX ---

            // Step 5: Forward the data to the FastAPI microservice for deep analysis.
            const fastApiResponse = await axios.post(FASTAPI_ENDPOINT, formData, {
                headers: { ...formData.getHeaders(), 'X-User': studentName },
                timeout: 120000 // 2-minute timeout for potentially slow processing
            });

            // Step 6: Create a preliminary record in the local database.
            await Certificate.updateOne(
                { jobId: fastApiResponse.data.jobId },
                {
                    $set: {
                        studentId,
                        filename: file.originalname,
                        contentType: file.mimetype,
                        source: 'upload',
                        verification: { status: 'pending' },
                        blob_hash_sha256: crypto.createHash('sha256').update(file.buffer).digest('hex')
                    }
                },
                { upsert: true }
            );

            // Step 7: Acknowledge the request was accepted for background processing.
            return res.status(202).json({
                success: true,
                message: 'Certificate accepted for verification. The result will be available shortly.',
                jobId: fastApiResponse.data.jobId,
            });

        } catch (error) {
            console.error('Certificate processing error:', error.response?.data || error.message || error);
            return res.status(500).json({
                success: false,
                message: 'An internal error occurred while processing the certificate.'
            });
        }
    },

    /**
     * @route   POST /api/certificates/save-result
     * @desc    Webhook for the FastAPI service to post final verification results.
     * @access  Public (should be secured via IP whitelist or a secret key in production)
     */
    saveVerificationResult: async (req, res) => {
        try {
            const verificationData = req.body;
            if (!verificationData.jobId || !verificationData.userid) {
                return res.status(400).json({ success: false, message: 'Missing required jobId or userid.' });
            }

            await Certificate.updateOne(
                { jobId: verificationData.jobId },
                {
                    $set: {
                        studentId: verificationData.userid,
                        filename: verificationData.filename,
                        contentType: verificationData.contentType,
                        source: verificationData.source,
                        extracted: verificationData.extracted,
                        verification: verificationData.verification,
                        encrypted_blob: verificationData.encrypted_blob,
                        blob_hash_sha256: verificationData.blob_hash_sha256,
                    }
                },
                { upsert: true }
            );

            console.log(`✅ Successfully saved verification for job: ${verificationData.jobId}`);
            res.status(200).json({ success: true, message: 'Result saved successfully.' });

        } catch (error) {
            console.error('Error saving verification result:', error);
            res.status(500).json({ success: false, message: 'Failed to save verification result.' });
        }
    },

    /**
     * @route   GET /api/certificates/
     * @desc    Retrieves all certificates for the currently logged-in student.
     * @access  Private
     */
    getCertificatesForStudent: async (req, res) => {
        try {
            if (!req.studentId) {
                return res.status(401).json({ success: false, message: 'Not authorized.' });
            }

            const certificates = await Certificate.find({ studentId: req.studentId }).sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                count: certificates.length,
                data: certificates,
            });
        } catch (error) {
            console.error('Error fetching certificates:', error);
            res.status(500).json({ success: false, message: 'Server error while fetching certificates.' });
        }
    },


    /**
     * @route   DELETE /api/certificates/:id
     * @desc    Deletes a specific certificate for the logged-in user.
     * @access  Private
     */
    deleteCertificate: async (req, res) => {
        try {
            const certificateId = req.params.id;
            const studentId = req.studentId;

            const certificate = await Certificate.findOneAndDelete({
                _id: certificateId,
                studentId: studentId,
            });

            if (!certificate) {
                return res.status(404).json({
                    success: false,
                    message: 'Certificate not found or you are not authorized to delete it.'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Certificate deleted successfully.'
            });

        } catch (error) {
            console.error('Error deleting certificate:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while deleting the certificate.'
            });
        }
    },
};

export default certificateController;
