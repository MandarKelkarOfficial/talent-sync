/**
 *  @author Mandar K.
 * @date 2025-09-13
 * 
 */


// controllers/aptitudeController.js
import axios from 'axios';
import AptitudeTest from '../models/AptitudeTest.js';
import AptitudeResult from '../models/AptitudeResult.js';
import Resume from '../models/Resume.js';

// Improved Gemini caller
const callGemini = async (prompt) => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { timeout: 45000 }
    );

    const rawText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('No response from Gemini API');

    // Try to extract JSON inside code fences, otherwise use whole text
    let jsonStr = rawText;
    const codeBlockMatch = rawText.match(/```(?:json)?\s*\n?(.*?)\n?```/s);
    if (codeBlockMatch) jsonStr = codeBlockMatch[1].trim();

    // Basic cleanup
    jsonStr = jsonStr
      .replace(/^\s*[^[\{]*/, '')
      .replace(/[^}\]]*\s*$/, '')
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/(["\w])\s*\n\s*(["\w])/g, '$1, $2');

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Gemini API Error Details:', {
      message: error.message,
      response: error.response?.data
    });
    throw new Error('Failed to get valid data from AI model: ' + error.message);
  }
};


const TOPICS = {
  'Quantitative Aptitude': 'Generate 10 unique multiple-choice questions on quantitative aptitude covering topics like percentages, profit & loss, time & work, and basic algebra. Ensure questions are of moderate difficulty.',
  'Logical Reasoning': 'Generate 10 unique multiple-choice questions on logical reasoning, including series completion, blood relations, and coding-decoding.',
  'General Knowledge': 'Generate 10 unique multiple-choice questions on general knowledge, covering recent world events, basic history, and geography.',
  'Personality': 'Generate 10 unique multiple-choice questions to assess personality traits based on the Big Five model (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism). These are personality assessment questions with no right or wrong answers. For correctAnswer, use "PERSONALITY" as a placeholder.',
};

const generateQuestionPrompt = (topic, instructions, studentSkills = []) => {
  let skillContext = '';
  if (topic === 'Technical Skills' && studentSkills.length > 0) {
    skillContext = `The student's skills include: ${studentSkills.join(', ')}. Please tailor the questions to these technologies.`;
  } else if (topic === 'Technical Skills') {
    skillContext = 'The student has not specified any skills. Use general web development and computer science fundamentals (e.g., JavaScript, Python, Data Structures, SQL).';
  }

  return `
    Please generate exactly 10 unique multiple-choice questions for the topic: "${topic}".
    ${instructions}
    ${skillContext}
    Provide the output in a single, valid JSON array format. Each object in the array must have these exact keys: "questionText", "options" (an array of 4 strings), and "correctAnswer" (a string indicating the correct option, e.g., "Option A").

    Example format:
    [
      {
        "questionText": "What is 2+2?",
        "options": ["3", "4", "5", "6"],
        "correctAnswer": "4"
      }
    ]
    Do not include any text outside of the JSON array.
  `;
};

const calculateTopicProgress = (results) => {
  if (!results || results.length < 2) return [];

  const latest = results[0];
  const previous = results[1];

  const topicProgress = [];

  // ADD THIS FILTER:
  latest.scoresByTopic.filter(topic => topic.topic !== 'Personality').forEach(latestTopic => {
    const prevTopic = previous.scoresByTopic.find(p => p.topic === latestTopic.topic);
    if (prevTopic) {
      const latestPerc = latestTopic.total ? Math.round((latestTopic.score / latestTopic.total) * 100) : 0;
      const prevPerc = prevTopic.total ? Math.round((prevTopic.score / prevTopic.total) * 100) : 0;
      const improvement = latestPerc - prevPerc;

      topicProgress.push({
        topic: latestTopic.topic,
        current: latestPerc,
        previous: prevPerc,
        improvement,
        trend: improvement > 0 ? 'up' : improvement < 0 ? 'down' : 'stable'
      });
    }
  });

  return topicProgress.sort((a, b) => b.improvement - a.improvement);
};


// Exported controller object expected by your router
export const aptitudeController = {
  // 1. Generate a new test for a student
  generateTest: async (req, res) => {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ message: 'Student ID is required.' });

    try {
      const latestResume = await Resume.findOne({ studentId }).sort({ createdAt: -1 });
      const studentSkills = latestResume ? latestResume.skills : [];

      const topicsToGenerate = { ...TOPICS, 'Technical Skills': 'Generate 10 technical questions.' };

      const promises = Object.entries(topicsToGenerate).map(async ([topic, instructions]) => {
        const prompt = generateQuestionPrompt(topic, instructions, studentSkills);
        const questions = await callGemini(prompt).catch(err => {
          console.warn(`Gemini failed for topic ${topic}:`, err.message);
          return [];
        });
        if (!Array.isArray(questions)) {
          // try to coerce
          if (questions && typeof questions === 'object') {
            const arrCandidate = Object.values(questions).find(v => Array.isArray(v));
            if (arrCandidate) return { topic, questions: arrCandidate };
          }
          return { topic, questions: [] };
        }
        return { topic, questions };
      });

      const results = await Promise.all(promises);

      let allQuestions = [];
      results.forEach(({ topic, questions }) => {
        const formatted = questions.map(q => ({
          topic,
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer
        }));
        allQuestions.push(...formatted);
      });

      const newTest = new AptitudeTest({ studentId, questions: allQuestions });
      await newTest.save();

      const testForUser = {
        _id: newTest._id,
        studentId: newTest.studentId,
        questions: newTest.questions.map(q => ({
          _id: q._id,
          topic: q.topic,
          questionText: q.questionText,
          options: q.options
        }))
      };

      return res.status(201).json({ message: 'Aptitude test generated successfully.', test: testForUser });
    } catch (error) {
      console.error('Test generation error:', error);
      return res.status(500).json({ message: 'Failed to generate aptitude test.', error: error.message });
    }
  },

  // 2. Submit test answers and get the report
  submitTest: async (req, res) => {
    const { testId } = req.params;
    const { studentId, answers } = req.body;

    try {
      const test = await AptitudeTest.findById(testId);
      if (!test) return res.status(404).json({ message: 'Test not found.' });


      const scores = {};
      const totalQuestions = {};
      const personalityAnswers = [];

      test.questions.forEach(q => {
        const questionId = q._id.toString();
        totalQuestions[q.topic] = (totalQuestions[q.topic] || 0) + 1;
        scores[q.topic] = scores[q.topic] || 0;

        const userAnswer = Array.isArray(answers) ? answers.find(a => a.questionId === questionId) : null;
        if (userAnswer) {
          if (q.topic === 'Personality') {
            // For personality questions, collect answers for analysis (don't score)
            personalityAnswers.push({
              question: q.questionText,
              answer: userAnswer.answer,
              options: q.options
            });
          } else if (q.correctAnswer === userAnswer.answer) {
            // Only score non-personality questions
            scores[q.topic]++;
          }
        }
      });

      // Exclude personality from scoring calculations
      const scoresByTopic = Object.keys(scores).map(topic => ({
        topic,
        score: scores[topic],
        total: totalQuestions[topic]
      }));

      // Calculate overall score excluding personality questions
      const totalCorrect = Object.entries(scores).reduce((sum, [topic, score]) => {
        return topic !== 'Personality' ? sum + score : sum;
      }, 0);

      const totalPossible = Object.entries(totalQuestions).reduce((sum, [topic, count]) => {
        return topic !== 'Personality' ? sum + count : sum;
      }, 0);

      const overallScore = totalPossible > 0 ? Math.round((totalCorrect / totalPossible) * 100) : 0;


      // Update the report generation section in submitTest function
      const reportPrompt = `
Generate a comprehensive assessment report in valid JSON format for a student who completed an aptitude test.

APTITUDE TEST RESULTS:
${scoresByTopic.filter(s => s.topic !== 'Personality').map(s =>
        `${s.topic}: ${s.score}/${s.total} (${s.total ? Math.round((s.score / s.total) * 100) : 0}%)`
      ).join('\n')}
Overall Aptitude Score: ${overallScore}%

PERSONALITY ASSESSMENT RESPONSES:
${personalityAnswers.map((pa, i) =>
        `Q${i + 1}: ${pa.question}\nSelected: ${pa.answer}\nOptions: ${pa.options.join(', ')}`
      ).join('\n\n')}

Based on the aptitude scores AND personality responses, generate detailed insights. Return ONLY valid JSON:

{
  "personalityInsights": "Comprehensive personality analysis based on the Big Five traits (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism). Analyze patterns in their responses to describe their work style, social preferences, and personality tendencies in 3-4 sentences.",
  "strengths": ["List 3-4 key strengths based on high-scoring aptitude areas AND personality traits"],
  "areasForImprovement": ["List 3-4 areas for development based on lower scores AND personality insights"],
  "overallSummary": "Comprehensive summary combining aptitude performance with personality assessment. Include suitable career directions and recommendations based on both cognitive abilities and personality fit."
}`;

      let report;
      try {
        report = await callGemini(reportPrompt);
        if (!report || typeof report !== 'object' || Array.isArray(report)) {
          throw new Error('Invalid report structure from AI');
        }
      } catch (err) {
        console.warn('AI report generation failed, using fallback:', err.message);

        // Enhanced fallback that attempts to use personality data
        const personalityInsight = personalityAnswers.length > 0
          ? `Based on your responses, you demonstrate a balanced personality with thoughtful decision-making. Your approach to challenges and social situations suggests good self-awareness and adaptability.`
          : "Personality assessment data not available.";

        report = {
          personalityInsights: personalityInsight,
          strengths: ["Analytical thinking", "Problem solving", "Consistent performance"],
          areasForImprovement: ["Practice quantitative problems", "Speed up logical reasoning", "Expand general knowledge"],
          overallSummary: `With an overall aptitude score of ${overallScore}%, you show solid cognitive abilities. Combined with your personality profile, focus on leveraging your natural strengths while developing areas that need improvement.`
        };
      }

      const newResult = new AptitudeResult({
        studentId,
        testId,
        overallScore,
        scoresByTopic,
        report,
        userAnswers: answers,
        completedAt: new Date()
      });

      await newResult.save();
      test.status = 'completed';
      await test.save();

      return res.status(200).json({ message: 'Test submitted and report generated.', result: newResult });
    } catch (error) {
      console.error('Test submission error:', error);
      return res.status(500).json({ message: 'Failed to process test submission.', error: error.message });
    }
  },

  // 3. Get a specific result
  getTestResult: async (req, res) => {
    try {
      const { resultId } = req.params;
      const result = await AptitudeResult.findById(resultId);
      if (!result) return res.status(404).json({ message: 'Result not found.' });
      return res.status(200).json(result);
    } catch (error) {
      console.error('Server error fetching result:', error);
      return res.status(500).json({ message: 'Server error fetching result.' });
    }
  },

  // Get all results for a student (history)
  getStudentResults: async (req, res) => {
    try {
      const { studentId } = req.params;
      const { limit = 10 } = req.query;

      const results = await AptitudeResult.find({ studentId })
        .sort({ completedAt: -1 })
        .limit(parseInt(limit))
        .select('overallScore scoresByTopic completedAt report.overallSummary');

      if (!results || results.length === 0) {
        return res.status(404).json({ message: 'No previous test results found.' });
      }

      return res.status(200).json(results);
    } catch (error) {
      console.error('Error fetching student results:', error);
      return res.status(500).json({ message: 'Failed to fetch test results.' });
    }
  },

  // Get detailed progress analytics for a student
  getStudentProgress: async (req, res) => {
    try {
      const { studentId } = req.params;

      const results = await AptitudeResult.find({ studentId })
        .sort({ completedAt: -1 })
        .limit(20);

      if (!results || results.length === 0) {
        return res.status(404).json({ message: 'No test results found for progress analysis.' });
      }

      const latest = results[0];
      const previous = results[1];
      const oldest = results[results.length - 1];


      const progressData = {
        totalTests: results.length,
        latestScore: latest.overallScore,
        averageScore: Math.round(results.reduce((sum, r) => sum + r.overallScore, 0) / results.length),
        bestScore: Math.max(...results.map(r => r.overallScore)),
        worstScore: Math.min(...results.map(r => r.overallScore)),
        recentTrend: previous ?
          (latest.overallScore > previous.overallScore ? 'Improving' :
            latest.overallScore < previous.overallScore ? 'Declining' : 'Stable') : 'First Test',
        overallImprovement: oldest && results.length > 1 ?
          Math.round((latest.overallScore - oldest.overallScore) * 10) / 10 : 0,
        topicProgress: calculateTopicProgress(results),

        // UPDATED: Filter out personality questions from timeline topics
        timeline: results.slice().reverse().map(r => ({
          date: r.completedAt,
          score: r.overallScore,
          topics: r.scoresByTopic
            .filter(t => t.topic !== 'Personality')  // Filter out personality
            .map(t => ({
              topic: t.topic,
              percentage: t.total ? Math.round((t.score / t.total) * 100) : 0
            }))
        })),

        // OPTIONAL: Add personality insights from latest test if available
        latestPersonalityInsights: latest.report?.personalityInsights || null
      };

      return res.status(200).json(progressData);
    } catch (error) {
      console.error('Error calculating student progress:', error);
      return res.status(500).json({ message: 'Failed to calculate progress data.' });
    }
  }
};
