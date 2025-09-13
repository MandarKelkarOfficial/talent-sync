

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useAuth } from '../context/AuthContext';
// import ProgressDashboard from './ProgressDashboard';

// // --- UI Components ---

// const LoadingSpinner = () => (
//   <div className="flex justify-center items-center py-10">
//     <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
//   </div>
// );

// const ProgressCard = ({ title, current, previous, isPercentage = false }) => {
//   const improvement = current - (previous || 0);
//   const improvementColor = improvement > 0 ? 'text-green-600' : improvement < 0 ? 'text-red-600' : 'text-gray-600';
//   const improvementIcon = improvement > 0 ? '↗' : improvement < 0 ? '↘' : '→';

//   return (
//     <div className="bg-white p-4 rounded-lg border">
//       <h4 className="text-sm font-medium text-gray-600 mb-1">{title}</h4>
//       <div className="flex items-center justify-between">
//         <span className="text-2xl font-bold text-gray-900">
//           {current}{isPercentage ? '%' : ''}
//         </span>
//         {previous !== undefined && (
//           <div className={`text-sm ${improvementColor} flex items-center`}>
//             <span className="mr-1">{improvementIcon}</span>
//             <span>
//               {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}{isPercentage ? '%' : ''}
//             </span>
//           </div>
//         )}
//       </div>
//       {previous !== undefined && (
//         <p className="text-xs text-gray-500 mt-1">
//           Previous: {previous}{isPercentage ? '%' : ''}
//         </p>
//       )}
//     </div>
//   );
// };

// const PreviousResultsPanel = ({ results, onViewDetails }) => {
//   if (!results || results.length === 0) {
//     return (
//       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
//         <h3 className="text-lg font-semibold text-blue-800 mb-2">Welcome to Your First Test!</h3>
//         <p className="text-blue-600">This will be your first aptitude assessment. After completion, you'll be able to track your progress over time.</p>
//       </div>
//     );
//   }

//   const latest = results[0];
//   const previous = results[1];

//   return (
//     <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//       <ProgressDashboard />

//       <hr className='underline mt-4' />

//       <div className="flex justify-between items-center mb-4 p-4">
//         <h3 className="text-xl font-semibold text-gray-800  ">Your Progress Overview</h3>
//         <button
//           onClick={() => onViewDetails('history')}
//           className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
//         >
//           View All Tests →
//         </button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//         <ProgressCard
//           title="Latest Score"
//           current={latest.overallScore}
//           previous={previous?.overallScore}
//           isPercentage={true}
//         />
//         <ProgressCard
//           title="Total Tests Taken"
//           current={results.length}
//         />
//         <ProgressCard
//           title="Average Score"
//           current={Math.round(results.reduce((sum, r) => sum + r.overallScore, 0) / results.length)}
//           isPercentage={true}
//         />
//       </div>

//       {latest.scoresByTopic && (
//         <div className="mt-4">
//           <h4 className="text-sm font-semibold text-gray-700 mb-2">Latest Performance by Topic:</h4>
//           <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
//             {latest.scoresByTopic.map(topic => {
//               const prevTopic = previous?.scoresByTopic?.find(p => p.topic === topic.topic);
//               const currentPerc = Math.round((topic.score / topic.total) * 100);
//               const prevPerc = prevTopic ? Math.round((prevTopic.score / prevTopic.total) * 100) : undefined;

//               return (
//                 <div key={topic.topic} className="bg-gray-50 p-2 rounded text-xs">
//                   <div className="font-medium text-gray-700 truncate">{topic.topic}</div>
//                   <div className="flex items-center justify-between">
//                     <span className="font-bold">{currentPerc}%</span>
//                     {prevPerc !== undefined && (
//                       <span className={`${currentPerc > prevPerc ? 'text-green-600' : currentPerc < prevPerc ? 'text-red-600' : 'text-gray-600'} text-xs`}>
//                         {currentPerc > prevPerc ? '+' : ''}{currentPerc - prevPerc}%
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       )}

//       <div className="mt-4 pt-4 border-t">
//         <p className="text-sm text-gray-600">
//           Last test taken: {new Date(latest.completedAt).toLocaleDateString('en-US', {
//             year: 'numeric', month: 'long', day: 'numeric'
//           })}
//         </p>
//       </div>
//     </div>
//   );
// };


// const TestHistoryModal = ({ results, onClose, onViewResult }) => (
//   <div className="fixed inset-0 bg-blue-600/30 backdrop-blur-sm flex items-center justify-center z-40 p-4">
//     <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto relative z-50">
//       <div className="p-6 border-b flex justify-between items-center">
//         <h2 className="text-xl font-bold text-gray-900">Test History</h2>
//         <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
//       </div>

//       <div className="p-6">
//         <div className="space-y-4">
//           {results.map((result, index) => (
//             <div key={result._id} className="border rounded-lg p-4 hover:bg-gray-50">
//               <div className="flex justify-between items-start">
//                 <div className="flex-1">
//                   <div className="flex items-center gap-4 mb-2">
//                     <span className="text-2xl font-bold text-indigo-600">{result.overallScore}%</span>
//                     {index === 0 && <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Latest</span>}
//                   </div>
//                   <p className="text-sm text-gray-600 mb-2">
//                     {new Date(result.completedAt).toLocaleDateString('en-US', {
//                       year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
//                     })}
//                   </p>
//                   <div className="flex flex-wrap gap-2">
//                     {result.scoresByTopic.map(topic => (
//                       <span key={topic.topic} className="bg-gray-100 px-2 py-1 rounded text-xs">
//                         {topic.topic}: {Math.round((topic.score / topic.total) * 100)}%
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => onViewResult(result)}
//                   className="ml-4 px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
//                 >
//                   View Details
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   </div>
// );


// const StartScreen = ({ onStart, previousResults, onViewHistory }) => (
//   <div className="space-y-6">
//     <PreviousResultsPanel results={previousResults} onViewDetails={onViewHistory} />
//     {/* <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-lg mx-auto"> */}
//     <div className="bg-white p-8 rounded-lg shadow-md text-center w-full md:max-w-6xl md:mx-auto">

//       <h2 className="text-2xl font-bold text-gray-900 mb-4">
//         {previousResults && previousResults.length > 0 ? 'Take Another Test' : 'Aptitude Assessment'}
//       </h2>
//       <p className="text-gray-600 mb-6">
//         {previousResults && previousResults.length > 0
//           ? 'Ready to improve your score? Take a new test to track your progress and identify areas of growth.'
//           : 'This test will evaluate your skills across several domains to provide insights into your strengths and areas for improvement.'
//         }
//       </p>
//       <button
//         onClick={onStart}
//         className="w-full px-6 py-3 
//     border border-indigo-600 
//     bg-purple-100 text-purple-900 font-medium 
//     rounded-md 
//     transition-colors duration-300 ease-in-out 
//     hover:bg-purple-600 hover:text-white
//   "
//       >
//         {previousResults && previousResults.length > 0 ? 'Start New Test' : 'Start Test'}
//       </button>
//     </div>
//   </div>
// );

// const QuestionScreen = ({ test, onSubmit, startTime }) => {
//   const [currentQ, setCurrentQ] = useState(0);
//   const [answers, setAnswers] = useState([]);
//   const [timeSpent, setTimeSpent] = useState(0);

//   useEffect(() => {
//     if (test?.questions && test.questions.length > 0) {
//       setAnswers(new Array(test.questions.length).fill(null));
//     }
//   }, [test]);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setTimeSpent(Math.floor((Date.now() - startTime) / 1000 / 60)); // minutes
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [startTime]);

//   if (!test || !test.questions || test.questions.length === 0) {
//     return <div>Preparing your test...</div>;
//   }

//   const question = test.questions[currentQ];

//   const handleAnswer = (option) => {
//     const newAnswers = [...answers];
//     newAnswers[currentQ] = {
//       questionId: question._id,
//       answer: option,
//       timeTaken: Math.floor((Date.now() - startTime) / 1000) // seconds since start
//     };
//     setAnswers(newAnswers);
//   };

//   const handleNext = () => {
//     if (currentQ < test.questions.length - 1) {
//       setCurrentQ(currentQ + 1);
//     }
//   };

//   const handlePrevious = () => {
//     if (currentQ > 0) {
//       setCurrentQ(currentQ - 1);
//     }
//   };

//   const handleSubmit = () => {
//     const unanswered = answers.filter(a => a === null).length;
//     if (unanswered > 0) {
//       alert(`Please answer all ${unanswered} remaining questions before submitting.`);
//       return;
//     }
//     onSubmit(answers, timeSpent);
//   };

//   const selectedAnswer = answers[currentQ]?.answer;

//   return (
//     <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
//       {/* <div className="mb-4 flex justify-between items-center">
//         <div>
//           <span className="text-sm font-semibold text-indigo-600">{question.topic}</span>
//           <p className="text-sm text-gray-500">Question {currentQ + 1} of {test.questions.length}</p>
//         </div>
//         <div className="text-sm text-gray-500">
//           Time: {timeSpent}m
//         </div>
//       </div> */}

//       <div className="mb-4 flex justify-between items-center">
//         <div>
//           <span className="text-sm font-semibold text-indigo-600">
//             {question.topic}
//             {question.topic === 'Personality' && (
//               <span className="ml-2 text-xs text-gray-500">(No right/wrong answers)</span>
//             )}
//           </span>
//           <p className="text-sm text-gray-500">Question {currentQ + 1} of {test.questions.length}</p>
//         </div>
//         <div className="text-sm text-gray-500">
//           Time: {timeSpent}m
//         </div>
//       </div>

//       <div className="mb-4">
//         <div className="w-full bg-gray-200 rounded-full h-2">
//           <div
//             className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
//             style={{ width: `${((currentQ + 1) / test.questions.length) * 100}%` }}
//           ></div>
//         </div>
//       </div>

//       <p className="text-lg text-gray-800 mb-6">{question.questionText}</p>

//       {question.options && question.options.length > 0 ? (
//         <div className="space-y-3">
//           {question.options.map((option, index) => (
//             <label key={index} className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
//               <input
//                 type="radio"
//                 name={`question_${currentQ}`}
//                 value={option}
//                 checked={selectedAnswer === option}
//                 onChange={() => handleAnswer(option)}
//                 className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
//               />
//               <span className="ml-3 text-gray-700">{option}</span>
//             </label>
//           ))}
//         </div>
//       ) : (
//         <div className="bg-red-50 border border-red-200 rounded-md p-4">
//           <p className="text-red-600">No options available for this question.</p>
//         </div>
//       )}

//       <div className="mt-8 flex justify-between">
//         <button
//           onClick={handlePrevious}
//           disabled={currentQ === 0}
//           className="px-5 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-300"
//         >
//           Previous
//         </button>

//         <div className="flex space-x-3">
//           {currentQ < test.questions.length - 1 ? (
//             <button
//               onClick={handleNext}
//               className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
//             >
//               Next
//             </button>
//           ) : (
//             <button
//               onClick={handleSubmit}
//               className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
//             >
//               Submit Test
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// const ImprovementHighlights = ({ current, previous }) => {
//   if (!previous) return null;

//   const improvedTopics = [];
//   const declinedTopics = [];

//   current.scoresByTopic.forEach(currentTopic => {
//     const prevTopic = previous.scoresByTopic.find(p => p.topic === currentTopic.topic);
//     if (prevTopic) {
//       const currentPerc = Math.round((currentTopic.score / currentTopic.total) * 100);
//       const prevPerc = Math.round((prevTopic.score / prevTopic.total) * 100);
//       const improvement = currentPerc - prevPerc;

//       if (improvement > 0) {
//         improvedTopics.push({ topic: currentTopic.topic, improvement });
//       } else if (improvement < 0) {
//         declinedTopics.push({ topic: currentTopic.topic, decline: Math.abs(improvement) });
//       }
//     }
//   });

//   return (
//     <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
//       <h4 className="text-lg font-semibold text-gray-800 mb-3">Progress Since Last Test</h4>
//       <div className="grid md:grid-cols-2 gap-4">
//         {improvedTopics.length > 0 && (
//           <div className="bg-white p-3 rounded border-l-4 border-green-500">
//             <h5 className="font-medium text-green-800 mb-2">Areas of Improvement 📈</h5>
//             <ul className="space-y-1">
//               {improvedTopics.map(item => (
//                 <li key={item.topic} className="text-sm text-green-700">
//                   <strong>{item.topic}</strong>: +{item.improvement}% improvement
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {declinedTopics.length > 0 && (
//           <div className="bg-white p-3 rounded border-l-4 border-amber-500">
//             <h5 className="font-medium text-amber-800 mb-2">Focus Areas 📚</h5>
//             <ul className="space-y-1">
//               {declinedTopics.map(item => (
//                 <li key={item.topic} className="text-sm text-amber-700">
//                   <strong>{item.topic}</strong>: -{item.decline}% (needs attention)
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}
//       </div>

//       <div className="mt-3 text-sm text-gray-600">
//         Overall Progress: {current.overallScore - previous.overallScore > 0 ? '+' : ''}{(current.overallScore - previous.overallScore).toFixed(1)}%
//         ({previous.overallScore}% → {current.overallScore}%)
//       </div>
//     </div>
//   );
// };

// const ReportScreen = ({ result, previousResults }) => {
//   const previousResult = previousResults?.[0];

//   return (
//     <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
//       <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Assessment Report</h2>
//       <div className="text-center mb-6">
//         <p className="text-lg text-gray-600">Overall Score</p>
//         <div className="flex items-center justify-center gap-2">
//           <p className="text-5xl font-bold text-indigo-600">{result.overallScore}%</p>
//           {previousResult && (
//             <div className="text-lg">
//               {result.overallScore > previousResult.overallScore ? (
//                 <span className="text-green-600">↗ +{(result.overallScore - previousResult.overallScore).toFixed(1)}%</span>
//               ) : result.overallScore < previousResult.overallScore ? (
//                 <span className="text-red-600">↘ {(result.overallScore - previousResult.overallScore).toFixed(1)}%</span>
//               ) : (
//                 <span className="text-gray-600">→ No change</span>
//               )}
//             </div>
//           )}
//         </div>
//       </div>

//       <ImprovementHighlights current={result} previous={previousResult} />

//       <div className="mb-6">
//         <h4 className="text-xl font-semibold text-gray-800 mb-3">Scores by Topic:</h4>
//         <ul className="space-y-2">
//           {result.scoresByTopic.map(s => {
//             const prevTopic = previousResult?.scoresByTopic?.find(p => p.topic === s.topic);
//             const currentPerc = Math.round((s.score / s.total) * 100);
//             const prevPerc = prevTopic ? Math.round((prevTopic.score / prevTopic.total) * 100) : null;

//             return (
//               <li key={s.topic} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
//                 <span className="font-medium text-gray-700">{s.topic}</span>
//                 <div className="flex items-center gap-2">
//                   <span className="font-bold text-indigo-600">{s.score} / {s.total}</span>
//                   <span className="text-sm text-gray-500">({currentPerc}%)</span>
//                   {prevPerc && (
//                     <span className={`text-xs px-2 py-1 rounded ${currentPerc > prevPerc ? 'bg-green-100 text-green-700' :
//                       currentPerc < prevPerc ? 'bg-red-100 text-red-700' :
//                         'bg-gray-100 text-gray-700'
//                       }`}>
//                       {currentPerc > prevPerc ? '+' : ''}{currentPerc - prevPerc}%
//                     </span>
//                   )}
//                 </div>
//               </li>
//             );
//           })}
//         </ul>
//       </div>

//       {result.report.overallSummary && <div className="mb-6">
//         <h4 className="text-xl font-semibold text-gray-800 mb-2">Summary</h4>
//         <p className="text-gray-600">{result.report.overallSummary}</p>
//       </div>}

//       {result.report.personalityInsights && <div className="mb-6">
//         <h4 className="text-xl font-semibold text-gray-800 mb-2">Personality Insights</h4>
//         <p className="text-gray-600">{result.report.personalityInsights}</p>
//       </div>}

//       <div className="grid md:grid-cols-2 gap-6">
//         {result.report.strengths && <div className="bg-green-50 p-4 rounded-lg">
//           <h4 className="text-xl font-semibold text-green-800 mb-2">Strengths</h4>
//           <ul className="list-disc list-inside text-green-700 space-y-1">
//             {result.report.strengths.map((s, i) => <li key={i}>{s}</li>)}
//           </ul>
//         </div>}
//         {result.report.areasForImprovement && <div className="bg-red-50 p-4 rounded-lg">
//           <h4 className="text-xl font-semibold text-red-800 mb-2">Areas for Improvement</h4>
//           <ul className="list-disc list-inside text-red-700 space-y-1">
//             {result.report.areasForImprovement.map((s, i) => <li key={i}>{s}</li>)}
//           </ul>
//         </div>}
//       </div>

//       <div className="mt-6 text-center">
//         <button
//           onClick={() => window.location.reload()}
//           className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
//         >
//           Take Another Test
//         </button>
//       </div>
//     </div>
//   );
// };

// // --- Main Component ---

// export default function AptitudeTest() {
//   const [testState, setTestState] = useState('idle');
//   const [testData, setTestData] = useState(null);
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState('');
//   const [previousResults, setPreviousResults] = useState([]);
//   const [showHistory, setShowHistory] = useState(false);
//   const [startTime, setStartTime] = useState(null);
//   const { user } = useAuth();
//   const studentId = user?._id;

//   // Fetch previous results on component mount
//   useEffect(() => {
//     if (studentId) {
//       fetchPreviousResults();
//     }
//   }, [studentId]);

//   const fetchPreviousResults = async () => {
//     try {
//       const response = await axios.get(`/api/aptitude/student/${studentId}/results?limit=10`);
//       setPreviousResults(response.data || []);
//     } catch (err) {
//       console.log('No previous results found or error fetching them');
//       setPreviousResults([]);
//     }
//   };

//   const handleStartTest = async () => {
//     if (!studentId) {
//       setError('You must be logged in to start the test.');
//       return;
//     }

//     setTestState('generating');
//     setError('');
//     setStartTime(Date.now());

//     try {
//       const response = await axios.post('/api/aptitude/generate', { studentId });

//       if (!response.data || !response.data.test) {
//         throw new Error('Invalid response structure from server');
//       }

//       const testData = response.data.test;

//       if (!testData.questions || testData.questions.length === 0) {
//         throw new Error('No questions received from server');
//       }

//       setTestData(testData);
//       setTestState('in-progress');

//     } catch (err) {
//       console.error('Test generation error:', err);
//       setError(
//         err.response?.data?.message ||
//         err.message ||
//         'Failed to generate the test. Please try again.'
//       );
//       setTestState('idle');
//     }
//   };

//   const handleSubmitTest = async (answers, timeSpent) => {
//     if (!studentId || !testData?._id) {
//       setError('Test data is missing. Please restart the test.');
//       return;
//     }

//     setTestState('submitting');
//     setError('');

//     try {
//       const response = await axios.post(`/api/aptitude/submit/${testData._id}`, {
//         studentId,
//         answers,
//         timeSpent,
//         startTime
//       });

//       setResult(response.data.result);
//       setTestState('completed');

//       // Refresh previous results to include the new one
//       await fetchPreviousResults();

//     } catch (err) {
//       console.error('Test submission error:', err);
//       setError(
//         err.response?.data?.message ||
//         'Failed to submit the test. Please try again.'
//       );
//       setTestState('in-progress');
//     }
//   };

//   const handleViewHistory = (action) => {
//     if (action === 'history') {
//       setShowHistory(true);
//     }
//   };

//   const handleViewResult = (resultData) => {
//     setResult(resultData);
//     setTestState('completed');
//     setShowHistory(false);
//   };

//   const renderContent = () => {
//     switch (testState) {
//       case 'generating':
//         return (
//           <div className="text-center">
//             <LoadingSpinner />
//             <p className="text-gray-600 mt-4">Generating your personalized test...</p>
//           </div>
//         );
//       case 'submitting':
//         return (
//           <div className="text-center">
//             <LoadingSpinner />
//             <p className="text-gray-600 mt-4">Analyzing your responses and generating report...</p>
//           </div>
//         );
//       case 'in-progress':
//         return <QuestionScreen test={testData} onSubmit={handleSubmitTest} startTime={startTime} />;
//       case 'completed':
//         return <ReportScreen result={result} previousResults={previousResults} />;
//       case 'idle':
//       default:
//         return <StartScreen onStart={handleStartTest} previousResults={previousResults} onViewHistory={handleViewHistory} />;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
//       <div className="max-w-6xl mx-auto">
//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//             <p className="font-medium">Error:</p>
//             <p>{error}</p>
//           </div>
//         )}
//         {renderContent()}

//         {showHistory && (
//           <TestHistoryModal
//             results={previousResults}
//             onClose={() => setShowHistory(false)}
//             onViewResult={handleViewResult}
//           />
//         )}
//       </div>
//     </div>
//   );
// }


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ProgressDashboard from './ProgressDashboardApptitude';

// --- UI Components ---

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="relative w-16 h-16">
      <div className="w-full h-full border-4 border-indigo-100 rounded-full"></div>
      <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent rounded-full animate-spin border-t-indigo-500 border-r-indigo-400"></div>
      <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent rounded-full animate-spin border-b-indigo-600 delay-300"></div>
    </div>
  </div>
);

const ProgressCard = ({ title, current, previous, isPercentage = false }) => {
  const improvement = current - (previous || 0);
  const improvementColor = improvement > 0 ? 'text-green-600' : improvement < 0 ? 'text-red-600' : 'text-gray-600';
  const improvementIcon = improvement > 0 ? '↗' : improvement < 0 ? '↘' : '→';

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <h4 className="text-sm font-medium text-gray-600 mb-2">{title}</h4>
      <div className="flex items-center justify-between">
        <span className="text-3xl font-bold text-gray-900">
          {current}{isPercentage ? '%' : ''}
        </span>
        {previous !== undefined && (
          <div className={`text-sm ${improvementColor} flex items-center`}>
            <span className="mr-1">{improvementIcon}</span>
            <span>
              {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}{isPercentage ? '%' : ''}
            </span>
          </div>
        )}
      </div>
      {previous !== undefined && (
        <p className="text-xs text-gray-500 mt-2">
          Previous: {previous}{isPercentage ? '%' : ''}
        </p>
      )}
    </div>
  );
};

const PreviousResultsPanel = ({ results, onViewDetails }) => {
  if (!results || results.length === 0) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 shadow-md">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Welcome to Your First Test!</h3>
        <p className="text-blue-600">This will be your first aptitude assessment. After completion, you'll be able to track your progress over time.</p>
      </div>
    );
  }

  const latest = results[0];
  const previous = results[1];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 transition-all duration-300">
      <ProgressDashboard />

      <div className="border-t border-gray-100 my-6"></div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Your Progress Overview</h3>
        <button
          onClick={() => onViewDetails('history')}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-all duration-300 hover:translate-x-1 flex items-center"
        >
          View All Tests <span className="ml-1">→</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <ProgressCard
          title="Latest Score"
          current={latest.overallScore}
          previous={previous?.overallScore}
          isPercentage={true}
        />
        <ProgressCard
          title="Total Tests Taken"
          current={results.length}
        />
        <ProgressCard
          title="Average Score"
          current={Math.round(results.reduce((sum, r) => sum + r.overallScore, 0) / results.length)}
          isPercentage={true}
        />
      </div>

      {latest.scoresByTopic && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Latest Performance by Topic:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {latest.scoresByTopic.map(topic => {
              const prevTopic = previous?.scoresByTopic?.find(p => p.topic === topic.topic);
              const currentPerc = Math.round((topic.score / topic.total) * 100);
              const prevPerc = prevTopic ? Math.round((prevTopic.score / prevTopic.total) * 100) : undefined;

              return (
                <div key={topic.topic} className="bg-gray-50 p-3 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md">
                  <div className="font-medium text-gray-700 truncate">{topic.topic}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-bold">{currentPerc}%</span>
                    {prevPerc !== undefined && (
                      <span className={`${currentPerc > prevPerc ? 'text-green-600' : currentPerc < prevPerc ? 'text-red-600' : 'text-gray-600'} text-xs`}>
                        {currentPerc > prevPerc ? '+' : ''}{currentPerc - prevPerc}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-600">
          Last test taken: {new Date(latest.completedAt).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
          })}
        </p>
      </div>
    </div>
  );
};


const TestHistoryModal = ({ results, onClose, onViewResult }) => (
  <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto animate-scale-in">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Test History</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl transition-transform duration-200 hover:rotate-90">×</button>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={result._id} className="border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-2xl font-bold text-indigo-600">{result.overallScore}%</span>
                    {index === 0 && <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Latest</span>}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {new Date(result.completedAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.scoresByTopic.map(topic => (
                      <span key={topic.topic} className="bg-gray-100 px-3 py-1 rounded-lg text-xs shadow-sm">
                        {topic.topic}: {Math.round((topic.score / topic.total) * 100)}%
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => onViewResult(result)}
                  className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);


const StartScreen = ({ onStart, previousResults, onViewHistory }) => (
  <div className="space-y-8">
    <PreviousResultsPanel results={previousResults} onViewDetails={onViewHistory} />
    
    <div className="bg-white p-8 rounded-xl shadow-lg text-center w-full md:max-w-6xl mx-auto transition-all duration-300 hover:shadow-xl">
      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {previousResults && previousResults.length > 0 ? 'Take Another Test' : 'Aptitude Assessment'}
      </h2>
      <p className="text-gray-600 mb-6">
        {previousResults && previousResults.length > 0
          ? 'Ready to improve your score? Take a new test to track your progress and identify areas of growth.'
          : 'This test will evaluate your skills across several domains to provide insights into your strengths and areas for improvement.'
        }
      </p>
      <button
        onClick={onStart}
        className=" w-full px-8 py-4
    bg-gradient-to-r from-indigo-200 via-indigo-300 to-purple-200
    text-purple-900 font-medium rounded-xl
    shadow-md
    transition-colors duration-300 ease-in-out
    transform-gpu hover:-translate-y-1 hover:shadow-lg
    hover:from-purple-600 hover:to-purple-700 hover:text-white
    focus:outline-none focus:ring-4 focus:ring-purple-200
    active:scale-95"
      >
        {previousResults && previousResults.length > 0 ? 'Start New Test' : 'Start Test'}
      </button>
    </div>
  </div>
);

const QuestionScreen = ({ test, onSubmit, startTime }) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    if (test?.questions && test.questions.length > 0) {
      setAnswers(new Array(test.questions.length).fill(null));
    }
  }, [test]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000 / 60)); // minutes
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  if (!test || !test.questions || test.questions.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto text-center">
        <LoadingSpinner />
        <p className="text-gray-600 mt-4">Preparing your test...</p>
      </div>
    );
  }

  const question = test.questions[currentQ];

  const handleAnswer = (option) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = {
      questionId: question._id,
      answer: option,
      timeTaken: Math.floor((Date.now() - startTime) / 1000) // seconds since start
    };
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQ < test.questions.length - 1) {
      setCurrentQ(currentQ + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
    }
  };

  const handleSubmit = () => {
    const unanswered = answers.filter(a => a === null).length;
    if (unanswered > 0) {
      alert(`Please answer all ${unanswered} remaining questions before submitting.`);
      return;
    }
    onSubmit(answers, timeSpent);
  };

  const selectedAnswer = answers[currentQ]?.answer;

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto transition-all duration-300">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <span className="text-sm font-semibold text-indigo-600">
            {question.topic}
            {question.topic === 'Personality' && (
              <span className="ml-2 text-xs text-gray-500">(No right/wrong answers)</span>
            )}
          </span>
          <p className="text-sm text-gray-500">Question {currentQ + 1} of {test.questions.length}</p>
        </div>
        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full shadow-sm">
          Time: {timeSpent}m
        </div>
      </div>

      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentQ + 1) / test.questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <p className="text-lg text-gray-800 mb-6">{question.questionText}</p>

      {question.options && question.options.length > 0 ? (
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <label key={index} className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 ${selectedAnswer === option ? 'bg-indigo-50 shadow-md border border-indigo-100' : 'bg-gray-50 hover:bg-gray-100 shadow-sm'}`}>
              <input
                type="radio"
                name={`question_${currentQ}`}
                value={option}
                checked={selectedAnswer === option}
                onChange={() => handleAnswer(option)}
                className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
              />
              <span className="ml-3 text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      ) : (
        <div className="bg-red-50 p-4 rounded-lg shadow-sm">
          <p className="text-red-600">No options available for this question.</p>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQ === 0}
          className="px-5 py-2 bg-gray-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div className="flex space-x-3">
          {currentQ < test.questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg hover:bg-indigo-700 transition-all duration-300"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-5 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              Submit Test
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ImprovementHighlights = ({ current, previous }) => {
  if (!previous) return null;

  const improvedTopics = [];
  const declinedTopics = [];

  current.scoresByTopic.forEach(currentTopic => {
    const prevTopic = previous.scoresByTopic.find(p => p.topic === currentTopic.topic);
    if (prevTopic) {
      const currentPerc = Math.round((currentTopic.score / currentTopic.total) * 100);
      const prevPerc = Math.round((prevTopic.score / prevTopic.total) * 100);
      const improvement = currentPerc - prevPerc;

      if (improvement > 0) {
        improvedTopics.push({ topic: currentTopic.topic, improvement });
      } else if (improvement < 0) {
        declinedTopics.push({ topic: currentTopic.topic, decline: Math.abs(improvement) });
      }
    }
  });

  return (
    <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-md">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">Progress Since Last Test</h4>
      <div className="grid md:grid-cols-2 gap-4">
        {improvedTopics.length > 0 && (
          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
            <h5 className="font-medium text-green-800 mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              Areas of Improvement
            </h5>
            <ul className="space-y-1">
              {improvedTopics.map(item => (
                <li key={item.topic} className="text-sm text-green-700">
                  <strong>{item.topic}</strong>: +{item.improvement}% improvement
                </li>
              ))}
            </ul>
          </div>
        )}

        {declinedTopics.length > 0 && (
          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-amber-500">
            <h5 className="font-medium text-amber-800 mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              Focus Areas
            </h5>
            <ul className="space-y-1">
              {declinedTopics.map(item => (
                <li key={item.topic} className="text-sm text-amber-700">
                  <strong>{item.topic}</strong>: -{item.decline}% (needs attention)
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600 bg-white p-3 rounded-lg shadow-sm inline-block">
        Overall Progress: {current.overallScore - previous.overallScore > 0 ? '+' : ''}{(current.overallScore - previous.overallScore).toFixed(1)}%
        ({previous.overallScore}% → {current.overallScore}%)
      </div>
    </div>
  );
};

const ReportScreen = ({ result, previousResults }) => {
  const previousResult = previousResults?.[0];

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto transition-all duration-300">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Assessment Report</h2>
        <p className="text-lg text-gray-600">Overall Score</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <p className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{result.overallScore}%</p>
          {previousResult && (
            <div className="text-lg">
              {result.overallScore > previousResult.overallScore ? (
                <span className="text-green-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  +{(result.overallScore - previousResult.overallScore).toFixed(1)}%
                </span>
              ) : result.overallScore < previousResult.overallScore ? (
                <span className="text-red-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  {(result.overallScore - previousResult.overallScore).toFixed(1)}%
                </span>
              ) : (
                <span className="text-gray-600">→ No change</span>
              )}
            </div>
          )}
        </div>
      </div>

      <ImprovementHighlights current={result} previous={previousResult} />

      <div className="mb-8">
        <h4 className="text-xl font-semibold text-gray-800 mb-4">Scores by Topic:</h4>
        <ul className="space-y-3">
          {result.scoresByTopic.map(s => {
            const prevTopic = previousResult?.scoresByTopic?.find(p => p.topic === s.topic);
            const currentPerc = Math.round((s.score / s.total) * 100);
            const prevPerc = prevTopic ? Math.round((prevTopic.score / prevTopic.total) * 100) : null;

            return (
              <li key={s.topic} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md">
                <span className="font-medium text-gray-700">{s.topic}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-indigo-600">{s.score} / {s.total}</span>
                  <span className="text-sm text-gray-500">({currentPerc}%)</span>
                  {prevPerc && (
                    <span className={`text-xs px-2 py-1 rounded-full ${currentPerc > prevPerc ? 'bg-green-100 text-green-700' :
                      currentPerc < prevPerc ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                      {currentPerc > prevPerc ? '+' : ''}{currentPerc - prevPerc}%
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {result.report.overallSummary && <div className="mb-6 p-5 bg-blue-50 rounded-xl shadow-sm">
        <h4 className="text-xl font-semibold text-blue-800 mb-2">Summary</h4>
        <p className="text-blue-700">{result.report.overallSummary}</p>
      </div>}

      {result.report.personalityInsights && <div className="mb-6 p-5 bg-purple-50 rounded-xl shadow-sm">
        <h4 className="text-xl font-semibold text-purple-800 mb-2">Personality Insights</h4>
        <p className="text-purple-700">{result.report.personalityInsights}</p>
      </div>}

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {result.report.strengths && <div className="bg-green-50 p-5 rounded-xl shadow-sm">
          <h4 className="text-xl font-semibold text-green-800 mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Strengths
          </h4>
          <ul className="list-disc list-inside text-green-700 space-y-1">
            {result.report.strengths.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>}
        {result.report.areasForImprovement && <div className="bg-red-50 p-5 rounded-xl shadow-sm">
          <h4 className="text-xl font-semibold text-red-800 mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Areas for Improvement
          </h4>
          <ul className="list-disc list-inside text-red-700 space-y-1">
            {result.report.areasForImprovement.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>}
      </div>

      <div className="text-center">
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        >
          Take Another Test
        </button>
      </div>
    </div>
  );
};

// --- Main Component ---

export default function AptitudeTest() {
  const [testState, setTestState] = useState('idle');
  const [testData, setTestData] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [previousResults, setPreviousResults] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const { user } = useAuth();
  const studentId = user?._id;

  // Fetch previous results on component mount
  useEffect(() => {
    if (studentId) {
      fetchPreviousResults();
    }
  }, [studentId]);

  const fetchPreviousResults = async () => {
    try {
      const response = await axios.get(`/api/aptitude/student/${studentId}/results?limit=10`);
      setPreviousResults(response.data || []);
    } catch (err) {
      console.log('No previous results found or error fetching them');
      setPreviousResults([]);
    }
  };

  const handleStartTest = async () => {
    if (!studentId) {
      setError('You must be logged in to start the test.');
      return;
    }

    setTestState('generating');
    setError('');
    setStartTime(Date.now());

    try {
      const response = await axios.post('/api/aptitude/generate', { studentId });

      if (!response.data || !response.data.test) {
        throw new Error('Invalid response structure from server');
      }

      const testData = response.data.test;

      if (!testData.questions || testData.questions.length === 0) {
        throw new Error('No questions received from server');
      }

      setTestData(testData);
      setTestState('in-progress');

    } catch (err) {
      console.error('Test generation error:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to generate the test. Please try again.'
      );
      setTestState('idle');
    }
  };

  const handleSubmitTest = async (answers, timeSpent) => {
    if (!studentId || !testData?._id) {
      setError('Test data is missing. Please restart the test.');
      return;
    }

    setTestState('submitting');
    setError('');

    try {
      const response = await axios.post(`/api/aptitude/submit/${testData._id}`, {
        studentId,
        answers,
        timeSpent,
        startTime
      });

      setResult(response.data.result);
      setTestState('completed');

      // Refresh previous results to include the new one
      await fetchPreviousResults();

    } catch (err) {
      console.error('Test submission error:', err);
      setError(
        err.response?.data?.message ||
        'Failed to submit the test. Please try again.'
      );
      setTestState('in-progress');
    }
  };

  const handleViewHistory = (action) => {
    if (action === 'history') {
      setShowHistory(true);
    }
  };

  const handleViewResult = (resultData) => {
    setResult(resultData);
    setTestState('completed');
    setShowHistory(false);
  };

  const renderContent = () => {
    switch (testState) {
      case 'generating':
        return (
          <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
            <LoadingSpinner />
            <p className="text-gray-600 mt-4">Generating your personalized test...</p>
          </div>
        );
      case 'submitting':
        return (
          <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
            <LoadingSpinner />
            <p className="text-gray-600 mt-4">Analyzing your responses and generating report...</p>
          </div>
        );
      case 'in-progress':
        return <QuestionScreen test={testData} onSubmit={handleSubmitTest} startTime={startTime} />;
      case 'completed':
        return <ReportScreen result={result} previousResults={previousResults} />;
      case 'idle':
      default:
        return <StartScreen onStart={handleStartTest} previousResults={previousResults} onViewHistory={handleViewHistory} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md mb-6 animate-fade-in">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}
        {renderContent()}

        {showHistory && (
          <TestHistoryModal
            results={previousResults}
            onClose={() => setShowHistory(false)}
            onViewResult={handleViewResult}
          />
        )}
      </div>
    </div>
  );
}