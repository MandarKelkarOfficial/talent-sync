// src/App.jsx
import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from "./context/AuthContext"

// ==================components======================
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import Footer from './components/Footer'
import Profile from './components/Profile'
// ================== End Components =======================

// ==================Pages======================
import LoginPage from './pages/LoginPage'
import OtpVerification from './pages/OtpVerification'
import Dashboard from './pages/Dashboard'
import ResumeAnalysis from './pages/ResumeAnalysis'
import ResumeCreator from './pages/CreateResume'          // NEW page (uses ResumeCreator component)
import AptitudeCalculator from './pages/AptitudeCalculator'
import Explore from './pages/Explore'
// ==================End Pages======================

function App() {

  const protectedRoutes = [
    { path: '/dashboard', element: <Dashboard /> },
    { path: '/resume-analysis', element: <ResumeAnalysis /> },
    { path: '/create-resume', element: <ResumeCreator /> }, // NEW route
    { path: '/aptitude-calculator', element: <AptitudeCalculator /> },
    { path: '/explore', element: <Explore /> },
    { path: '/profile', element: <Profile /> },

    // Resume Analysis sub-routes (if you use them elsewhere)
    { path: '/resume-analysis/upload', element: <ResumeAnalysis /> },
    // other nested resume-analysis routes can stay as per your previous routing style
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

            {/* Protected Routes */}
            {protectedRoutes.map(r => (
              <Route
                key={r.path}
                path={r.path}
                element={<ProtectedRoute>{r.element}</ProtectedRoute>}
              />
            ))}

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />

          </Routes>
        </main>

        <Footer />
      </div>
    </AuthProvider>
  )
}

export default App
