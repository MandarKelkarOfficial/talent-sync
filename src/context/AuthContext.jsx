/**
 * @fileoverview Authentication Context for the application.
 * @description Manages user session, state, and authentication functions like
 * login, logout, registration, and OTP flow. Persists the session to localStorage.
 */

/**
 *  @author Mandar K.
 * @date 2025-09-13
 * 
 */


import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import api from '../services/api'; // pre-configured axios with auth headers

const AuthContext = createContext(null);

/**
 * Custom hook to consume the AuthContext.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Provides authentication state and functions to the entire application.
 */
export const AuthProvider = ({ children }) => {
  // `session` holds { success, user, token, message }
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * On app load, hydrate session from localStorage if available.
   */
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('user');
      if (savedSession) {
        const sessionData = JSON.parse(savedSession);
        if (sessionData?.token) {
          setSession(sessionData);
        } else {
          localStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('Failed to parse user session from localStorage:', error);
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Login user and persist session.
   */
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const sessionData = await authService.login(email, password);

      if (sessionData.success && sessionData.token) {
        setSession(sessionData);
        localStorage.setItem('user', JSON.stringify(sessionData));

        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
        return { success: true };
      } else {
        return { success: false, message: sessionData.message };
      }
    } catch (error) {
      console.error('Login error in AuthContext:', error);
      return {
        success: false,
        message: error.message || 'Login failed. Please try again.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user and clear session.
   */
  const logout = () => {
    setSession(null);
    localStorage.removeItem('user');
    localStorage.removeItem('pendingRegistration');
    navigate('/login');
  };

  /**
   * Sync user data from the server to keep session fresh.
   */
  const syncUser = async () => {
    if (session?.user?._id) {
      try {
        const response = await api.get(`/api/auth/profile/${session.user._id}`);
        if (response.data.success) {
          const freshUser = response.data.user;
          const updatedSession = { ...session, user: freshUser };
          setSession(updatedSession);
          localStorage.setItem('user', JSON.stringify(updatedSession));
        } else {
          logout();
        }
      } catch (error) {
        console.error('Failed to sync user data, logging out.', error);
        logout();
      }
    }
  };

  /**
   * Register a new user.
   */
  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      if (response.success) {
        localStorage.setItem('pendingRegistration', JSON.stringify(userData));
        navigate('/otp', { state: { email: userData.email } });
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.message || 'Registration failed. Please try again.',
      };
    }
  };

  /**
   * Verify OTP for registration.
   */
  const verifyOtp = async (otp) => {
    try {
      setIsLoading(true);
      const pendingRegistration = localStorage.getItem('pendingRegistration');
      if (!pendingRegistration) {
        return { success: false, message: 'Registration session expired' };
      }

      const userData = JSON.parse(pendingRegistration);
      const response = await authService.verifyOtp(userData.email, otp);

      if (response.success) {
        localStorage.removeItem('pendingRegistration');
        navigate('/login', {
          state: { message: 'Registration successful! Please log in.' },
        });
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      return {
        success: false,
        message: error.message || 'OTP verification failed. Please try again.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Resend OTP to user's email.
   */
  const resendOtp = async () => {
    try {
      const pendingRegistration = localStorage.getItem('pendingRegistration');
      if (!pendingRegistration) {
        return { success: false, message: 'Registration session expired' };
      }
      const userData = JSON.parse(pendingRegistration);
      return await authService.resendOtp(userData.email);
    } catch (error) {
      console.error('Resend OTP error:', error);
      return {
        success: false,
        message: error.message || 'Failed to resend OTP. Please try again.',
      };
    }
  };

  /**
   * Check for duplicate email/mobile.
   */
  const checkDuplicate = async (field, value) => {
    try {
      return await authService.checkDuplicate(field, value);
    } catch (error) {
      console.error('Duplicate check error:', error);
      return { success: false, message: 'Failed to check duplicate' };
    }
  };

  const value = {
    user: session?.user,
    token: session?.token,
    isAuthenticated: !!session?.token,
    isLoading,
    login,
    logout,
    register,
    verifyOtp,
    resendOtp,
    syncUser,
    checkDuplicate,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
