/**
 *  @author Mandar K.
 * @date 2025-09-13
 * 
 */


import './App.css'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
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
import Recruiter from './components/RecruiterView'
// ==================PagesEnd======================

function AppContent() {
  const location = useLocation();
  
  // Pages where Header and Footer should NOT be shown
  const authPages = ['/login', '/register', '/otp'];
  const shouldShowHeaderFooter = !authPages.includes(location.pathname);

  const protectedRoutes = [
    { path: '/dashboard', element: <Dashboard /> },
    { path: '/resume-analysis', element: <ResumeAnalysis /> },
    { path: '/aptitude-calculator', element: <AptitudeCalculator /> },
    { path: '/explore', element: <Explore /> },
    { path: '/profile', element: <Profile /> },
    { path: '/recruiter', element: <Recruiter /> }
  ]
  
  return (
    <div className="min-h-screen flex flex-col">
      {shouldShowHeaderFooter && <Header />}
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
      {shouldShowHeaderFooter && <Footer />}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
