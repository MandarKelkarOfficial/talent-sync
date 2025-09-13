// import './App.css'
// import { Routes, Route, Navigate } from 'react-router-dom'
// import { AuthProvider } from "./context/AuthContext"
// import OtpVerification from './pages/OtpVerification'
// import ProtectedRoute from './components/ProtectedRoute'
// import Header from './components/Header'
// import Footer from './components/Footer'

// // ==================Pages======================
// import LoginPage from './pages/LoginPage'
// import Dashboard from './pages/Dashboard'
// import ResumeAnalysis from './pages/ResumeAnalysis'
// import AptitudeCalculator from './pages/AptitudeCalculator'
// import Explore from './pages/Explore'


// // ==================PagesEnd======================

// function App() {

//   const protectedRoutes = [
//     { path: '/dashboard', element: <Dashboard /> },
//     { path: '/resume-analysis', element: <ResumeAnalysis /> },
//     { path: '/aptitude-calculator', element: <AptitudeCalculator /> },
//     { path: '/explore', element: <Explore /> }
//   ]
//   return (
//     <AuthProvider>
//       <div className="min-h-screen flex flex-col">
//         <Header />
//         <main className="flex-grow">
//           <Routes>
//             {/* Public Routes */}
//             <Route path="/login" element={<LoginPage />} />
//             <Route path="/register" element={<LoginPage />} />
//             <Route path="/otp" element={<OtpVerification />} />

//             {protectedRoutes.map(r => (
//               <Route
//                 key={r.path}
//                 path={r.path}
//                 element={<ProtectedRoute>{r.element}</ProtectedRoute>}
//               />
//             ))}

//             {/* Default Route - Redirect to login */}
//             <Route path="/" element={<Navigate to="/login" replace />} />

//             {/* Catch-all route - Redirect to login */}
//             <Route path="*" element={<Navigate to="/login" replace />} />
//           </Routes>
//         </main>
//         <Footer />
//       </div>
//     </AuthProvider>
//   )
// }

// export default App


import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from "./context/AuthContext"

// ==================components======================
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import Footer from './components/Footer'
import Profile from './components/Profile' // <-- new route
// ==================components ends======================


// ==================Pages======================
import LoginPage from './pages/LoginPage'
import OtpVerification from './pages/OtpVerification'
import Dashboard from './pages/Dashboard'
import ResumeAnalysis from './pages/ResumeAnalysis'
import AptitudeCalculator from './pages/AptitudeCalculator'
import Explore from './pages/Explore'
// ==================PagesEnd======================

function App() {

  const protectedRoutes = [
    { path: '/dashboard', element: <Dashboard /> },
    { path: '/resume-analysis', element: <ResumeAnalysis /> },
    { path: '/aptitude-calculator', element: <AptitudeCalculator /> },
    { path: '/explore', element: <Explore /> },
    { path: '/profile', element: <Profile /> } // <-- profile route
  ]
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<LoginPage />} />
            <Route path="/otp" element={<OtpVerification />} />

            {protectedRoutes.map(r => (
              <Route
                key={r.path}
                path={r.path}
                element={<ProtectedRoute>{r.element}</ProtectedRoute>}
              />
            ))}

            {/* Default Route - Redirect to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Catch-all route - Redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}

export default App
