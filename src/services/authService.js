const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const authService = {
  // Register user
  register: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }
      
      return data
    } catch (error) {
      console.error('Registration service error:', error)
      throw error
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }
      
      return data
    } catch (error) {
      console.error('Login service error:', error)
      throw error
    }
  },

  // Verify OTP
  verifyOtp: async (email, otp) => {
    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed')
      }
      
      return data
    } catch (error) {
      console.error('OTP verification service error:', error)
      throw error
    }
  },

  // Alternative method name for backward compatibility
  verifyOTP: async (email, mobile, otp) => {
    return authService.verifyOtp(email || mobile, otp)
  },

  // Alternative resend method
  resendOTP: async (email, mobile) => {
    return authService.resendOtp(email || mobile)
  },

  // Resend OTP
  resendOtp: async (email) => {
    try {
      const response = await fetch(`${API_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP')
      }
      
      return data
    } catch (error) {
      console.error('Resend OTP service error:', error)
      throw error
    }
  },

  // Check for duplicate email or mobile
  checkDuplicate: async (field, value) => {
    try {
      const response = await fetch(`${API_URL}/auth/check-duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ field, value }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Duplicate check failed')
      }
      
      return data
    } catch (error) {
      console.error('Duplicate check service error:', error)
      throw error
    }
  }
}

export default authService