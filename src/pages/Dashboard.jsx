// import { useAuth } from '../context/AuthContext'
// import { Link } from 'react-router-dom'
// import React, { useEffect, useState, useCallback } from 'react'
// import axios from 'axios'

// const Dashboard = () => {
//   const { user, logout } = useAuth()
//   const [resumes, setResumes] = useState([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [fetchError, setFetchError] = useState('')

//   const fetchResumes = useCallback(async () => {
//     setIsLoading(true)
//     try {
//       if (!user || !user._id) {
//         setResumes([])
//         return
//       }
//       const { data } = await axios.get(`/api/resumes?studentId=${user._id}`)
//       setResumes(data || [])
//     } catch (err) {
//       console.error('Failed to fetch resumes', err)
//       setFetchError('Could not load resumes.')
//     } finally {
//       setIsLoading(false)
//     }
//   }, [user])

//   useEffect(() => {
//     fetchResumes()
//   }, [fetchResumes])

//   const computeProfileScore = (userObj, resumesList) => {
//     const profileFields = ['name', 'email', 'mobile', 'address', 'pincode']
//     let completeness = 0
//     profileFields.forEach(f => {
//       if (userObj && userObj[f]) completeness += 1
//     })
//     const profileCompletenessPct = (completeness / profileFields.length) * 30

//     const atsScores = (resumesList || [])
//       .map(r => (r?.ats && typeof r.ats.score === 'number' ? r.ats.score : null))
//       .filter(s => s !== null && s !== undefined)

//     let resumeComponent = 0
//     if (atsScores.length > 0) {
//       const avg = atsScores.reduce((s, v) => s + v, 0) / atsScores.length
//       resumeComponent = (avg / 100) * 50
//     }

//     const skillsSet = new Set()
//       ; (resumesList || []).forEach(r => {
//         const skills = r?.structuredData?.skills || r?.skills || []
//         skills.forEach(s => skillsSet.add(String(s).toLowerCase()))
//       })
//     const skillsScore = Math.min(20, skillsSet.size) / 20 * 20

//     const total = Math.round(profileCompletenessPct + resumeComponent + skillsScore)
//     return {
//       score: Math.max(0, Math.min(100, total)),
//       breakdown: {
//         profileCompletenessPct: Math.round(profileCompletenessPct),
//         resumeComponent: Math.round(resumeComponent),
//         skillsScore: Math.round(skillsScore),
//         skillsCount: skillsSet.size,
//         resumesAnalyzed: atsScores.length
//       }
//     }
//   }

//   const { score: profileScore, breakdown } = computeProfileScore(user || {}, resumes || [])

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Welcome Section */}
//         <div className="bg-white rounded-xl shadow-lg p-6 mb-8 transition-all duration-300 hover:shadow-xl">
//           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
//             <div className="flex-1 min-w-0">
//               <h1 className="text-3xl font-bold text-gray-900 animate-fade-in">
//                 Welcome, {user?.name || 'Candidate'}!
//               </h1>
//               <p className="text-gray-600 mt-2 animate-fade-in delay-100">
//                 SmartCompetency — candidate profile & ATS control center
//               </p>
//               <div className="mt-4 flex flex-wrap gap-3 animate-fade-in delay-200">
//                 <Link 
//                   to="/profile" 
//                   className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
//                 >
//                   View Profile
//                 </Link>
//                 <Link 
//                   to="/resume-analysis" 
//                   className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:from-indigo-700 hover:to-purple-700"
//                 >
//                   Resume Analysis
//                 </Link>
//               </div>
//             </div>

//             {/* SmartCompetency card */}
//             <div className="w-full md:w-72 animate-fade-in-left">
//               <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-5 shadow-xl relative overflow-hidden">
//                 <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10"></div>
//                 <div className="relative z-10">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <div className="text-xs uppercase opacity-90 tracking-wider">Smart Competency</div>
//                       <div className="text-3xl font-bold mt-1">{profileScore}%</div>
//                       <div className="text-xs opacity-80 mt-1">Candidate profile score</div>
//                     </div>
//                     <div className="ml-4">
//                       <div className="w-14 h-14 rounded-lg bg-white/20 flex items-center justify-center text-white text-lg font-semibold backdrop-blur-sm">
//                         {breakdown.resumesAnalyzed || 0}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="mt-4 text-xs bg-white/15 p-3 rounded-lg backdrop-blur-sm">
//                     <div className="flex justify-between mb-1.5">
//                       <span>Profile</span>
//                       <span className="font-semibold">{breakdown.profileCompletenessPct}%</span>
//                     </div>
//                     <div className="flex justify-between mb-1.5">
//                       <span>Resume avg</span>
//                       <span className="font-semibold">{breakdown.resumeComponent}%</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span>Skills ({breakdown.skillsCount})</span>
//                       <span className="font-semibold">{breakdown.skillsScore}%</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* User Info Card (compact) + Quick Stats */}
//         <div className="grid md:grid-cols-3 gap-6 mb-8">
//           <div className="bg-white rounded-xl shadow-lg p-6 flex items-center gap-5 transition-all duration-300 hover:shadow-xl">
//             <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden flex items-center justify-center shadow-md">
//               {user?.avatarUrl ? (
//                 <img src={user.avatarUrl} alt="avatar" className="object-cover w-full h-full" />
//               ) : (
//                 <div className="text-indigo-600 font-bold text-xl">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
//               )}
//             </div>
//             <div className="flex-1">
//               <div className="flex items-center gap-3">
//                 <div className="text-lg font-semibold text-gray-900">{user?.name}</div>
//                 {(user?.emailVerified || user?.isEmailVerified || user?.verified) && (
//                   <div className="text-green-600 text-sm flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
//                       <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293A1 1 0 006.293 10.707l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                     </svg>
//                     <span className="text-xs">Verified</span>
//                   </div>
//                 )}
//               </div>
//               <div className="text-sm text-gray-600 mt-1">{user?.email}</div>
//               <Link to="/profile" className="inline-block mt-2 text-indigo-600 text-sm hover:underline transition-colors duration-300"> 
//                 <div className="text-xs text-gray-500 flex items-center">
//                   View and edit your full profile 
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
//                   </svg>
//                 </div>
//               </Link>
//             </div>
//           </div>

//           {/* Quick Stats */}
//           <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
//               <h2 className="text-xl font-semibold text-gray-900 mb-5">Quick Stats</h2>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl transition-transform duration-300 hover:scale-105">
//                   <div className="text-2xl font-bold text-blue-600">{resumes.length}</div>
//                   <div className="text-sm text-gray-600 mt-1">Resumes</div>
//                 </div>
//                 <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl transition-transform duration-300 hover:scale-105">
//                   <div className="text-2xl font-bold text-green-600">0</div>
//                   <div className="text-sm text-gray-600 mt-1">Aptitude Tests</div>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
//               <h2 className="text-xl font-semibold text-gray-900 mb-5">Actions</h2>
//               <div className="flex flex-wrap gap-3">
//                 <Link 
//                   to="/resume-analysis" 
//                   className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
//                 >
//                   Resume Analysis
//                 </Link>
//                 <Link 
//                   to="/aptitude-calculator" 
//                   className="px-4 py-2 bg-white border border-gray-200 rounded-lg font-medium hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
//                 >
//                   Aptitude
//                 </Link>
//                 <Link 
//                   to="/explore" 
//                   className="px-4 py-2 bg-white border border-gray-200 rounded-lg font-medium hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
//                 >
//                   Explore
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Recent Resumes & Insights */}
//         <div className="grid md:grid-cols-2 gap-6">
//           <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
//             <h2 className="text-xl font-semibold text-gray-900 mb-5 flex items-center">
//               Recent Resumes
//               <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
//                 {resumes.length}
//               </span>
//             </h2>
//             {isLoading ? (
//               <div className="mt-4 flex justify-center py-8">
//                 <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
//               </div>
//             ) : resumes.length === 0 ? (
//               <div className="mt-4 py-10 text-center">
//                 <div className="text-gray-400 mb-3">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                   </svg>
//                 </div>
//                 <p className="text-sm text-gray-500">No resumes uploaded yet.</p>
//                 <p className="text-sm text-gray-400 mt-1">Upload one to get started.</p>
//                 <Link 
//                   to="/resume-analysis" 
//                   className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors duration-300"
//                 >
//                   Upload Resume
//                 </Link>
//               </div>
//             ) : (
//               <div className="mt-4 space-y-4 max-h-96 overflow-y-auto pr-2 resume-scrollbar">
//                 {resumes.slice(0, 8).map(r => (
//                   <div 
//                     key={r._id} 
//                     className="flex items-center justify-between p-4 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-indigo-50 hover:shadow-sm group"
//                   >
//                     <div className="flex-1 min-w-0">
//                       <div className="font-medium text-gray-900 group-hover:text-indigo-700 transition-colors duration-300">{r.title}</div>
//                       <div className="text-xs text-gray-500 mt-1 truncate">{r.filename} • {new Date(r.createdAt).toLocaleDateString()}</div>
//                       <div className="mt-2 flex items-center gap-2">
//                         {r.structuredData ? (
//                           <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                             AI Processed
//                           </span>
//                         ) : null}
//                         {r.ats?.score ? (
//                           <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                             ATS: {r.ats.score}%
//                           </span>
//                         ) : (
//                           <span className="text-xs text-gray-400">Not analyzed</span>
//                         )}
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-2 ml-4">
//                       <Link 
//                         to="/resume-analysis" 
//                         className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-300 shadow-sm"
//                       >
//                         Analyze
//                       </Link>
//                       <button 
//                         onClick={() => navigator.clipboard?.writeText(window.location.origin + '/resume/' + r._id)}
//                         className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors duration-300 shadow-sm flex items-center"
//                       >
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
//                         </svg>
//                         Share
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Insights Section */}
//           <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
//             <h2 className="text-xl font-semibold text-gray-900 mb-5">Insights</h2>

//             {isLoading ? (
//               <div className="mt-4 flex items-center justify-center py-8">
//                 <div className="animate-pulse flex items-center">
//                   <div className="h-4 w-4 bg-indigo-600 rounded-full mr-1 animate-bounce" style={{ animationDelay: '0ms' }}></div>
//                   <div className="h-4 w-4 bg-indigo-600 rounded-full mr-1 animate-bounce" style={{ animationDelay: '100ms' }}></div>
//                   <div className="h-4 w-4 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
//                 </div>
//                 <span className="ml-3 text-sm text-gray-500">Crunching your data...</span>
//               </div>
//             ) : resumes.length === 0 ? (
//               <div className="mt-4 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl text-center">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
//                 </svg>
//                 <p className="text-sm text-gray-600 mt-3">
//                   Upload a resume to get personalized insights and suggestions.
//                 </p>
//               </div>
//             ) : (
//               (() => {
//                 const analyzed = resumes.filter(r => r?.ats?.score !== undefined)
//                 if (analyzed.length === 0) {
//                   return (
//                     <div className="mt-4 p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
//                       <p className="text-sm text-blue-700">
//                         None of your resumes are analyzed yet. Run an ATS check to see insights.
//                       </p>
//                     </div>
//                   )
//                 }

//                 const best = analyzed.reduce((max, r) =>
//                   (r.ats.score || 0) > (max.ats.score || 0) ? r : max
//                 )

//                 return (
//                   <div className="mt-4 space-y-4">
//                     <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
//                       <p className="text-sm text-gray-700">
//                         Your best performing resume is <span className="font-semibold text-indigo-700">{best.title}</span> with an ATS score of <span className="font-bold text-indigo-700">{best.ats.score}%</span>.
//                       </p>
//                     </div>

//                     {best.ats.improvementTips && best.ats.improvementTips.length > 0 ? (
//                       <div className="mt-4">
//                         <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
//                           </svg>
//                           Top Improvement Suggestions:
//                         </h3>
//                         <ul className="space-y-2">
//                           {best.ats.improvementTips.slice(0, 3).map((tip, idx) => (
//                             <li key={idx} className="text-sm text-gray-600 bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex items-start">
//                               <span className="flex-shrink-0 h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold mr-2">
//                                 {idx + 1}
//                               </span>
//                               {tip}
//                             </li>
//                           ))}
//                         </ul>
//                       </div>
//                     ) : (
//                       <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
//                         <p className="text-sm text-green-700">
//                           This resume is solid — but there's always room for more keywords & tailored descriptions!
//                         </p>
//                       </div>
//                     )}
//                   </div>
//                 )
//               })()
//             )}

//             {fetchError && (
//               <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
//                 {fetchError}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-fade-in {
//           animation: fadeIn 0.5s ease-out forwards;
//         }
//         .animate-fade-in-left {
//           animation: fadeIn 0.5s ease-out forwards;
//         }
//         .delay-100 {
//           animation-delay: 0.1s;
//         }
//         .delay-200 {
//           animation-delay: 0.2s;
//         }
//         .resume-scrollbar::-webkit-scrollbar {
//           width: 4px;
//         }
//         .resume-scrollbar::-webkit-scrollbar-track {
//           background: #f1f1f1;
//           border-radius: 10px;
//         }
//         .resume-scrollbar::-webkit-scrollbar-thumb {
//           background: #c5c5c5;
//           border-radius: 10px;
//         }
//         .resume-scrollbar::-webkit-scrollbar-thumb:hover {
//           background: #a8a8a8;
//         }
//       `}</style>
//     </div>
//   )
// }

// export default Dashboard


import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import CapsuleCalendar from '../components/CapsuleCalander'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const [resumes, setResumes] = useState([])
  const [aptitudeResults, setAptitudeResults] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  

  const fetchResumes = useCallback(async () => {
    setIsLoading(true)
    try {
      if (!user || !user._id) {
        setResumes([])
        return
      }
      const { data } = await axios.get(`/api/resumes?studentId=${user._id}`)
      setResumes(data || [])
    } catch (err) {
      console.error('Failed to fetch resumes', err)
      setFetchError('Could not load resumes.')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // NEW: Fetch aptitude test results
  const fetchAptitudeResults = useCallback(async () => {
    try {
      if (!user || !user._id) {
        setAptitudeResults([])
        return
      }
      const { data } = await axios.get(`/api/aptitude/student/${user._id}/results`)
      setAptitudeResults(data || [])
    } catch (err) {
      // If no results found (404), that's normal for new users
      if (err.response?.status === 404) {
        setAptitudeResults([])
      } else {
        console.error('Failed to fetch aptitude results', err)
      }
    }
  }, [user])

  useEffect(() => {
    fetchResumes()
    fetchAptitudeResults()
  }, [fetchResumes, fetchAptitudeResults])

  // UPDATED: Smart Competency calculation with aptitude scores
  const computeProfileScore = (userObj, resumesList, aptitudeList) => {
    const profileFields = ['name', 'email', 'mobile', 'address', 'pincode']
    let completeness = 0
    profileFields.forEach(f => {
      if (userObj && userObj[f]) completeness += 1
    })
    const profileCompletenessPct = (completeness / profileFields.length) * 25 // Reduced from 30 to 25

    const atsScores = (resumesList || [])
      .map(r => (r?.ats && typeof r.ats.score === 'number' ? r.ats.score : null))
      .filter(s => s !== null && s !== undefined)

    let resumeComponent = 0
    if (atsScores.length > 0) {
      const avg = atsScores.reduce((s, v) => s + v, 0) / atsScores.length
      resumeComponent = (avg / 100) * 35 // Reduced from 50 to 35
    }

    const skillsSet = new Set()
    ;(resumesList || []).forEach(r => {
      const skills = r?.structuredData?.skills || r?.skills || []
      skills.forEach(s => skillsSet.add(String(s).toLowerCase()))
    })
    const skillsScore = Math.min(20, skillsSet.size) / 20 * 20 // Keep at 20

    // NEW: Aptitude component (20% of total score)
    const aptitudeScores = (aptitudeList || [])
      .map(r => (typeof r.overallScore === 'number' ? r.overallScore : null))
      .filter(s => s !== null && s !== undefined)

    let aptitudeComponent = 0
    if (aptitudeScores.length > 0) {
      const avgAptitude = aptitudeScores.reduce((s, v) => s + v, 0) / aptitudeScores.length
      aptitudeComponent = (avgAptitude / 100) * 20 // 20% weight for aptitude
    }

    const total = Math.round(profileCompletenessPct + resumeComponent + skillsScore + aptitudeComponent)
    
    return {
      score: Math.max(0, Math.min(100, total)),
      breakdown: {
        profileCompletenessPct: Math.round(profileCompletenessPct),
        resumeComponent: Math.round(resumeComponent),
        skillsScore: Math.round(skillsScore),
        aptitudeComponent: Math.round(aptitudeComponent), // NEW
        skillsCount: skillsSet.size,
        resumesAnalyzed: atsScores.length,
        aptitudeTestsTaken: aptitudeScores.length, // NEW
        avgAptitudeScore: aptitudeScores.length > 0 ? Math.round(aptitudeScores.reduce((s, v) => s + v, 0) / aptitudeScores.length) : 0 // NEW
      }
    }
  }

  const { score: profileScore, breakdown } = computeProfileScore(user || {}, resumes || [], aptitudeResults || [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-1 min-w-0">
              <div className=" flex flex-wrap gap-3 animate-fade-in delay-200">
              <CapsuleCalendar/>  
              </div>
              <h1 className="text-3xl font-bold text-gray-900 animate-fade-in mt-5 ml-5">
                Welcome, {user?.name || 'Candidate'}!
              </h1>
              <p className="text-gray-600 mt-2 animate-fade-in delay-100 ml-5">
                SmartCompetency — candidate profile & ATS control center
              </p>
              
            </div>

            {/* UPDATED: SmartCompetency card with aptitude data */}
            <div className="w-full md:w-72 animate-fade-in-left">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-5 shadow-xl relative overflow-hidden">
                <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase opacity-90 tracking-wider">Smart Competency</div>
                      <div className="text-3xl font-bold mt-1">{profileScore}%</div>
                      <div className="text-xs opacity-80 mt-1">Candidate profile score</div>
                    </div>
                    <div className="ml-4 text-center">
                      <div className="w-14 h-14 rounded-lg bg-white/20 flex items-center justify-center text-white text-lg font-semibold backdrop-blur-sm">
                        {breakdown.resumesAnalyzed || 0}
                      </div>
                      <div className="text-xs opacity-75 mt-1">Resumes</div>
                    </div>
                  </div>

                  {/* UPDATED: Enhanced breakdown with aptitude */}
                  <div className="mt-4 text-xs bg-white/15 p-3 rounded-lg backdrop-blur-sm">
                    <div className="flex justify-between mb-1.5">
                      <span>Profile</span>
                      <span className="font-semibold">{breakdown.profileCompletenessPct}%</span>
                    </div>
                    <div className="flex justify-between mb-1.5">
                      <span>Resume avg</span>
                      <span className="font-semibold">{breakdown.resumeComponent}%</span>
                    </div>
                    <div className="flex justify-between mb-1.5">
                      <span>Skills ({breakdown.skillsCount})</span>
                      <span className="font-semibold">{breakdown.skillsScore}%</span>
                    </div>
                    {/* NEW: Aptitude component */}
                    <div className="flex justify-between">
                      <span>Aptitude ({breakdown.aptitudeTestsTaken})</span>
                      <span className="font-semibold">{breakdown.aptitudeComponent}%</span>
                    </div>
                    {breakdown.aptitudeTestsTaken > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/20 text-center">
                        <span className="font-medium">Avg Aptitude: {breakdown.avgAptitudeScore}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Info Card (compact) + Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 flex items-center gap-5 transition-all duration-300 hover:shadow-xl">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden flex items-center justify-center shadow-md">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="avatar" className="object-cover w-full h-full" />
              ) : (
                <div className="text-indigo-600 font-bold text-xl">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="text-lg font-semibold text-gray-900">{user?.name}</div>
                {(user?.emailVerified || user?.isEmailVerified || user?.verified) && (
                  <div className="text-green-600 text-sm flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293A1 1 0 006.293 10.707l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs">Verified</span>
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-600 mt-1">{user?.email}</div>
              <Link to="/profile" className="inline-block mt-2 text-indigo-600 text-sm hover:underline transition-colors duration-300"> 
                <div className="text-xs text-gray-500 flex items-center">
                  View and edit your full profile 
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>

          {/* UPDATED: Quick Stats with aptitude tests */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
              <h2 className="text-xl font-semibold text-gray-900 mb-5">Quick Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl transition-transform duration-300 hover:scale-105">
                  <div className="text-2xl font-bold text-blue-600">{resumes.length}</div>
                  <div className="text-sm text-gray-600 mt-1">Resumes</div>
                </div>
                {/* UPDATED: Display actual aptitude test count */}
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl transition-transform duration-300 hover:scale-105">
                  <div className="text-2xl font-bold text-green-600">{aptitudeResults.length}</div>
                  <div className="text-sm text-gray-600 mt-1">Aptitude Tests</div>
                  {/* Show average score if tests exist */}
                  {breakdown.aptitudeTestsTaken > 0 && (
                    <div className="text-xs text-green-700 mt-1 font-medium">
                      Avg: {breakdown.avgAptitudeScore}%
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
              <h2 className="text-xl font-semibold text-gray-900 mb-5">Actions</h2>
              <div className="flex flex-wrap gap-3">
                <Link 
                  to="/resume-analysis" 
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                >
                  Resume Analysis
                </Link>
                <Link 
                  to="/aptitude-calculator" 
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                >
                  {aptitudeResults.length > 0 ? 'Take Another Test' : 'Start Aptitude Test'}
                </Link>
                <Link 
                  to="/explore" 
                  className="px-4 py-2 bg-white flex mr-4  w-full  justify-center align-center border border-gray-200 rounded-lg font-medium hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                >
                  Explore
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Resumes & Insights */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-5 flex items-center">
              Recent Resumes
              <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {resumes.length}
              </span>
            </h2>
            {isLoading ? (
              <div className="mt-4 flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : resumes.length === 0 ? (
              <div className="mt-4 py-10 text-center">
                <div className="text-gray-400 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">No resumes uploaded yet.</p>
                <p className="text-sm text-gray-400 mt-1">Upload one to get started.</p>
                <Link 
                  to="/resume-analysis" 
                  className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors duration-300"
                >
                  Upload Resume
                </Link>
              </div>
            ) : (
              <div className="mt-4 space-y-4 max-h-96 overflow-y-auto pr-2 resume-scrollbar">
                {resumes.slice(0, 8).map(r => (
                  <div 
                    key={r._id} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-indigo-50 hover:shadow-sm group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 group-hover:text-indigo-700 transition-colors duration-300">{r.title}</div>
                      <div className="text-xs text-gray-500 mt-1 truncate">{r.filename} • {new Date(r.createdAt).toLocaleDateString()}</div>
                      <div className="mt-2 flex items-center gap-2">
                        {r.structuredData ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            AI Processed
                          </span>
                        ) : null}
                        {r.ats?.score ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            ATS: {r.ats.score}%
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Not analyzed</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Link 
                        to="/resume-analysis" 
                        className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-300 shadow-sm"
                      >
                        Analyze
                      </Link>
                      <button 
                        onClick={() => navigator.clipboard?.writeText(window.location.origin + '/resume/' + r._id)}
                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors duration-300 shadow-sm flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Share
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ENHANCED: Insights Section with aptitude insights */}
          <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-5">Insights</h2>

            {isLoading ? (
              <div className="mt-4 flex items-center justify-center py-8">
                <div className="animate-pulse flex items-center">
                  <div className="h-4 w-4 bg-indigo-600 rounded-full mr-1 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="h-4 w-4 bg-indigo-600 rounded-full mr-1 animate-bounce" style={{ animationDelay: '100ms' }}></div>
                  <div className="h-4 w-4 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                </div>
                <span className="ml-3 text-sm text-gray-500">Crunching your data...</span>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {/* Resume insights */}
                {resumes.length === 0 ? (
                  <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <p className="text-sm text-gray-600 mt-3">
                      Upload a resume to get personalized insights and suggestions.
                    </p>
                  </div>
                ) : (
                  (() => {
                    const analyzed = resumes.filter(r => r?.ats?.score !== undefined)
                    if (analyzed.length === 0) {
                      return (
                        <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                          <p className="text-sm text-blue-700">
                            None of your resumes are analyzed yet. Run an ATS check to see insights.
                          </p>
                        </div>
                      )
                    }

                    const best = analyzed.reduce((max, r) =>
                      (r.ats.score || 0) > (max.ats.score || 0) ? r : max
                    )

                    return (
                      <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                        <p className="text-sm text-gray-700">
                          Your best performing resume is <span className="font-semibold text-indigo-700">{best.title}</span> with an ATS score of <span className="font-bold text-indigo-700">{best.ats.score}%</span>.
                        </p>
                      </div>
                    )
                  })()
                )}

                {/* NEW: Aptitude insights */}
                {aptitudeResults.length > 0 && (
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Aptitude Performance:
                    </h3>
                    <p className="text-sm text-gray-700">
                      You've completed <span className="font-semibold text-green-700">{aptitudeResults.length} aptitude test{aptitudeResults.length > 1 ? 's' : ''}</span> with an average score of <span className="font-bold text-green-700">{breakdown.avgAptitudeScore}%</span>.
                    </p>
                    {breakdown.avgAptitudeScore >= 80 && (
                      <p className="text-xs text-green-600 mt-1">Strong cognitive abilities! Consider showcasing this in interviews.</p>
                    )}
                    {breakdown.avgAptitudeScore < 60 && (
                      <p className="text-xs text-green-600 mt-1">Take more practice tests to improve your scores.</p>
                    )}
                  </div>
                )}

                {/* Show call-to-action if no aptitude tests */}
                {aptitudeResults.length === 0 && (
                  <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-100">
                    <p className="text-sm text-gray-700">
                      Complete an aptitude test to boost your SmartCompetency score and showcase your cognitive abilities.
                    </p>
                    <Link 
                      to="/aptitude-calculator" 
                      className="mt-2 inline-block px-3 py-1.5 bg-yellow-600 text-white text-xs rounded-lg font-medium hover:bg-yellow-700 transition-colors duration-300"
                    >
                      Take Aptitude Test
                    </Link>
                  </div>
                )}
              </div>
            )}

            {fetchError && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {fetchError}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-fade-in-left {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .resume-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .resume-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .resume-scrollbar::-webkit-scrollbar-thumb {
          background: #c5c5c5;
          border-radius: 10px;
        }
        .resume-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  )
}

export default Dashboard