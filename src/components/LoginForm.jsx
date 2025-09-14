/**
 *  @author Mandar K.
 * @date 2025-09-13
 * 
 */

// File: src/components/LoginForm.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";

/**
 * Props:
 *  - onSubmit(formData) => Promise<{ success: boolean, message?: string } | boolean>
 *  - onSwitch() => toggles form mode in parent (LoginPage)
 */
export default function LoginForm({ onSubmit, onSwitch }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    if (serverError) setServerError("");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email address is invalid";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Expect a boolean or an object { success, message }
      const result = await onSubmit?.(formData);
      const ok = typeof result === "object" ? result.success : result;
      if (ok) {
        setLoginSuccess(true);
        setServerError("");
        // keep success message for a short while; parent will navigate
        setTimeout(() => setLoginSuccess(false), 2000);
      } else {
        setServerError(result?.message || "Invalid credentials");
      }
    } catch (err) {
      setServerError(err?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <AnimatePresence>
          {loginSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-green-100 text-green-700 p-4 flex items-center gap-2"
            >
              <CheckCircle size={20} />
              <span>Login successful! Redirecting...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {serverError && (
          <div className="bg-red-50 text-red-700 p-3 text-sm flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        <div className="p-6 md:p-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-blue-700">Welcome Back 👋</h2>
            <p className="text-gray-500 mt-2">Login to your account to continue</p>
          </motion.div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`pl-10 mt-2 w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition`}
                />
              </div>
              {errors.email && (<p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.email}</p>)}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`pl-10 pr-10 mt-2 w-full px-4 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition`}
                />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-gray-400" />}
                </button>
              </div>
              {errors.password && (<p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.password}</p>)}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleChange} className="w-4 h-4 text-blue-500 rounded focus:ring-blue-400" />
                <span className="text-gray-600 select-none">Remember me</span>
              </label>
              <a href="#" className="text-blue-600 hover:underline text-sm">Forgot password?</a>
            </div>

            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isSubmitting ? (<><div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>Logging in...</>) : ("Login")}
            </motion.button>
          </form>

          {/* Inline switch for login/register inside the form */}
          <p className="text-center text-gray-500 mt-6 text-sm">
            Don't have an account?{" "}
            <button onClick={onSwitch} className="text-blue-600 hover:underline font-medium">Register</button>
          </p>

          {/* Divider & Social buttons omitted for brevity, add back if needed */}
        </div>
      </motion.div>
    </div>
  );
}
