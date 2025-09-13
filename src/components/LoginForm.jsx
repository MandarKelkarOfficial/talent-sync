// import React, { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";

// export default function LoginForm() {
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     rememberMe: false
//   });
//   const [errors, setErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [loginSuccess, setLoginSuccess] = useState(false);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
    
//     // Clear error when user types
//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: ""
//       }));
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};
    
//     if (!formData.email) {
//       newErrors.email = "Email is required";
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = "Email address is invalid";
//     }
    
//     if (!formData.password) {
//       newErrors.password = "Password is required";
//     } else if (formData.password.length < 6) {
//       newErrors.password = "Password must be at least 6 characters";
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     if (validateForm()) {
//       setIsSubmitting(true);
      
//       // Simulate API call
//       setTimeout(() => {
//         setIsSubmitting(false);
//         setLoginSuccess(true);
        
//         // Reset success after 3 seconds
//         setTimeout(() => setLoginSuccess(false), 3000);
//       }, 1500);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
//       <motion.div
//         initial={{ opacity: 0, y: 40 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6, ease: "easeOut" }}
//         className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
//       >
//         {/* Success Message */}
//         <AnimatePresence>
//           {loginSuccess && (
//             <motion.div
//               initial={{ opacity: 0, y: -20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0 }}
//               className="bg-green-100 text-green-700 p-4 flex items-center gap-2"
//             >
//               <CheckCircle size={20} />
//               <span>Login successful! Redirecting...</span>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         <div className="p-6 md:p-8">
//           {/* Title */}
//           <motion.div
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2, duration: 0.5 }}
//             className="text-center mb-8"
//           >
//             <h2 className="text-2xl md:text-3xl font-bold text-blue-700">
//               Welcome Back 👋
//             </h2>
//             <p className="text-gray-500 mt-2">
//               Login to your account to continue
//             </p>
//           </motion.div>

//           {/* Form */}
//           <form className="space-y-5" onSubmit={handleSubmit}>
//             <div>
//               <label className="block text-sm font-medium text-gray-600 mb-1">
//                 Email Address
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Mail size={18} className="text-gray-400" />
//                 </div>
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   placeholder="you@example.com"
//                   className={`pl-10 mt-2 w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition`}
//                 />
//               </div>
//               {errors.email && (
//                 <motion.p 
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   className="text-red-500 text-xs mt-1 flex items-center gap-1"
//                 >
//                   <AlertCircle size={12} />
//                   {errors.email}
//                 </motion.p>
//               )}
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-600 mb-1">
//                 Password
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Lock size={18} className="text-gray-400" />
//                 </div>
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   name="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   placeholder="••••••••"
//                   className={`pl-10 pr-10 mt-2 w-full px-4 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition`}
//                 />
//                 <button
//                   type="button"
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   {showPassword ? (
//                     <EyeOff size={18} className="text-gray-400" />
//                   ) : (
//                     <Eye size={18} className="text-gray-400" />
//                   )}
//                 </button>
//               </div>
//               {errors.password && (
//                 <motion.p 
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   className="text-red-500 text-xs mt-1 flex items-center gap-1"
//                 >
//                   <AlertCircle size={12} />
//                   {errors.password}
//                 </motion.p>
//               )}
//             </div>

//             <div className="flex items-center justify-between text-sm">
//               <label className="flex items-center space-x-2">
//                 <input 
//                   type="checkbox" 
//                   name="rememberMe"
//                   checked={formData.rememberMe}
//                   onChange={handleChange}
//                   className="w-4 h-4 text-blue-500 rounded focus:ring-blue-400" 
//                 />
//                 <span className="text-gray-600 select-none">Remember me</span>
//               </label>
//               <a href="#" className="text-blue-600 hover:underline text-sm">
//                 Forgot password?
//               </a>
//             </div>

//             <motion.button
//               whileHover={{ scale: 1.03 }}
//               whileTap={{ scale: 0.97 }}
//               type="submit"
//               disabled={isSubmitting}
//               className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//             >
//               {isSubmitting ? (
//                 <>
//                   <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
//                   Logging in...
//                 </>
//               ) : (
//                 "Login"
//               )}
//             </motion.button>
//           </form>

//           {/* Divider */}
//           <div className="my-6 flex items-center">
//             <div className="flex-grow border-t border-gray-200"></div>
//             <span className="mx-4 text-gray-500 text-sm">or continue with</span>
//             <div className="flex-grow border-t border-gray-200"></div>
//           </div>

//           {/* Social Login */}
//           <div className="grid grid-cols-2 gap-3">
//             <button className="py-2 px-4 bg-white border border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-700 font-medium hover:bg-gray-50 transition">
//               <svg className="w-5 h-5" viewBox="0 0 24 24">
//                 <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
//               </svg>
//               Google
//             </button>
//             <button className="py-2 px-4 bg-white border border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-700 font-medium hover:bg-gray-50 transition">
//               <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
//                 <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
//               </svg>
//               Facebook
//             </button>
//           </div>

        
//         </div>
//       </motion.div>
//     </div>
//   );
// }


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
