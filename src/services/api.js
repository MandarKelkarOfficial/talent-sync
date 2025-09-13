/**
 * @fileoverview Centralized Axios instance for API calls.
 * @description This file configures an Axios instance that automatically
 * attaches the JWT token from localStorage to the Authorization header
 * for every outgoing request. This ensures all protected backend routes
 * can authenticate the user.
 */
import axios from 'axios';

// Get the server URL from environment variables
const VITE_SERVER_URL = import.meta.env.VITE_SERVER_URL;

// Create a new Axios instance with the base URL
const api = axios.create({
  baseURL: VITE_SERVER_URL
});

// Use an interceptor to add the token to every request
api.interceptors.request.use(
  (config) => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const userData = JSON.parse(userString);
      const token = userData?.token;
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;