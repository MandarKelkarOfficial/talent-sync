import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import authService from '../services/authService'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  // Check for existing session on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
          const userData = JSON.parse(savedUser)
          setUser(userData)
        }
      } catch (error) {
        console.error('Error checking auth status:', error)
        localStorage.removeItem('user')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const login = async (email, password) => {
    try {
      setIsLoading(true)
      const response = await authService.login(email, password)
      
      if (response.success) {
        setUser(response.user)
        localStorage.setItem('user', JSON.stringify(response.user))
        
        // Redirect to intended page or dashboard
        const from = location.state?.from?.pathname || '/dashboard'
        navigate(from, { replace: true })
        
        return { success: true }
      } else {
        return { success: false, message: response.message }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        message: error.message || 'Login failed. Please try again.' 
      }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      
      if (response.success) {
        // Store registration data temporarily for OTP verification
        localStorage.setItem('pendingRegistration', JSON.stringify(userData))
        // Navigate to OTP verification with email in state
        navigate('/otp', { state: { email: userData.email } })
        return { success: true }
      } else {
        return { success: false, message: response.message }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { 
        success: false, 
        message: error.message || 'Registration failed. Please try again.' 
      }
    }
  }

  const verifyOtp = async (otp) => {
    try {
      setIsLoading(true)
      const pendingRegistration = localStorage.getItem('pendingRegistration')
      
      if (!pendingRegistration) {
        return { success: false, message: 'Registration session expired' }
      }

      const userData = JSON.parse(pendingRegistration)
      const response = await authService.verifyOtp(userData.email, otp)
      
      if (response.success) {
        setUser(response.user)
        localStorage.setItem('user', JSON.stringify(response.user))
        localStorage.removeItem('pendingRegistration')
        navigate('/dashboard')
        return { success: true }
      } else {
        return { success: false, message: response.message }
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      return { 
        success: false, 
        message: error.message || 'OTP verification failed. Please try again.' 
      }
    } finally {
      setIsLoading(false)
    }
  }

  const resendOtp = async () => {
    try {
      const pendingRegistration = localStorage.getItem('pendingRegistration')
      
      if (!pendingRegistration) {
        return { success: false, message: 'Registration session expired' }
      }

      const userData = JSON.parse(pendingRegistration)
      const response = await authService.resendOtp(userData.email)
      
      return response
    } catch (error) {
      console.error('Resend OTP error:', error)
      return { 
        success: false, 
        message: error.message || 'Failed to resend OTP. Please try again.' 
      }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('pendingRegistration')
    navigate('/login')
  }

  const checkDuplicate = async (field, value) => {
    try {
      const response = await authService.checkDuplicate(field, value)
      return response
    } catch (error) {
      console.error('Duplicate check error:', error)
      return { success: false, message: 'Failed to check duplicate' }
    }
  }

  const value = {
    user,
    isLoading,
    login,
    register,
    verifyOtp,
    resendOtp,
    logout,
    checkDuplicate
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}