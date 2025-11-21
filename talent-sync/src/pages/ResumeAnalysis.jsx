// /**
//  *  @author Mandar K.
//  * @date 2025-09-13
//  * 
//  */

// import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import ResumeUploader from '../components/ResumeUploader.jsx';
// import AtsCalculator from '../components/AtsCalculator.jsx';
// import { AtsSummary, ImprovementSuggestions } from '../components/AtsResult.jsx';
// import { useAuth } from '../context/AuthContext';

// const ResumeAnalysis = () => {
//   const [resumes, setResumes] = useState([]);
//   const [atsResult, setAtsResult] = useState(null);
//   const [isLoadingResumes, setIsLoadingResumes] = useState(true);
//   const [fetchError, setFetchError] = useState('');

//   // UI state
//   const [activeTab, setActiveTab] = useState('analyze'); // 'analyze' | 'summaries'
//   const [selectedSummaryResumeId, setSelectedSummaryResumeId] = useState(null);
//   const [selectedForAnalyze, setSelectedForAnalyze] = useState(null); // resume id to preselect in analyzer

//   const { user } = useAuth();

//   const fetchResumes = useCallback(async () => {
//     setIsLoadingResumes(true);
//     setFetchError('');
//     try {
//       if (!user || !user._id) {
//         setResumes([]);
//         return;
//       }
//       const { data } = await axios.get(`/api/resumes?studentId=${user._id}`);
//       setResumes(data || []);
//     } catch (error) {
//       console.error("Failed to fetch resumes:", error);
//       setFetchError('Failed to load resumes. Try refreshing or check your network.');
//     } finally {
//       setIsLoadingResumes(false);
//     }
//   }, [user]);

//   // initial fetch
//   useEffect(() => {
//     fetchResumes();
//   }, [fetchResumes]);

//   const handleUploadSuccess = (newResume) => {
//     // Re-fetch resumes after a new one is uploaded; select new resume for quick analysis
//     fetchResumes();
//     setAtsResult(null);
//     if (newResume?._id) {
//       setSelectedForAnalyze(newResume._id);
//       setActiveTab('analyze');
//     }
//   };

//   const handleCalculationComplete = (result) => {
//     // result is either the ATS object or null if failed
//     setAtsResult(result);

//     // If analysis succeeded, refresh resume list so 'Last Score' chip updates immediately
//     if (result) {
//       // small debounce to let server finish saving if needed
//       setTimeout(() => {
//         fetchResumes();
//       }, 400);
//       // switch to summaries so user sees saved result (optional)
//       setActiveTab('summaries');
//     }
//   };

//   // convenience: supply default selected resume id (optional)
//   const defaultResumeId = resumes && resumes.length > 0 ? resumes[0]._id : null;

//   // when user clicks a resume in Summaries list, show its ATS (if any)
//   const handleSelectSummaryResume = (resumeId) => {
//     setSelectedSummaryResumeId(resumeId);
//     const r = resumes.find(x => x._id === resumeId);
//     if (r?.ats) {
//       setAtsResult(r.ats);
//     } else {
//       setAtsResult(null);
//     }
//   };

//   // click "Analyze" from a resume card -> go to analyze tab with that resume selected
//   const handleAnalyzeResume = (resumeId) => {
//     setSelectedForAnalyze(resumeId);
//     setActiveTab('analyze');
//     // clear previous result so calculator UI is fresh
//     setAtsResult(null);
//     // small scroll into view could be added if desired
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
//       <div className="max-w-7xl mx-auto">
//         <header className="mb-8">
//           <h1 className="text-4xl font-bold text-gray-900">Resume Analysis Dashboard</h1>
//           <p className="mt-2 text-sm text-gray-600">
//             Upload resumes, run AI-powered ATS checks, and inspect saved summaries.
//           </p>

//           {/* Tabs */}
//           <div className="mt-6">
//             <nav className="inline-flex rounded-lg bg-white shadow-sm ring-1 ring-gray-100">
//               <button
//                 onClick={() => setActiveTab('analyze')}
//                 className={`px-4 py-2 rounded-l-lg text-sm font-medium transition ${
//                   activeTab === 'analyze'
//                     ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow'
//                     : 'text-gray-700 hover:bg-gray-50'
//                 }`}
//               >
//                 Upload & Analyze
//               </button>
//               <button
//                 onClick={() => { setActiveTab('summaries'); setSelectedForAnalyze(null); }}
//                 className={`px-4 py-2 rounded-r-lg text-sm font-medium transition ${ 
//                   activeTab === 'summaries' 
//                     ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow' 
//                     : 'text-gray-700 hover:bg-gray-50'
//                 }`}
//               >
//                 Summaries
//                 <span className="ml-2 inline-block text-xs font-normal bg-white/10 px-2 py-0.5 rounded-full">
//                   {resumes.length}
//                 </span>
//               </button>
//             </nav>
//           </div>
//         </header>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
//           {/* LEFT: depending on activeTab */}
//           <div className="flex flex-col gap-8">
//             {activeTab === 'analyze' ? (
//               <>
//                 <ResumeUploader onUploadSuccess={handleUploadSuccess} />

//                 {isLoadingResumes ? (
//                   <div className="p-6 bg-white rounded-lg shadow-md">Loading resumes...</div>
//                 ) : fetchError ? (
//                   <div className="p-3 bg-red-50 border border-red-200 rounded">
//                     <p className="text-red-600 text-sm">{fetchError}</p>
//                   </div>
//                 ) : (
//                   <AtsCalculator
//                     resumes={resumes}
//                     selectedResumeId={selectedForAnalyze || defaultResumeId}
//                     onCalculationComplete={handleCalculationComplete}
//                   />
//                 )}
//               </>
//             ) : (
//               // Summaries tab left column: list of resumes
//               <div className="p-6 bg-white rounded-lg shadow-md">
//                 <div className="flex items-center justify-between mb-4">
//                   <div>
//                     <h2 className="text-xl font-semibold text-gray-800">Uploaded Resumes</h2>
//                     <p className="text-sm text-gray-500">Select a resume to view its latest analysis.</p>
//                   </div>
//                   <div>
//                     <button
//                       onClick={() => { setActiveTab('analyze'); setSelectedForAnalyze(defaultResumeId); }}
//                       className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md shadow hover:bg-indigo-700"
//                     >
//                       + Analyze New
//                     </button>
//                   </div>
//                 </div>

//                 {resumes.length === 0 ? (
//                   <div className="py-12 text-center text-sm text-gray-500">
//                     No resumes uploaded yet. Go to <strong>Upload & Analyze</strong> to add one.
//                   </div>
//                 ) : (
//                   <div className="space-y-3">
//                     {resumes.map(r => {
//                       const hasAts = !!r.ats?.score;
//                       return (
//                         <div key={r._id} className="flex items-center justify-between gap-4 p-3 rounded-lg border border-gray-100 hover:shadow-sm transition">
//                           <div className="flex items-start gap-3">
//                             <div className="flex-shrink-0">
//                               <div className="h-10 w-10 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-600 font-semibold">
//                                 {r.title?.charAt(0)?.toUpperCase() || 'R'}
//                               </div>
//                             </div>
//                             <div>
//                               <div className="text-sm font-medium text-gray-800">{r.title}</div>
//                               <div className="text-xs text-gray-500 mt-0.5">{r.filename} • {new Date(r.createdAt).toLocaleDateString()}</div>
//                               {hasAts && (
//                                 <div className="mt-2 text-xs">
//                                   <span className="inline-block bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full mr-2">Score: {r.ats.score}%</span>
//                                   <span className="inline-block bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
//                                     {r.ats.matchInfo?.level || r.ats.matchInfo?.description || '—'}
//                                   </span>
//                                 </div>
//                               )}
//                             </div>
//                           </div>

//                           <div className="flex items-center gap-2">
//                             <button
//                               onClick={() => handleSelectSummaryResume(r._id)}
//                               className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-md hover:bg-gray-50"
//                             >
//                               View
//                             </button>
//                             <button
//                               onClick={() => handleAnalyzeResume(r._id)}
//                               className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
//                             >
//                               Analyze
//                             </button>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* RIGHT: summary / result panel */}
//           <div className="flex flex-col gap-8">
//             {activeTab === 'analyze' ? (
//               // show right-side placeholder while analyzing
//               atsResult ? (
//                 <>
//                   <AtsSummary 
//                     summary={atsResult.summary} 
//                     score={atsResult.score}
//                     matchInfo={atsResult.matchInfo}
//                   />
//                   <ImprovementSuggestions 
//                     tips={atsResult.improvementTips}
//                     keywords={atsResult.matchedKeywords}
//                   />
//                 </>
//               ) : (
//                 <div className="p-6 bg-white rounded-lg shadow-md w-full h-full flex flex-col justify-center items-center text-center">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                   </svg>
//                   <h3 className="text-xl font-semibold text-gray-700">Your analysis will appear here.</h3>
//                   <p className="text-gray-500 mt-1">Run an analysis or select a resume to see details.</p>
//                 </div>
//               )
//             ) : (
//               // Summaries tab right column -> show selected resume summary or helpful message
//               selectedSummaryResumeId ? (
//                 (() => {
//                   const resume = resumes.find(r => r._id === selectedSummaryResumeId);
//                   if (!resume) {
//                     return (
//                       <div className="p-6 bg-white rounded-lg shadow-md text-sm text-gray-500">Resume not found.</div>
//                     );
//                   }
//                   return resume.ats ? (
//                     <>
//                       <AtsSummary summary={resume.ats.summary} score={resume.ats.score} matchInfo={resume.ats.matchInfo} />
//                       <ImprovementSuggestions tips={resume.ats.improvementTips} keywords={resume.ats.matchedKeywords} />
//                     </>
//                   ) : (
//                     <div className="p-6 bg-white rounded-lg shadow-md w-full text-center">
//                       <h3 className="text-lg font-semibold text-gray-800">No ATS analysis found</h3>
//                       <p className="text-sm text-gray-500 mt-2">Run an analysis to generate insights for this resume.</p>
//                       <div className="mt-4">
//                         <button
//                           onClick={() => handleAnalyzeResume(resume._id)}
//                           className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
//                         >
//                           Analyze now
//                         </button>
//                       </div>
//                     </div>
//                   );
//                 })()
//               ) : (
//                 <div className="p-6 bg-white rounded-lg shadow-md w-full h-full flex flex-col justify-center items-center text-center">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
//                   </svg>
//                   <h3 className="text-xl font-semibold text-gray-700">Select a resume to view summary</h3>
//                   <p className="text-gray-500 mt-1">Pick any resume on the left to inspect its saved analysis.</p>
//                 </div>
//               )
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ResumeAnalysis;








// /**
//  *  @author Mandar K.
//  * @date 2025-09-13
//  *
//  * Enhanced ResumeAnalysis page with macOS-style full-width underline tabs
//  */

// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import axios from 'axios';
// import ResumeUploader from '../components/ResumeUploader';
// import AtsCalculator from '../components/AtsCalculator';
// import { AtsSummary, ImprovementSuggestions, ResumeDataPreview } from '../components/AtsResult';
// import { useAuth } from '../context/AuthContext';

// const TABS = [
//   { id: 'upload', label: 'Upload & Analyze' },
//   { id: 'summaries', label: 'Summaries' },
//   { id: 'ats', label: 'ATS Calculator' },
// ];

// const ResumeAnalysis = () => {
//   const { user } = useAuth();
//   const [resumes, setResumes] = useState([]);
//   const [isLoadingResumes, setIsLoadingResumes] = useState(true);
//   const [fetchError, setFetchError] = useState('');
//   const [activeTab, setActiveTab] = useState('upload'); // default to first (macOS-style)
//   const [selectedForAnalyze, setSelectedForAnalyze] = useState(null); // resume id preselect for analyzer
//   const [selectedSummaryResumeId, setSelectedSummaryResumeId] = useState(null); // selected in summaries list
//   const [atsResult, setAtsResult] = useState(null); // immediate ATS result from analyzer
//   const tabsRef = useRef(null);
//   const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

//   // fetch resumes
//   const fetchResumes = useCallback(async () => {
//     setIsLoadingResumes(true);
//     setFetchError('');
//     try {
//       if (!user || !user._id) {
//         setResumes([]);
//         return;
//       }
//       const { data } = await axios.get(`/api/resumes?studentId=${user._id}`);
//       setResumes(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error('Failed to fetch resumes:', err);
//       setFetchError('Failed to load resumes. Try refreshing or check your network.');
//     } finally {
//       setIsLoadingResumes(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     fetchResumes();
//   }, [fetchResumes]);

//   // update underline position when activeTab changes or resize
//   const updateUnderline = () => {
//     if (!tabsRef.current) return;
//     const container = tabsRef.current;
//     const children = Array.from(container.querySelectorAll('[data-tab]'));
//     const activeEl = children.find((c) => c.dataset.tab === activeTab);
//     if (!activeEl) {
//       // fallback: hide underline
//       setUnderlineStyle({ left: 0, width: 0 });
//       return;
//     }
//     const rect = activeEl.getBoundingClientRect();
//     const parentRect = container.getBoundingClientRect();
//     setUnderlineStyle({
//       left: activeEl.offsetLeft,
//       width: rect.width,
//     });
//   };

//   useEffect(() => {
//     updateUnderline();
//     window.addEventListener('resize', updateUnderline);
//     return () => window.removeEventListener('resize', updateUnderline);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [activeTab, resumes.length]);

//   // when upload succeeds
//   const handleUploadSuccess = (newResume) => {
//     // refresh list and switch to analyze with new resume preselected
//     fetchResumes();
//     setAtsResult(null);
//     if (newResume && newResume._id) {
//       setSelectedForAnalyze(newResume._id);
//       setActiveTab('upload');
//     }
//   };

//   // when analyzer completes
//   const handleCalculationComplete = (result) => {
//     setAtsResult(result || null);
//     // refresh resumes to show latest saved ATS score
//     if (result) {
//       setTimeout(() => fetchResumes(), 400);
//       // optionally switch to summaries so user sees saved result - keep behavior optional:
//       // setActiveTab('summaries');
//     }
//   };

//   // default selected resume id helper
//   const defaultResumeId = (resumes && resumes.length > 0) ? resumes[0]._id : null;

//   // user clicks "View" in summaries list
//   const handleSelectSummaryResume = (resumeId) => {
//     setSelectedSummaryResumeId(resumeId);
//     const r = resumes.find(x => x._id === resumeId);
//     if (r?.ats) setAtsResult(r.ats);
//     else setAtsResult(null);
//   };

//   // user clicks "Analyze" on a resume card -> preselect in analyzer and go to upload/analyze
//   const handleAnalyzeResume = (resumeId) => {
//     setSelectedForAnalyze(resumeId);
//     setActiveTab('upload');
//     setAtsResult(null);
//   };

//   // Small helper to render list item
//   const ResumeListItem = ({ r }) => {
//     const hasAts = !!r?.ats?.score;
//     return (
//       <div className="flex items-center justify-between gap-4 p-3 rounded-lg border border-gray-100 hover:shadow-sm transition">
//         <div className="flex items-start gap-3 min-w-0">
//           <div className="flex-shrink-0">
//             <div className="h-10 w-10 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-600 font-semibold">
//               {r.title?.charAt(0)?.toUpperCase() || 'R'}
//             </div>
//           </div>
//           <div className="min-w-0">
//             <div className="text-sm font-medium text-gray-800 truncate">{r.title}</div>
//             <div className="text-xs text-gray-500 mt-0.5 truncate">{r.filename} • {new Date(r.createdAt).toLocaleDateString()}</div>
//             {hasAts && (
//               <div className="mt-2 text-xs flex flex-wrap gap-2">
//                 <span className="inline-block bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">Score: {r.ats.score}%</span>
//                 <span className="inline-block bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{r.ats.matchInfo?.level || '—'}</span>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="flex items-center gap-2">
//           <button
//             onClick={() => handleSelectSummaryResume(r._id)}
//             className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-md hover:bg-gray-50"
//           >
//             View
//           </button>
//           <button
//             onClick={() => handleAnalyzeResume(r._id)}
//             className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
//           >
//             Analyze
//           </button>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6 sm:p-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="text-3xl font-bold text-gray-900">Resume Analysis</h1>
//           <p className="text-sm text-gray-600 mt-1">Upload resumes, run AI-powered ATS checks and inspect results.</p>
//         </div>

//         {/* Tabs: full-width macOS underline style */}
//         <div className="mb-6">
//           <div
//             ref={tabsRef}
//             className="relative bg-white rounded-lg shadow-sm ring-1 ring-gray-100 overflow-hidden"
//             aria-label="Resume analysis tabs"
//             style={{ display: 'flex' }}
//           >
//             {TABS.map((t, idx) => (
//               <button
//                 key={t.id}
//                 data-tab={t.id}
//                 onClick={() => {
//                   setActiveTab(t.id);
//                   // reset some selection states if switching
//                   if (t.id === 'summaries') {
//                     setSelectedForAnalyze(null);
//                   }
//                   // small delay for underline animation calculation
//                   setTimeout(updateUnderline, 20);
//                 }}
//                 className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
//                   activeTab === t.id ? 'text-gray-900' : 'text-gray-600'
//                 }`}
//                 aria-current={activeTab === t.id ? 'page' : undefined}
//               >
//                 {t.label}
//               </button>
//             ))}

//             {/* underline element */}
//             <span
//               className="absolute bottom-0 h-0.5 bg-indigo-600 transition-all duration-280"
//               style={{
//                 left: underlineStyle.left,
//                 width: underlineStyle.width,
//                 transform: 'translateX(0)',
//               }}
//             />
//           </div>
//         </div>

//         {/* Main content */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {/* LEFT: main UI depending on tab */}
//           <div className="flex flex-col gap-6">
//             {activeTab === 'upload' && (
//               <>
//                 <div className="bg-white rounded-2xl shadow p-6">
//                   <h2 className="text-lg font-semibold text-gray-800 mb-3">Upload a resume</h2>
//                   <ResumeUploader onUploadSuccess={handleUploadSuccess} />
//                 </div>

//                 <div className="bg-white rounded-2xl shadow p-6">
//                   <h2 className="text-lg font-semibold text-gray-800 mb-3">ATS Analyzer</h2>
//                   <p className="text-sm text-gray-500 mb-4">Pick a resume and paste a job description to get instant ATS feedback.</p>
//                   <AtsCalculator
//                     resumes={resumes}
//                     selectedResumeId={selectedForAnalyze || defaultResumeId}
//                     onCalculationComplete={handleCalculationComplete}
//                   />
//                 </div>
//               </>
//             )}

//             {activeTab === 'summaries' && (
//               <div className="bg-white rounded-2xl shadow p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <div>
//                     <h2 className="text-lg font-semibold text-gray-800">Uploaded Resumes</h2>
//                     <p className="text-sm text-gray-500">Select a resume to view its latest analysis.</p>
//                   </div>
//                   <div>
//                     <button
//                       onClick={() => { setActiveTab('upload'); setSelectedForAnalyze(defaultResumeId); }}
//                       className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md shadow hover:bg-indigo-700"
//                     >
//                       + Analyze New
//                     </button>
//                   </div>
//                 </div>

//                 {isLoadingResumes ? (
//                   <div className="p-6 text-center text-sm text-gray-500">Loading resumes...</div>
//                 ) : fetchError ? (
//                   <div className="p-3 bg-red-50 border border-red-100 rounded text-sm text-red-700">{fetchError}</div>
//                 ) : resumes.length === 0 ? (
//                   <div className="py-12 text-center text-sm text-gray-500">
//                     No resumes uploaded yet. Use <strong>Upload & Analyze</strong> to add one.
//                   </div>
//                 ) : (
//                   <div className="space-y-3">
//                     {resumes.map(r => (
//                       <ResumeListItem key={r._id} r={r} />
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}

//             {activeTab === 'ats' && (
//               <div className="bg-white rounded-2xl shadow p-6">
//                 <h2 className="text-lg font-semibold text-gray-800 mb-3">ATS Calculator</h2>
//                 <p className="text-sm text-gray-500 mb-4">Run an ATS check using any uploaded resume.</p>

//                 <AtsCalculator
//                   resumes={resumes}
//                   selectedResumeId={defaultResumeId}
//                   onCalculationComplete={handleCalculationComplete}
//                 />

//                 {/* If we have a last result show summary right below (for ATS tab UX: output under the calculator) */}
//                 {atsResult && (
//                   <div className="mt-6">
//                     <h3 className="text-md font-semibold text-gray-800 mb-3">Analysis Output</h3>
//                     <AtsSummary summary={atsResult.summary} score={atsResult.score} matchInfo={atsResult.matchInfo} detailedInsights={atsResult.detailedInsights} />
//                     <div className="mt-4">
//                       <ImprovementSuggestions tips={atsResult.improvementTips} keywords={atsResult.matchedKeywords} detailedInsights={atsResult.detailedInsights} />
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* RIGHT: Result / Summary panel */}
//           <div className="flex flex-col gap-6">
//             {/* When Upload or ATS -> show latest analysis (atsResult) or helpful placeholder */}
//             {(activeTab === 'upload' || activeTab === 'ats') && (
//               <div className="bg-white rounded-2xl shadow p-6 min-h-[220px]">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-3">Result / Preview</h3>

//                 {atsResult ? (
//                   <>
//                     <AtsSummary summary={atsResult.summary} score={atsResult.score} matchInfo={atsResult.matchInfo} detailedInsights={atsResult.detailedInsights} />
//                     <div className="mt-4">
//                       <ImprovementSuggestions tips={atsResult.improvementTips} keywords={atsResult.matchedKeywords} detailedInsights={atsResult.detailedInsights} />
//                     </div>
//                   </>
//                 ) : (
//                   <div className="text-sm text-gray-500">
//                     <div className="mb-3">No analysis result yet.</div>
//                     <div>Run an analysis from the left panel to see a summary and improvement suggestions here.</div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* When Summaries -> show selected resume summary (or instructions) */}
//             {activeTab === 'summaries' && (
//               <div className="bg-white rounded-2xl shadow p-6 min-h-[260px]">
//                 {selectedSummaryResumeId ? (
//                   (() => {
//                     const resume = resumes.find(r => r._id === selectedSummaryResumeId);
//                     if (!resume) {
//                       return <div className="text-sm text-gray-500">Resume not found.</div>;
//                     }
//                     return resume.ats ? (
//                       <>
//                         <AtsSummary summary={resume.ats.summary} score={resume.ats.score} matchInfo={resume.ats.matchInfo} detailedInsights={resume.ats.detailedInsights} />
//                         <div className="mt-4">
//                           <ImprovementSuggestions tips={resume.ats.improvementTips} keywords={resume.ats.matchedKeywords} detailedInsights={resume.ats.detailedInsights} />
//                         </div>
//                         <div className="mt-4">
//                           <ResumeDataPreview resume={resume} />
//                         </div>
//                       </>
//                     ) : (
//                       <div className="text-center text-sm text-gray-500">
//                         This resume has no ATS analysis yet.
//                         <div className="mt-4">
//                           <button
//                             onClick={() => handleAnalyzeResume(resume._id)}
//                             className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
//                           >
//                             Analyze now
//                           </button>
//                         </div>
//                       </div>
//                     );
//                   })()
//                 ) : (
//                   <div className="text-center text-sm text-gray-500">
//                     Select a resume from the left to view its summary and extracted data.
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Small footer / tips card */}
//             <div className="bg-white/60 rounded-xl p-4 text-sm text-gray-600 border border-gray-100">
//               <div className="font-semibold text-gray-800 mb-2">Tips</div>
//               <ul className="list-disc list-inside space-y-1">
//                 <li>Include the full job description for the most accurate ATS match.</li>
//                 <li>Use clear resume titles so you can find them quickly.</li>
//                 <li>Run multiple analyses with variations to find the best resume wording.</li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ResumeAnalysis;








// /**
//  *  @author Mandar
//  *  macOS underline tabs (fixed underline + cleaned ATS output)
//  */

// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import axios from 'axios';
// import ResumeUploader from '../components/ResumeUploader';
// import AtsCalculator from '../components/AtsCalculator';
// import { AtsSummary, ImprovementSuggestions, ResumeDataPreview } from '../components/AtsResult';
// import { useAuth } from '../context/AuthContext';

// const TABS = [
//   { id: 'upload', label: 'Upload & Analyze' },
//   { id: 'summaries', label: 'Summaries' },
//   { id: 'ats', label: 'ATS Calculator' },
// ];

// const ResumeAnalysis = () => {
//   const { user } = useAuth();
//   const [resumes, setResumes] = useState([]);
//   const [isLoadingResumes, setIsLoadingResumes] = useState(true);
//   const [fetchError, setFetchError] = useState('');
//   const [activeTab, setActiveTab] = useState('upload');
//   const [selectedForAnalyze, setSelectedForAnalyze] = useState(null);
//   const [selectedSummaryResumeId, setSelectedSummaryResumeId] = useState(null);
//   const [atsResult, setAtsResult] = useState(null);

//   const tabsRef = useRef(null);
//   const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

//   /* ---------------------
//         FETCH RESUMES
//   --------------------- */
//   const fetchResumes = useCallback(async () => {
//     setIsLoadingResumes(true);
//     setFetchError('');
//     try {
//       if (!user || !user._id) return setResumes([]);

//       const { data } = await axios.get(`/api/resumes?studentId=${user._id}`);
//       setResumes(Array.isArray(data) ? data : []);
//     } catch (err) {
//       setFetchError('Failed to load resumes.');
//     } finally {
//       setIsLoadingResumes(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     fetchResumes();
//   }, [fetchResumes]);

//   /* ---------------------
//       FIXED UNDERLINE LOGIC
//   --------------------- */
//   const updateUnderline = () => {
//     if (!tabsRef.current) return;

//     const buttons = Array.from(tabsRef.current.querySelectorAll('[data-tab]'));
//     const activeBtn = buttons.find((b) => b.dataset.tab === activeTab);
//     if (!activeBtn) return;

//     setUnderlineStyle({
//       left: activeBtn.offsetLeft,
//       width: activeBtn.offsetWidth,
//     });
//   };

//   useEffect(() => {
//     setTimeout(updateUnderline, 35);
//   });

//   /* ---------------------
//       UPLOAD SUCCESS
//   --------------------- */
//   const handleUploadSuccess = (newResume) => {
//     fetchResumes();
//     setAtsResult(null);
//     if (newResume?._id) {
//       setSelectedForAnalyze(newResume._id);
//       setActiveTab('upload');
//     }
//   };

//   /* ---------------------
//       ATS COMPLETE
//   --------------------- */
//   const handleCalculationComplete = (result) => {
//     setAtsResult(result || null);
//     if (result) setTimeout(fetchResumes, 400);
//   };

//   const defaultResumeId = resumes[0]?._id || null;

//   const handleSelectSummaryResume = (resumeId) => {
//     setSelectedSummaryResumeId(resumeId);

//     const r = resumes.find((x) => x._id === resumeId);
//     setAtsResult(r?.ats || null);
//   };

//   const handleAnalyzeResume = (resumeId) => {
//     setSelectedForAnalyze(resumeId);
//     setActiveTab('upload');
//     setAtsResult(null);
//   };

//   /* ---------------------
//             UI
//   --------------------- */

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">

//         {/* HEADER */}
//         <h1 className="text-3xl font-bold text-gray-900 mb-6">Resume Analysis</h1>

//         {/* macOS STYLE TABS */}
//         <div
//           ref={tabsRef}
//           className="relative bg-white rounded-lg shadow-sm ring-1 ring-gray-100 flex"
//         >
//           {TABS.map((t) => (
//             <button
//               key={t.id}
//               data-tab={t.id}
//               className={`flex-1 py-3 text-sm font-medium ${
//                 activeTab === t.id ? 'text-gray-900' : 'text-gray-600'
//               }`}
//               onClick={() => {
//                 setActiveTab(t.id);
//                 setTimeout(updateUnderline, 35); // FIX
//               }}
//             >
//               {t.label}
//             </button>
//           ))}

//           <span
//             className="absolute bottom-0 h-0.5 bg-indigo-600 transition-all"
//             style={{
//               width: underlineStyle.width,
//               left: underlineStyle.left,
//             }}
//           />
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">

//           {/* LEFT SIDE */}
//           <div className="flex flex-col gap-6">

//             {/* TAB 1: UPLOAD + ANALYZE */}
//             {activeTab === 'upload' && (
//               <>
//                 <div className="bg-white rounded-xl shadow p-6">
//                   <ResumeUploader onUploadSuccess={handleUploadSuccess} />
//                 </div>

//                 <div className="bg-white rounded-xl shadow p-6">
//                   <h2 className="text-lg font-semibold text-gray-800 mb-3">ATS Analyzer</h2>
//                   <AtsCalculator
//                     resumes={resumes}
//                     selectedResumeId={selectedForAnalyze || defaultResumeId}
//                     onCalculationComplete={handleCalculationComplete}
//                   />
//                 </div>
//               </>
//             )}

//             {/* TAB 2: SUMMARIES LIST */}
//             {activeTab === 'summaries' && (
//               <div className="bg-white rounded-xl shadow p-6">
//                 <h2 className="text-lg font-semibold text-gray-800 mb-3">Uploaded Resumes</h2>

//                 {resumes.map((r) => (
//                   <div
//                     key={r._id}
//                     className="p-3 border rounded-lg mb-3 flex justify-between items-center"
//                   >
//                     <div>
//                       <div className="font-medium">{r.title}</div>
//                       <div className="text-xs text-gray-500">{r.filename}</div>
//                     </div>

//                     <div className="flex gap-2">
//                       <button
//                         onClick={() => handleSelectSummaryResume(r._id)}
//                         className="px-3 py-1.5 bg-gray-100 rounded"
//                       >
//                         View
//                       </button>
//                       <button
//                         onClick={() => handleAnalyzeResume(r._id)}
//                         className="px-3 py-1.5 bg-indigo-600 text-white rounded"
//                       >
//                         Analyze
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* TAB 3: ATS CALCULATOR ONLY (NO OUTPUT BELOW) */}
//             {activeTab === 'ats' && (
//               <div className="bg-white rounded-xl shadow p-6">
//                 <h2 className="text-lg font-semibold text-gray-800 mb-3">ATS Calculator</h2>

//                 <AtsCalculator
//                   resumes={resumes}
//                   selectedResumeId={defaultResumeId}
//                   onCalculationComplete={handleCalculationComplete}
//                 />

//                 {/* ❌ REMOVED OUTPUT BLOCK FROM HERE */}
//               </div>
//             )}
//           </div>

//           {/* RIGHT SIDE — ALWAYS SHOWS ATS RESULT */}
//           <div className="bg-white rounded-xl shadow p-6 min-h-[260px]">
//             {atsResult ? (
//               <>
//                 <AtsSummary
//                   summary={atsResult.summary}
//                   score={atsResult.score}
//                   matchInfo={atsResult.matchInfo}
//                   detailedInsights={atsResult.detailedInsights}
//                 />
//                 <div className="mt-4">
//                   <ImprovementSuggestions
//                     tips={atsResult.improvementTips}
//                     keywords={atsResult.matchedKeywords}
//                     detailedInsights={atsResult.detailedInsights}
//                   />
//                 </div>
//               </>
//             ) : (
//               <div className="text-gray-500 text-sm text-center py-10">
//                 No analysis yet. Run ATS to see the results here.
//               </div>
//             )}
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default ResumeAnalysis;




// FULL UPDATED ResumeAnalysis.jsx with cleaned tabs (Upload only, Summaries, ATS Calculator)
// Tabs UI enhanced with underline animation

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import ResumeUploader from "../components/ResumeUploader.jsx";
import AtsCalculator from "../components/AtsCalculator.jsx";
import { AtsSummary, ImprovementSuggestions } from "../components/AtsResult.jsx";
import { useAuth } from "../context/AuthContext";

const ResumeAnalysis = () => {
  const [resumes, setResumes] = useState([]);
  const [atsResult, setAtsResult] = useState(null);
  const [activeTab, setActiveTab] = useState("upload"); // upload | summaries | ats
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [loadingResumes, setLoadingResumes] = useState(true);

  const { user } = useAuth();

  const fetchResumes = useCallback(async () => {
    try {
      setLoadingResumes(true);
      if (!user?._id) return;
      const { data } = await axios.get(`/api/resumes?studentId=${user._id}`);
      setResumes(data || []);
    } catch (err) {
      console.error("Error loading resumes", err);
    } finally {
      setLoadingResumes(false);
    }
  }, [user]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const defaultResumeId = resumes?.length ? resumes[0]._id : null;

  const handleUploadSuccess = (newResume) => {
    fetchResumes();
    setActiveTab("upload");
  };

  const handleCalculationComplete = (result) => {
    setAtsResult(result);
    fetchResumes();
  };

  const handleSelectSummary = (id) => {
    setSelectedResumeId(id);
    const resume = resumes.find((r) => r._id === id);
    setAtsResult(resume?.ats || null);
  };

  const TabButton = ({ id, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`relative px-4 pb-2 text-sm font-medium transition-all duration-300
        ${activeTab === id ? "text-indigo-600" : "text-gray-600 hover:text-gray-800"}`}
    >
      {label}
      <span
        className={`absolute left-0 bottom-0 h-[3px] w-full rounded-full transition-all duration-300
          ${activeTab === id ? "bg-indigo-600 w-full" : "bg-transparent w-0"}`}
      ></span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Resume Analysis</h1>

        {/* TABS */}
        <div className="flex gap-8 border-b border-gray-200 pb-1 mb-6">
          <TabButton id="upload" label="Upload & Analysis" />
          <TabButton id="summaries" label="Summaries" />
          <TabButton id="ats" label="ATS Calculator" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT SECTION */}
          <div className="flex flex-col gap-8">
            {/* TAB 1 — ONLY UPLOAD UI */}
            {activeTab === "upload" && (
              <div className="bg-white rounded-xl shadow p-6">
                <ResumeUploader onUploadSuccess={handleUploadSuccess} />
              </div>
            )}

            {/* TAB 2 — SUMMARIES */}
            {activeTab === "summaries" && (
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Uploaded Resumes</h2>

                {loadingResumes ? (
                  <p>Loading...</p>
                ) : resumes.length === 0 ? (
                  <p>No resumes uploaded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {resumes.map((r) => (
                      <div
                        key={r._id}
                        className="p-4 border rounded-lg flex items-center justify-between hover:bg-gray-50 transition"
                      >
                        <div>
                          <div className="font-medium text-gray-900">{r.title}</div>
                          <div className="text-xs text-gray-500">{r.filename}</div>
                          {r.ats?.score && (
                            <div className="mt-1 text-sm text-indigo-600 font-medium">
                              Score: {r.ats.score}%
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleSelectSummary(r._id)}
                          className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md"
                        >
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3 — ATS CALCULATOR */}
            {activeTab === "ats" && (
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">ATS Calculator</h2>
                <AtsCalculator
                  resumes={resumes}
                  selectedResumeId={defaultResumeId}
                  onCalculationComplete={handleCalculationComplete}
                />
              </div>
            )}
          </div>

          {/* RIGHT: RESULT PANEL */}
          <div className="flex flex-col gap-8">
            {atsResult ? (
              <>
                <AtsSummary
                  summary={atsResult.summary}
                  score={atsResult.score}
                  matchInfo={atsResult.matchInfo}
                />
                <ImprovementSuggestions
                  tips={atsResult.improvementTips}
                  keywords={atsResult.matchedKeywords}
                  detailedInsights={atsResult.detailedInsights}
                />
              </>
            ) : (
              <div className="p-6 bg-white rounded-xl shadow text-center text-gray-500">
                No ATS data to display.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalysis;





// src/pages/ResumeAnalysis.jsx
/**
 * ResumeAnalysis page - tabs: Upload, Summaries, ATS Calculator, Create Resume
 * Horizontal stepper style for Create Resume
 *
 * Author: Mandar K.
 * Date: 2025-09-13 (updated)
 */

// src/pages/ResumeAnalysis.jsx
// Clean updated version — Create Resume tab shows ONLY the preview (NO ATS box)

// import React, { useState, useEffect, useCallback } from "react";
// import axios from "axios";

// import ResumeUploader from "../components/ResumeUploader.jsx";
// import AtsCalculator from "../components/AtsCalculator.jsx";
// import { AtsSummary, ImprovementSuggestions } from "../components/AtsResult.jsx";
// import ResumeCreator from "../components/ResumeCreator.jsx";

// import { useAuth } from "../context/AuthContext";

// const ResumeAnalysis = () => {
//   const [resumes, setResumes] = useState([]);
//   const [atsResult, setAtsResult] = useState(null);

//   const [activeTab, setActiveTab] = useState("upload"); 
//   const [selectedSummaryResumeId, setSelectedSummaryResumeId] = useState(null);

//   const [isLoadingResumes, setIsLoadingResumes] = useState(true);
//   const [fetchError, setFetchError] = useState("");

//   const { user } = useAuth();

//   // fetch user resumes
//   const fetchResumes = useCallback(async () => {
//     setIsLoadingResumes(true);
//     setFetchError("");

//     try {
//       if (!user?._id) return;

//       const res = await axios.get(`/api/resumes?studentId=${user._id}`);
//       setResumes(res.data || []);
//     } catch (err) {
//       setFetchError("Failed to load resumes.");
//     } finally {
//       setIsLoadingResumes(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     fetchResumes();
//   }, [fetchResumes]);

//   const defaultResumeId = resumes?.[0]?._id || null;

//   const handleUploadSuccess = (newResume) => {
//     fetchResumes();
//     setActiveTab("summaries");

//     if (newResume?._id) {
//       setSelectedSummaryResumeId(newResume._id);
//       setAtsResult(newResume.ats || null);
//     }
//   };

//   const handleSelectSummaryResume = (id) => {
//     setSelectedSummaryResumeId(id);
//     const r = resumes.find((x) => x._id === id);
//     setAtsResult(r?.ats || null);
//   };

//   const handleCalculationComplete = (result) => {
//     setAtsResult(result);
//     setTimeout(fetchResumes, 300);
//   };

//   const handleCreateResumeSuccess = (resume) => {
//     fetchResumes();
//     setActiveTab("summaries");

//     if (resume?._id) {
//       setSelectedSummaryResumeId(resume._id);
//     }
//   };

//   const TabButton = ({ id, label }) => (
//     <button
//       onClick={() => {
//         setActiveTab(id);
//         if (id !== "summaries") setSelectedSummaryResumeId(null);
//       }}
//       className={`relative px-4 pb-2 text-sm font-medium transition ${
//         activeTab === id ? "text-indigo-600" : "text-gray-600 hover:text-gray-800"
//       }`}
//     >
//       {label}
//       <span
//         className={`absolute left-0 bottom-0 h-[3px] rounded-full transition-all ${
//           activeTab === id ? "bg-indigo-600 w-full" : "bg-transparent w-0"
//         }`}
//       />
//     </button>
//   );

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
        
//         {/* HEADER */}
//         <header className="mb-6">
//           <h1 className="text-4xl font-bold text-gray-900">Resume Analysis</h1>
//           <p className="text-sm text-gray-600 mt-2">
//             Upload, create, analyze ATS score, and check summaries.
//           </p>

//           {/* Tabs */}
//           <div className="mt-6">
//             <nav className="inline-flex gap-8 border-b border-gray-200 pb-2">
//               <TabButton id="upload" label="Upload & Analysis" />
//               <TabButton id="summaries" label={`Summaries (${resumes?.length || 0})`} />
//               <TabButton id="ats" label="ATS Calculator" />
//               <TabButton id="create" label="Create Resume" />
//             </nav>
//           </div>
//         </header>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
//           {/* LEFT SIDE */}
//           <div className="flex flex-col gap-7">
            
//             {/* UPLOAD TAB */}
//             {activeTab === "upload" && (
//               <div className="bg-white p-6 rounded-xl shadow">
//                 <ResumeUploader onUploadSuccess={handleUploadSuccess} />
//               </div>
//             )}

//             {/* SUMMARIES TAB */}
//             {activeTab === "summaries" && (
//               <div className="bg-white p-6 rounded-xl shadow">
//                 <h2 className="text-lg font-semibold mb-4">Uploaded Resumes</h2>

//                 {isLoadingResumes ? (
//                   <p>Loading...</p>
//                 ) : resumes.length === 0 ? (
//                   <p>No resumes found.</p>
//                 ) : (
//                   <div className="space-y-3">
//                     {resumes.map((r) => (
//                       <div
//                         key={r._id}
//                         className="border p-4 rounded-lg flex justify-between items-center hover:shadow-sm transition"
//                       >
//                         <div>
//                           <div className="font-medium">{r.title}</div>
//                           <div className="text-xs text-gray-500">{r.filename}</div>
//                         </div>

//                         <button
//                           onClick={() => handleSelectSummaryResume(r._id)}
//                           className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm"
//                         >
//                           View
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* ATS CALCULATOR TAB */}
//             {activeTab === "ats" && (
//               <div className="bg-white p-6 rounded-xl shadow">
//                 <h2 className="text-lg font-semibold mb-3">ATS Calculator</h2>

//                 <AtsCalculator
//                   resumes={resumes}
//                   selectedResumeId={selectedSummaryResumeId || defaultResumeId}
//                   onCalculationComplete={handleCalculationComplete}
//                 />
//               </div>
//             )}

//             {/* CREATE RESUME TAB */}
//             {activeTab === "create" && (
//               <div className="bg-white p-6 rounded-xl shadow">
//                 <h2 className="text-lg font-semibold mb-2">Create Resume</h2>
//                 <p className="text-xs text-gray-500 mb-4">
//                   Build a resume step-by-step and preview it live.
//                 </p>
//                 <ResumeCreator onCreateSuccess={handleCreateResumeSuccess} />
//               </div>
//             )}
//           </div>

//           {/* RIGHT SIDE */}
//           <div className="flex flex-col gap-6">

//             {/* SHOW ATS PANEL ONLY IF: tab ≠ create AND atsResult exists */}
//             {activeTab !== "create" ? (
//               atsResult ? (
//                 <>
//                   <AtsSummary
//                     summary={atsResult.summary}
//                     score={atsResult.score}
//                     matchInfo={atsResult.matchInfo}
//                   />
//                   <ImprovementSuggestions
//                     tips={atsResult.improvementTips}
//                     keywords={atsResult.matchedKeywords}
//                     detailedInsights={atsResult.detailedInsights}
//                   />
//                 </>
//               ) : (
//                 <div className="p-6 bg-white rounded-xl shadow text-center text-gray-500">
//                   <div>No ATS data available.</div>
//                   <div className="text-xs mt-2 text-gray-400">
//                     Run ATS analysis or select a summary.
//                   </div>
//                 </div>
//               )
//             ) : (
//               /* EMPTY RIGHT PANEL FOR CREATE RESUME */
//               <div className="p-6 bg-white rounded-xl shadow text-center text-gray-400">
//                 <div className="text-sm">Resume preview is shown on the left panel.</div>
//               </div>
//             )}

//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ResumeAnalysis;
