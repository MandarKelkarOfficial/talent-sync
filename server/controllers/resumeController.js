/**
 *  @author Mandar K.
 * @date 2025-09-13
 * 
 */


import fs from 'fs';
import path from 'path';
import Resume from '../models/Resume.js';
import axios from 'axios';
import crypto from 'crypto'; 


// --- Helper Functions ---

/**
 * Enhanced resume parsing using Gemini AI for structured data extraction
 */
const parseResumeWithGemini = async (resumeText, filename) => {
    try {
        const prompt = `
        Please analyze this resume text and extract structured information in the following JSON format. Be precise and only extract information that is clearly present in the text:

        {
            "personalInfo": {
                "name": "Full name",
                "email": "email@example.com",
                "phone": "phone number",
                "location": "city, state/country",
                "linkedin": "LinkedIn URL if present",
                "github": "GitHub URL if present"
            },
            "skills": [
                "List all technical skills, programming languages, frameworks, tools mentioned"
            ],
            "experience": [
                {
                    "company": "Company name",
                    "position": "Job title",
                    "startDate": "MM/YYYY or just year",
                    "endDate": "MM/YYYY or 'Present'",
                    "description": "Brief description of role and achievements"
                }
            ],
            "education": [
                {
                    "institution": "School/University name",
                    "degree": "Degree type and major",
                    "startDate": "Year",
                    "endDate": "Year",
                    "gpa": "GPA if mentioned"
                }
            ],
            "projects": [
                {
                    "name": "Project name",
                    "description": "Brief description",
                    "technologies": ["tech1", "tech2"],
                    "url": "project URL if present"
                }
            ],
            "certifications": [
                {
                    "name": "Certification name",
                    "issuer": "Issuing organization",
                    "date": "Date obtained"
                }
            ]
        }

        Resume Text:
        ${resumeText}

        Instructions:
        - Only include information that is clearly stated in the resume
        - Use "Not specified" for missing dates
        - Keep descriptions concise but informative
        - Extract ALL skills mentioned, including soft skills if clearly stated
        - If a section is empty, return an empty array []
        - Ensure proper JSON formatting
        `;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            },
            {
                timeout: 30000 // 30 second timeout
            }
        );

        const geminiResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!geminiResponse) {
            throw new Error('No response from Gemini API');
        }

        console.log('Raw Gemini response:', geminiResponse);

        // Extract JSON from the response (Gemini might wrap it in markdown)
        const jsonMatch = geminiResponse.match(/```json\n(.*?)\n```/s) || 
                         geminiResponse.match(/```\n(.*?)\n```/s) ||
                         [null, geminiResponse];
        
        const jsonStr = jsonMatch[1] || geminiResponse;
        
        try {
            const parsedData = JSON.parse(jsonStr);
            console.log('Successfully parsed Gemini JSON response');
            return parsedData;
        } catch (jsonError) {
            console.error('JSON parsing error:', jsonError);
            console.error('JSON string:', jsonStr);
            
            // Fallback: return basic structure with extracted text
            return {
                personalInfo: {
                    name: extractBasicInfo(resumeText, 'name'),
                    email: extractBasicInfo(resumeText, 'email'),
                    phone: extractBasicInfo(resumeText, 'phone'),
                    location: null,
                    linkedin: null,
                    github: null
                },
                skills: extractBasicSkills(resumeText),
                experience: [],
                education: [],
                projects: [],
                certifications: []
            };
        }

    } catch (error) {
        console.error('Gemini API error:', error.message);
        console.error('Full error:', error);
        
        // Fallback to basic extraction
        return {
            personalInfo: {
                name: extractBasicInfo(resumeText, 'name'),
                email: extractBasicInfo(resumeText, 'email'),
                phone: extractBasicInfo(resumeText, 'phone'),
                location: null,
                linkedin: null,
                github: null
            },
            skills: extractBasicSkills(resumeText),
            experience: [],
            education: [],
            projects: [],
            certifications: []
        };
    }
};

/**
 * Fallback basic information extraction
 */
const extractBasicInfo = (text, type) => {
    switch (type) {
        case 'email':
            const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
            return emailMatch ? emailMatch[0] : null;
        case 'phone':
            const phoneMatch = text.match(/(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/);
            return phoneMatch ? phoneMatch[0] : null;
        case 'name':
            // Try to extract name from common patterns
            const lines = text.split('\n').filter(line => line.trim());
            if (lines.length > 0) {
                const firstLine = lines[0].trim();
                // If first line looks like a name (contains only letters and spaces, reasonable length)
                if (/^[A-Za-z\s]{2,50}$/.test(firstLine) && firstLine.split(' ').length <= 4) {
                    return firstLine;
                }
            }
            return null;
        default:
            return null;
    }
};

/**
 * Fallback basic skills extraction
 */
const extractBasicSkills = (text) => {
    const commonSkills = [
        'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'HTML', 'CSS', 
        'MongoDB', 'SQL', 'PostgreSQL', 'MySQL', 'Express', 'Angular', 'Vue',
        'TypeScript', 'PHP', 'C++', 'C#', 'Ruby', 'Go', 'Rust', 'Swift',
        'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git', 'Linux',
        'Machine Learning', 'AI', 'Data Science', 'TensorFlow', 'PyTorch'
    ];

    const found = [];
    const lowerText = text.toLowerCase();
    
    commonSkills.forEach(skill => {
        if (lowerText.includes(skill.toLowerCase())) {
            found.push(skill);
        }
    });
    
    return [...new Set(found)]; // Remove duplicates
};

/**
 * Main file parsing function that handles PDF/DOCX and then uses Gemini
 */
const parseResumeFile = async (filePath, mimetype) => {
    console.log(`Attempting to parse file: ${filePath}`);
    console.log(`File mimetype: ${mimetype}`);
    
    // Verify file exists
    if (!fs.existsSync(filePath)) {
        console.error(`File does not exist at path: ${filePath}`);
        throw new Error(`File not found: ${filePath}`);
    }

    let rawText = '';

    try {
        // Step 1: Extract raw text from PDF/DOCX
        if (mimetype === 'application/pdf') {
            console.log('Parsing PDF file...');
            
            try {
                // Try pdf-parse-new if available
                const pdfParseNew = await import('pdf-parse-new');
                const pdfParse = pdfParseNew.default || pdfParseNew;
                
                const dataBuffer = fs.readFileSync(filePath);
                console.log(`Read ${dataBuffer.length} bytes from PDF file`);
                
                const data = await pdfParse(dataBuffer);
                rawText = data.text.trim();
                console.log(`Successfully extracted ${rawText.length} characters from PDF`);
                
            } catch (pdfError) {
                console.log('PDF parsing failed, using fallback');
                console.error('PDF parsing error:', pdfError);
                
                // Fallback for PDF
                const fileStats = fs.statSync(filePath);
                rawText = `PDF file: ${path.basename(filePath)}, Size: ${fileStats.size} bytes. Content extraction failed.`;
            }
            
        } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            console.log('Parsing DOCX file with mammoth...');
            const mammothModule = await import('mammoth');
            const mammoth = mammothModule.default;
            
            const result = await mammoth.extractRawText({ path: filePath });
            rawText = result.value;
            console.log(`Successfully extracted ${rawText.length} characters from DOCX`);
            
        } else {
            throw new Error(`Unsupported file type: ${mimetype}`);
        }

        // Step 2: Use Gemini AI to structure the data if we have enough text content
        if (rawText.length > 100) { // Only use Gemini if we have substantial content
            console.log('Using Gemini AI to structure resume data...');
            const structuredData = await parseResumeWithGemini(rawText, path.basename(filePath));
            
            return {
                fullText: rawText,
                structured: structuredData
            };
        } else {
            console.log('Insufficient content for Gemini analysis, using basic extraction');
            return {
                fullText: rawText,
                structured: {
                    personalInfo: {
                        name: extractBasicInfo(rawText, 'name'),
                        email: extractBasicInfo(rawText, 'email'),
                        phone: extractBasicInfo(rawText, 'phone'),
                        location: null,
                        linkedin: null,
                        github: null
                    },
                    skills: extractBasicSkills(rawText),
                    experience: [],
                    education: [],
                    projects: [],
                    certifications: []
                }
            };
        }

    } catch (error) {
        console.error("Error during file parsing:", error);
        
        // Clean up the uploaded file if parsing fails
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
                console.log(`Cleaned up file: ${filePath}`);
            } catch (cleanupError) {
                console.error("Error cleaning up file:", cleanupError);
            }
        }
        
        throw new Error(`Failed to parse the resume file: ${error.message}`);
    }
};

/**
 * Enhanced upload resume function
 */
export const uploadResume = async (req, res) => {
    // console.log('=== Enhanced Resume Upload Started ===');
    
    try {
        if (!req.file) {
            console.log('No file uploaded');
            return res.status(400).json({ message: 'No file was uploaded.' });
        }

     

        const { studentId, title } = req.body;
        console.log('Request body:', { studentId, title });
        
        if (!studentId || !title) {
            console.log('Missing studentId or title, cleaning up file');
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ message: 'Student ID and title are required.' });
        }

        console.log('About to parse resume file with Gemini AI...');
        const parseResult = await parseResumeFile(req.file.path, req.file.mimetype);
        
        const { fullText, structured } = parseResult;
        console.log(`Successfully parsed resume. `);
        // console.log('Structured data extracted:', {
        //     hasPersonalInfo: !!structured.personalInfo,
        //     skillsCount: structured.skills.length,
        //     experienceCount: structured.experience.length,
        //     educationCount: structured.education.length,
        //     projectsCount: structured.projects.length
        // });

        // Create resume with structured data
        const newResume = new Resume({
            studentId,
            title,
            filename: req.file.filename,
            contentType: req.file.mimetype,
            
            // Enhanced fields from Gemini
            email: structured.personalInfo.email,
            phone: structured.personalInfo.phone,
            skills: structured.skills,
            education: structured.education,
            experience: structured.experience,
            projects: structured.projects,
            
            // Store full text for ATS analysis
            fullText: fullText,
            
            // Store structured data for future use
            structuredData: structured
        });

        console.log('Saving enhanced resume to database...');
        await newResume.save();
        console.log('Enhanced resume saved successfully');
        
        res.status(201).json({ 
            message: 'Resume uploaded and parsed successfully with AI enhancement.', 
            resume: newResume,
            aiEnhanced: true,
            extractedData: {
                personalInfo: structured.personalInfo,
                skillsCount: structured.skills.length,
                experienceCount: structured.experience.length,
                educationCount: structured.education.length,
                projectsCount: structured.projects.length
            }
        });
        
    } catch (error) {
        console.error('=== Enhanced Resume Upload Error ===');
        console.error('Error:', error);
        console.error('Stack:', error.stack);
        
        // Clean up file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (cleanupError) {
                console.error('Cleanup error:', cleanupError);
            }
        }
        
        res.status(500).json({ 
            message: 'Server error during resume processing.',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};


export const calculateAtsScore = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { jobDescription } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ message: 'Job description is required.' });
    }

    const resume = await Resume.findById(resumeId);
    if (!resume || !resume.fullText) {
      return res.status(404).json({ message: 'Resume not found or not parsed.' });
    }

    // --- Normalization helpers ---
    const normalizeTokens = (text) => {
      return (text || '')
        .toLowerCase()
        .replace(/[\u2018\u2019\u201c\u201d"]/g, '') 
        .replace(/[^a-z0-9\s\-_.+]/g, ' ') 
        .split(/\s+/)
        .map(t => t.trim())
        .filter(Boolean);
    };

    const stopWords = new Set([
      'the','and','for','with','that','this','from','have','will','are','you','your','not','but','our',
      'requirements','job','role','candidate','experience','skills','years'
    ]);

    // --- JD tokens & keyword set ---
    const jdTokens = normalizeTokens(jobDescription).filter(t => t.length > 2 && !stopWords.has(t));
    const jdKeywordSet = new Set(jdTokens);

    // --- Resume tokens ---
    const resumeTokens = normalizeTokens(resume.fullText);
    const resumeTokenSet = new Set(resumeTokens);

    // --- Matched keywords (intersection) ---
    const matchedKeywords = Array.from(jdKeywordSet).filter(k => resumeTokenSet.has(k));

    // --- Skill alignment using structuredData.skills if present (better than token match) ---
    const resumeSkills = (resume.structuredData?.skills || resume.skills || []).map(s => String(s).toLowerCase().trim());
    // Quick normalized set of resume skills
    const resumeSkillSet = new Set(resumeSkills);

    // Extract skill-like tokens from JD by checking presence of multi-word skills too
    const jdSkillCandidates = Array.from(jdKeywordSet).filter(k => k.length > 1);
    // matched skills by intersection
    const matchedSkills = jdSkillCandidates.filter(skill => resumeSkillSet.has(skill) || resumeSkillSet.has(skill.replace(/[-_.]/g, ' ')));
    // missing skills from JD (that are not in resume)
    const missingSkills = jdSkillCandidates.filter(skill => !matchedSkills.includes(skill));

    // --- Keyword score (0..50) roughly ---
    const keywordMatchRate = jdKeywordSet.size ? (matchedKeywords.length / jdKeywordSet.size) : 0;
    const keywordScore = Math.round(Math.min(50, keywordMatchRate * 50));

    // --- Skills score (0..35) ---
    const jdSkillCount = jdSkillCandidates.length || 1;
    const skillsMatchRate = matchedSkills.length / jdSkillCount;
    const skillsScore = Math.round(Math.min(35, skillsMatchRate * 35));

    // --- Experience relevance score (0..15) ---
    // crude heuristic: presence and number of experience entries; try to estimate years if dates found
    let experienceScore = 0;
    const expEntries = resume.experience || [];
    if (expEntries.length === 0) {
      experienceScore = 0;
    } else {
      // base points for having experience
      experienceScore = 5;
      // try to infer years from date-like fields
      const extractYear = (s) => {
        if (!s) return null;
        const m = s.match(/(19|20)\d{2}/);
        return m ? parseInt(m[0]) : null;
      };
      let totalYears = 0;
      expEntries.forEach(exp => {
        const sy = extractYear(exp.startDate);
        const ey = extractYear(exp.endDate === 'Present' ? String(new Date().getFullYear()) : exp.endDate);
        if (sy && ey && ey >= sy) totalYears += Math.max(0, ey - sy);
      });
      // cap years contribution
      totalYears = Math.min(10, totalYears);
      experienceScore += Math.round((totalYears / 10) * 10); // up to +10
      experienceScore = Math.min(15, experienceScore);
    }

    // --- Bonus points you already had (skills/experience/education/projects/email) --- 
    let bonusPoints = 0;
    if (resume.skills && resume.skills.length > 0) bonusPoints += 5; // reduced a bit; accounted earlier
    if (resume.experience && resume.experience.length > 0) bonusPoints += 5;
    if (resume.education && resume.education.length > 0) bonusPoints += 3;
    if (resume.projects && resume.projects.length > 0) bonusPoints += 3;
    if (resume.structuredData?.personalInfo?.email) bonusPoints += 2;

    // --- Composite final score (scale to 100) ---
    const composite = keywordScore + skillsScore + experienceScore + bonusPoints;
    const finalScore = Math.round(Math.min(100, composite));

    // --- Match classification & confidence ---
    const level = finalScore > 85 ? 'Top' : finalScore > 70 ? 'High' : finalScore > 50 ? 'Good' : 'Low';
    // Confidence = weighted average of component coverage
    const confidenceRaw = Math.round( (keywordMatchRate * 0.5 + skillsMatchRate * 0.4 + Math.min(1, experienceScore/15) * 0.1) * 100 );
    const confidence = Math.max(40, Math.min(100, Math.round((confidenceRaw + finalScore) / 2))); // fuse finalScore and confidenceRaw

    // --- Generate AI insights using Gemini (try/catch as you had) ---
    let aiInsights = null;
    try {
      const insightsPrompt = `
Analyze this resume vs job description and return JSON only:

Job Description:
${jobDescription}

Resume Text:
${resume.fullText}

Return JSON:
{
 "summary": "...",
 "strengths": ["..."],
 "improvementAreas": ["..."],
 "missingKeywords": ["..."],
 "recommendedActions": ["..."]
}
Only return valid JSON.
`;
      const insightsResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
        { contents: [{ parts: [{ text: insightsPrompt }] }] },
        { timeout: 30000 }
      );
      const gemini = insightsResponse.data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (gemini) {
        const jsonMatch = gemini.match(/```json\n(.*?)\n```/s) ||
                          gemini.match(/```\n(.*?)\n```/s) ||
                          [null, gemini];
        const jsonStr = jsonMatch[1] || gemini;
        try {
          aiInsights = JSON.parse(jsonStr);
          console.log('Gemini insights parsed successfully AI insights:', aiInsights);
        } catch (pe) {
          console.error('Failed parsing Gemini insights JSON', pe);
        }
      }
    } catch (aiErr) {
      console.error('Gemini insights error:', aiErr?.message || aiErr);
    }

    // --- Prepare ATS payload to store ---
    const atsData = {
      score: finalScore,
      summary: (aiInsights?.summary) || `This resume shows a ${finalScore > 75 ? 'strong' : finalScore > 50 ? 'moderate' : 'weak'} alignment with the job description.`,
      matchedKeywords: matchedKeywords.slice(0, 200),
      improvementTips: (aiInsights?.recommendedActions) || [
        "Add more specific keywords from the job description",
        "Quantify achievements with numbers and metrics",
        "Tailor experience descriptions to match job requirements"
      ],
      matchInfo: {
        level,
        description: level === 'Top' ? 'Excellent match! Ready to submit.' : level === 'High' ? 'Strong match with minor improvements needed.' : level === 'Good' ? 'Good foundation but needs optimization.' : 'Significant improvements needed for better ATS compatibility.',
        confidence
      },
      detailedInsights: {
        strengths: aiInsights?.strengths || [
          resume.skills?.length > 5 ? "Good variety of technical skills listed" : null,
          resume.experience?.length > 0 ? "Relevant work experience documented" : null
        ].filter(Boolean),
        improvementAreas: aiInsights?.improvementAreas || [
          "Add more specific keywords from the job description",
          "Quantify achievements with numbers and metrics",
          "Tailor experience descriptions to match job requirements"
        ],
        missingKeywords: aiInsights?.missingKeywords || missingSkills.slice(0, 50),
        keywordMatchRate: `${Math.round(keywordMatchRate * 100)}%`,
        totalKeywords: jdKeywordSet.size,
        matchedCount: matchedKeywords.length,
        skillsAlignment: {
          matched: matchedSkills,
          missing: missingSkills,
          relevanceScore: Math.round(skillsMatchRate * 100)
        },
        experienceRelevance: {
          score: Math.round((experienceScore / 15) * 100),
          feedback: resume.experience?.length ? 'Experience exists — more quantification will help.' : 'No experience listed.'
        },
        overallFeedback: (aiInsights?.summary) || ''
      },
      analysis: {
        hasStructuredData: !!resume.structuredData,
        skillsCount: resume.skills?.length || 0,
        experienceCount: resume.experience?.length || 0,
        bonusPoints,
        aiEnhanced: !!aiInsights,
        lastAnalyzed: new Date()
      },
      jobDescriptionHash: crypto.createHash('sha256').update(jobDescription).digest('hex'),
      analyzedAt: new Date()
    };

    // persist
    resume.ats = atsData;
    console.log('Persisting ATS data to resume record...', atsData);
    await resume.save();

    return res.status(200).json({
      message: 'ATS score calculated successfully with AI insights.',
      ats: atsData,
      aiEnhanced: !!aiInsights
    });

  } catch (error) {
    console.error('Enhanced ATS calculation error:', error);
    res.status(500).json({
      message: 'Server error during ATS calculation.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};



/**
 * Fetches all resumes for a given student.
 */
export const getStudentResumes = async (req, res) => {
    try {
        const { studentId } = req.query;
        if (!studentId) {
            return res.status(400).json({ message: 'Student ID is required.' });
        }
        const resumes = await Resume.find({ studentId }).select('_id title createdAt ats');
        res.status(200).json(resumes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching resumes.' });
    }
};

/**
 * Fetches a specific resume by ID
 */
export const getResumeById = async (req, res) => {
    try {
        const { resumeId } = req.params;
        
        if (!resumeId) {
            return res.status(400).json({ message: 'Resume ID is required.' });
        }

        const resume = await Resume.findById(resumeId);
        
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found.' });
        }

        res.status(200).json({
            message: 'Resume retrieved successfully.',
            resume: resume
        });

    } catch (error) {
        console.error('Error fetching resume by ID:', error);
        
        // Handle invalid ObjectId format
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid resume ID format.' });
        }
        
        res.status(500).json({ 
            message: 'Server error fetching resume.',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};






