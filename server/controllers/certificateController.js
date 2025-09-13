// certificateController.js
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import Certificate from '../models/Certificate.js';
import crypto from 'crypto';

// Get the FastAPI endpoint from environment variables
// Get the FastAPI endpoint from environment variables
const FASTAPI_ENDPOINT = process.env.FASTAPI_VERIFY_ENDPOINT || 'http://localhost:8000/verify';

// --- Name normalization & matching helpers ---

/**
 * Normalize a name string:
 * - lowercase
 * - remove common honorifics/prefixes (mr, mrs, ms, dr, prof, sme, smt, shri, sri, etc.)
 * - remove punctuation
 * - remove diacritics (accents)
 * - collapse whitespace
 */
function normalizeName(str) {
    if (!str || typeof str !== 'string') return '';

    // Lowercase and trim
    let s = str.trim().toLowerCase();

    // Remove common honorifics/titles at start (add more as needed)
    s = s.replace(/^(mr|mrs|ms|miss|dr|prof|mx|smt|shri|sri|late|shreemati|shrimati|msr)\.?\s+/i, '');

    // Remove punctuation characters that may cause mismatch
    s = s.replace(/[.,'"\(\)\[\]\/\\@#*&:;<>?!|`~]/g, ' ');

    // Remove diacritics (normalize to NFD and strip combining marks)
    s = s.normalize ? s.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : s;

    // Collapse multiple spaces
    s = s.replace(/\s+/g, ' ').trim();

    return s;
}

/**
 * Extract first and last token from a normalized name.
 * For single-token names, first == last (safeguard).
 */
function extractFirstAndLast(name) {
    const norm = normalizeName(name);
    if (!norm) return { first: null, last: null };

    const tokens = norm.split(' ').filter(Boolean);
    if (tokens.length === 0) return { first: null, last: null };
    const first = tokens[0];
    const last = tokens[tokens.length - 1]; // last token
    return { first, last };
}

/**
 * Compare student (user) name with certificate name.
 * Returns true if both first and last tokens match (after normalization).
 * Accepts cases where one has a middle name and the other doesn't.
 */
function namesMatch(userName, certName) {
    if (!userName || !certName) return false;

    const u = extractFirstAndLast(userName);
    const c = extractFirstAndLast(certName);

    if (!u.first || !u.last || !c.first || !c.last) {
        // Fallback: if any side lacks a last name token, try loose-first-and-last checks
        // But prefer strict fail (you can change this behavior)
        return u.first === c.first && u.last === c.last;
    }

    // Accept if first AND last match exactly after normalization
    return u.first === c.first && u.last === c.last;
}


/* -------------------------
   Helper: extract text from PDF buffer
   Tries pdf-parse-new, then pdf-parse, then a best-effort OCR via tesseract.js
   NOTE: tesseract fallback requires you to install tesseract.js and possibly native tesseract on host
   --------------------------*/
async function extractTextFromPDFBuffer(buffer) {
    // Try pdf-parse-new (preferred)
    try {
        const mod = await import('pdf-parse-new').catch(() => null);
        const pdfParse = (mod && (mod.default || mod)) || null;
        if (pdfParse) {
            const data = await pdfParse(buffer);
            if (data && data.text && data.text.trim().length > 0) {
                return data.text.trim();
            }
        }
    } catch (e) {
        // console.warn('pdf-parse-new failed:', e.message);
    }

    // Try pdf-parse (older)
    try {
        const mod2 = await import('pdf-parse').catch(() => null);
        const pdfParse2 = (mod2 && (mod2.default || mod2)) || null;
        if (pdfParse2) {
            const data = await pdfParse2(buffer);
            if (data && data.text && data.text.trim().length > 0) {
                return data.text.trim();
            }
        }
    } catch (e) {
        // console.warn('pdf-parse failed:', e.message);
    }

    // Best-effort OCR fallback using tesseract.js (optional; may need native deps)
    try {
        const tesseract = await import('tesseract.js').catch(() => null);
        if (tesseract && tesseract.createWorker) {
            // tesseract.js prefers images; it might still work on some PDF buffers but not guaranteed.
            // To get robust OCR you should convert the PDF page to an image (ImageMagick/ghostscript) or use Google Vision.
            // We'll try a naive attempt: write buffer to a temp file and ask tesseract to read it.
            const tmpPdfPath = path.join(process.cwd(), `tmp_cert_${Date.now()}.pdf`);
            fs.writeFileSync(tmpPdfPath, buffer);
            const worker = tesseract.createWorker();
            await worker.load();
            await worker.loadLanguage('eng');
            await worker.initialize('eng');

            // tesseract.js may not support PDF directly on all environments; if it fails this will throw.
            const { data: { text } } = await worker.recognize(tmpPdfPath);
            await worker.terminate();
            try { fs.unlinkSync(tmpPdfPath); } catch (e) { }
            if (text && text.trim().length > 0) return text.trim();
        }
    } catch (ocrErr) {
        // console.warn('Tesseract OCR fallback failed or not available:', ocrErr.message || ocrErr);
        // don't throw - we'll fallback to heuristics lower
    }

    // If nothing worked, return empty string (caller will handle)
    return '';
}

/* -------------------------
   Helper: ask Gemini to parse raw text and return JSON
   We instruct the model to return ONLY valid JSON with specific fields.
   --------------------------*/
async function askGeminiToExtractCertificateData(rawText) {
    if (!rawText || rawText.trim().length === 0) return null;

    // Keep prompt tight: request only JSON and a strict schema
    const prompt = `
You are a strict JSON extractor. Given the document text below (which is the extracted textual content of a certificate), extract the recipient name and other obvious fields and return ONLY valid JSON and nothing else.

Return exactly this JSON shape (fields may be null if not present):
{
  "recipientName": "Full recipient name (first middle last)",
  "recipientNameConfidence": "low|medium|high",
  "certificateTitle": "Title of certificate if present",
  "issuer": "Issuing organization if present",
  "dateIssued": "date if present (prefer ISO YYYY-MM-DD or return natural form)",
  "otherFields": { "fieldName": "value", ... } // optional key-value pairs detected on the certificate
}

Document Text:
${rawText}

Important:
- DO NOT include any commentary or markdown.
- Output must be valid JSON parsable by JSON.parse.
- If you cannot find a value, set it to null.
`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`;

    try {
        const body = {
            contents: [
                {
                    parts: [
                        { text: prompt }
                    ]
                }
            ]
        };

        const resp = await axios.post(url, body, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 60000
        });

        const geminiText = resp.data?.candidates?.[0]?.content?.parts?.find(p => p.text)?.text;
        if (!geminiText) return null;

        // Try to extract raw JSON even if model included backticks or noise (defensive)
        const jsonMatch = geminiText.match(/```json\s*([\s\S]*?)\s*```/i) ||
            geminiText.match(/```([\s\S]*?)```/i) ||
            [null, geminiText];
        const jsonStr = (jsonMatch && jsonMatch[1]) ? jsonMatch[1] : geminiText;

        // Some models may add stray newlines or prefix/suffix; trim and attempt parse
        const cleaned = jsonStr.trim();

        // Parse JSON safely
        try {
            const parsed = JSON.parse(cleaned);
            return parsed;
        } catch (parseErr) {
            // If parse fails, try sanitizing (e.g., replace single quotes) - conservative
            const sanitized = cleaned.replace(/\b([a-zA-Z0-9_]+)\s*:/g, (m) => m) // noop but placeholder
            try {
                return JSON.parse(sanitized);
            } catch (e2) {
                // Final fallback: return raw text in an object for manual handling
                return { parseError: true, raw: cleaned };
            }
        }

    } catch (err) {
        // Log full error for debugging but do not leak key or tokens
        console.error('Gemini API error during certificate parsing:', err.response?.data || err.message);
        return null;
    }
}

/* -------------------------
   Heuristic fallback: find name from text using common certificate patterns
   --------------------------*/
function findNameHeuristics(text, providedStudentName = null) {
    if (!text) return null;
    const patterns = [
        /This\s+is\s+to\s+certif(?:y|ies)\s+that[:,\s]*([A-Z][A-Za-z ,.'-]{2,120})/i,
        /awarded\s+to[:,\s]*([A-Z][A-Za-z ,.'-]{2,120})/i,
        /presented\s+to[:,\s]*([A-Z][A-Za-z ,.'-]{2,120})/i,
        /certified\s+to[:,\s]*([A-Z][A-Za-z ,.'-]{2,120})/i,
        /to[:,\s]*([A-Z][A-Za-z ,.'-]{2,120})/i,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/ // naive: looks for First Last or First Middle Last
    ];

    for (const rx of patterns) {
        const m = text.match(rx);
        if (m && m[1]) {
            const candidate = m[1].trim();
            // avoid returning very short tokens like "Award"
            if (candidate.length > 2) return candidate;
        }
    }

    // If a provided studentName exists, check for substring match (case-insensitive)
    if (providedStudentName && text.toLowerCase().includes(providedStudentName.toLowerCase())) {
        return providedStudentName;
    }

    return null;
}

/* -------------------------
   Main controller
   --------------------------*/
export const certificateController = {
    /**
     * Accepts a certificate upload, extracts text locally, sends raw text to Gemini
     * to extract recipient name (JSON), then forwards file to FastAPI for verification.
     */
    uploadAndVerify: async (req, res) => {
        const { studentId, studentName } = req.body;
        const file = req.file;

        if (!file || !studentId || !studentName) {
            return res.status(400).json({ success: false, message: 'Missing file, student ID, or student name.' });
        }

        try {
            // Step 1: extract text from PDF (or fallback)
            const rawText = await extractTextFromPDFBuffer(file.buffer);

            // If extraction returned empty, try basic heuristics / OCR fallback message
            let useText = rawText && rawText.trim().length > 0 ? rawText : '';

            if (!useText || useText.length < 20) {
                // Try OCR fallback but don't fail hard if OCR unavailable
                try {
                    // NOTE: tesseract fallback may be slow; optional depending on your infra
                    const ocrAttempt = await (async () => {
                        try {
                            const tesseractModule = await import('tesseract.js').catch(() => null);
                            if (tesseractModule && tesseractModule.createWorker) {
                                const tmpPath = path.join(process.cwd(), `tmp_cert_${Date.now()}.pdf`);
                                fs.writeFileSync(tmpPath, file.buffer);
                                const worker = tesseractModule.createWorker();
                                await worker.load();
                                await worker.loadLanguage('eng');
                                await worker.initialize('eng');
                                const { data } = await worker.recognize(tmpPath);
                                await worker.terminate();
                                try { fs.unlinkSync(tmpPath); } catch (e) { }
                                return data?.text || '';
                            }
                            return '';
                        } catch (e) {
                            return '';
                        }
                    })();

                    if (ocrAttempt && ocrAttempt.trim().length > 0) {
                        useText = ocrAttempt.trim();
                    }
                } catch (ocrOuterErr) {
                    // ignore - OCR is best-effort
                }
            }

            // If still no text, return an error (you can change this to enqueue for manual review)
            if (!useText || useText.length < 10) {
                return res.status(400).json({
                    success: false,
                    message: 'Could not extract readable text from the certificate. Please upload a clearer PDF or a digital (text-layer) PDF.'
                });
            }

            // Step 2: ask Gemini to extract structured data from the raw text
            const geminiParsed = await askGeminiToExtractCertificateData(useText);

            // Step 3: determine extractedName (prefer Gemini, fallback to heuristics)
            let extractedName = null;
            let extractionMethod = null;
            if (geminiParsed && !geminiParsed.parseError) {
                // If parsed object has recipientName
                if (geminiParsed.recipientName) {
                    extractedName = String(geminiParsed.recipientName).trim();
                    extractionMethod = 'gemini_json';
                } else {
                    // maybe gemini returned raw or different key
                    const possibleKeys = ['name', 'recipient', 'recipientName', 'fullName'];
                    for (const k of possibleKeys) {
                        if (geminiParsed[k]) {
                            extractedName = String(geminiParsed[k]).trim();
                            extractionMethod = 'gemini_json_key_guess';
                            break;
                        }
                    }
                }
            }

            // Heuristic fallback
            if (!extractedName) {
                const heur = findNameHeuristics(useText, studentName);
                if (heur) {
                    extractedName = heur;
                    extractionMethod = 'heuristic';
                }
            }

            if (!extractedName) {
                // failed to extract name; return gracefully
                return res.status(400).json({
                    success: false,
                    message: 'Failed to extract recipient name from certificate. Try uploading a higher-quality or digital PDF.'
                });
            }

            // Step 4: Compare with provided studentName (case-insensitive, fuzzy)
            // Simple containment check first
            // const normalizedFound = extractedName.toLowerCase();
            // const normalizedGiven = studentName.toLowerCase();
            // const isMatch = normalizedFound.includes(normalizedGiven) || normalizedGiven.includes(normalizedFound);
            const isMatch = namesMatch(studentName, extractedName);
// If you want to allow a fallback fuzzy match, see optional section below


            if (!isMatch) {
                // optional: do a relaxed Levenshtein / fuzzy match, but for now reject
                return res.status(400).json({
                    success: false,
                    message: `Validation failed: Name on certificate ("${extractedName}") does not match the logged-in user ("${studentName}").`,
                    extractedName,
                    extractionMethod,
                    rawTextSnippet: useText.slice(0, 500) // short debug snippet
                });
            }

            // Step 5: forward to FastAPI (attach the file and extracted structured data)
            const formData = new FormData();
            formData.append('file', file.buffer, {
                filename: file.originalname,
                contentType: file.mimetype,
            });

            // Also attach extracted metadata as a JSON field (FastAPI can read multipart form fields)
            const metadata = {
                studentId,
                providedName: studentName,
                extractedName,
                extractionMethod,
                geminiParsed: geminiParsed || null,
                rawTextHash: crypto.createHash('sha256').update(useText).digest('hex')
            };
            formData.append('metadata', JSON.stringify(metadata));

            const fastApiResponse = await axios.post(FASTAPI_ENDPOINT, formData, {
                headers: {
                    ...formData.getHeaders(),
                    'X-User': studentName, // Pass the authenticated username as expected by FastAPI.
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                timeout: 120000
            });

            // Persist a pending certificate record locally (optional)
            await Certificate.updateOne(
                { jobId: fastApiResponse.data.jobId },
                {
                    $set: {
                        studentId,
                        filename: file.originalname,
                        contentType: file.mimetype,
                        source: 'upload',
                        extracted: {
                            extractedName,
                            extractionMethod,
                            geminiParsed: geminiParsed || null,
                            rawTextHash: metadata.rawTextHash
                        },
                        verification: { status: 'pending' },
                        blob_hash_sha256: crypto.createHash('sha256').update(file.buffer).digest('hex')
                    }
                },
                { upsert: true }
            );

            // Acknowledge that the request was accepted for background processing.
            return res.status(202).json({
                success: true,
                message: 'Certificate accepted for verification. The result will be available in your profile shortly.',
                jobId: fastApiResponse.data.jobId,
                extractedName,
                extractionMethod
            });

        } catch (error) {
            console.error('Certificate processing error:', error.response?.data || error.message || error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while processing the certificate.'
            });
        }
    },

    /**
     * Webhook endpoint for the FastAPI service to post the final verification results.
     * (unchanged from your original)
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

            console.log(`Successfully saved verification for job: ${verificationData.jobId}`);
            res.status(200).json({ success: true, message: 'Result saved successfully.' });

        } catch (error) {
            console.error('Error saving verification result:', error);
            res.status(500).json({ success: false, message: 'Failed to save verification result to the database.' });
        }
    }
};

export default certificateController;
