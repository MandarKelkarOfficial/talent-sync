// import { createContext, useContext, useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import authService from '../services/authService';
// import axios from 'axios'; // Import axios to fetch the user profile

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const navigate = useNavigate();
//   const location = useLocation();

//   // --- START OF FIX ---
//   // This function fetches the latest user data from the server and updates the state.
//   const syncUser = async (userId) => {
//     try {
//       // Assuming your endpoint to get a user's profile is '/api/auth/profile/:id'
//       const response = await axios.get(`/api/auth/profile/${userId}`);
//       if (response.data?.success && response.data?.user) {
//         const freshUser = response.data.user;
//         setUser(freshUser); // Update the React state
//         localStorage.setItem('user', JSON.stringify(freshUser)); // Update localStorage with fresh data
//       } else {
//         // If the user isn't found on the server, they should be logged out.
//         logout();
//       }
//     } catch (error) {
//       console.error('Failed to sync user data, logging out.', error);
//       logout(); // If the token is invalid or network fails, log out.
//     }
//   };
//   // --- END OF FIX ---


//   // Check for existing session on app load
//   useEffect(() => {
//     const checkAuthStatus = async () => {
//       try {
//         const savedUser = localStorage.getItem('user');
//         if (savedUser) {
//           const userData = JSON.parse(savedUser);
          
//           // *** CRITICAL CHANGE: Instead of just trusting localStorage, sync with the server ***
//           await syncUser(userData._id); // Use the ID from storage to get the latest data.
        
//         }
//       } catch (error) {
//         console.error('Error checking auth status:', error);
//         localStorage.removeItem('user');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     checkAuthStatus();
//   }, []); // This still runs only once on app load

//   const login = async (email, password) => {
//     try {
//       setIsLoading(true);
//       const response = await authService.login(email, password);
      
//       if (response.success) {
//         setUser(response.user);
//         localStorage.setItem('user', JSON.stringify(response.user));
        
//         // Redirect to intended page or dashboard
//         const from = location.state?.from?.pathname || '/dashboard';
//         navigate(from, { replace: true });
        
//         return { success: true };
//       } else {
//         return { success: false, message: response.message };
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       return { 
//         success: false, 
//         message: error.message || 'Login failed. Please try again.' 
//       };
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const register = async (userData) => {
//     try {
//       const response = await authService.register(userData);
      
//       if (response.success) {
//         // Store registration data temporarily for OTP verification
//         localStorage.setItem('pendingRegistration', JSON.stringify(userData));
//         // Navigate to OTP verification with email in state
//         navigate('/otp', { state: { email: userData.email } });
//         return { success: true };
//       } else {
//         return { success: false, message: response.message };
//       }
//     } catch (error) {
//       console.error('Registration error:', error);
//       return { 
//         success: false, 
//         message: error.message || 'Registration failed. Please try again.' 
//       };
//     }
//   };

//   const verifyOtp = async (otp) => {
//     try {
//       setIsLoading(true);
//       const pendingRegistration = localStorage.getItem('pendingRegistration');
      
//       if (!pendingRegistration) {
//         return { success: false, message: 'Registration session expired' };
//       }

//       const userData = JSON.parse(pendingRegistration);
//       const response = await authService.verifyOtp(userData.email, otp);
      
//       if (response.success) {
//         setUser(response.user);
//         localStorage.setItem('user', JSON.stringify(response.user));
//         localStorage.removeItem('pendingRegistration');
//         navigate('/dashboard');
//         return { success: true };
//       } else {
//         return { success: false, message: response.message };
//       }
//     } catch (error) {
//       console.error('OTP verification error:', error);
//       return { 
//         success: false, 
//         message: error.message || 'OTP verification failed. Please try again.' 
//       };
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const resendOtp = async () => {
//     try {
//       const pendingRegistration = localStorage.getItem('pendingRegistration');
      
//       if (!pendingRegistration) {
//         return { success: false, message: 'Registration session expired' };
//       }

//       const userData = JSON.parse(pendingRegistration);
//       const response = await authService.resendOtp(userData.email);
      
//       return response;
//     } catch (error) {
//       console.error('Resend OTP error:', error);
//       return { 
//         success: false, 
//         message: error.message || 'Failed to resend OTP. Please try again.' 
//       };
//     }
//   };

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem('user');
//     localStorage.removeItem('pendingRegistration');
//     navigate('/login');
//   };

//   const checkDuplicate = async (field, value) => {
//     try {
//       const response = await authService.checkDuplicate(field, value);
//       return response;
//     } catch (error) {
//       console.error('Duplicate check error:', error);
//       return { success: false, message: 'Failed to check duplicate' };
//     }
//   };

//   // --- ANOTHER FIX: Expose setUser so components like Profile can update the context ---
//   const value = {
//     user,
//     setUser, // This is needed for Profile.jsx to work
//     isLoading,
//     login,
//     register,
//     verifyOtp,
//     resendOtp,
//     logout,
//     checkDuplicate
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };  


/**
 * @fileoverview Authentication Context for the application.
 * @description Manages user session, state, and authentication functions like
 * login, logout, registration, and OTP flow. Persists the session to localStorage.
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
