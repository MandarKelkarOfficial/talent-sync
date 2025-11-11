/**
 *  @author Mandar K.
 * @date 2025-09-13
 * 
 */

// File: src/components/RegisterForm.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, User, Mail, Phone, MapPin, Lock, AlertCircle, CheckCircle, Calendar } from "lucide-react";

// --- Validation schema ---
// Added: birthdate (string, date, minimum age 13) and gender (enum)
const MIN_AGE = 13;
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  pincode: z.string().regex(/^[0-9]{6}$/, "Pincode must be exactly 6 digits"),
  birthdate: z.string().refine((val) => {
    // validate date and min age
    if (!val) return false;
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return false;
    const now = new Date();
    // calculate age in years
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return age >= MIN_AGE;
  }, { message: `You must be at least ${MIN_AGE} years old` }),
  gender: z.enum(['male','female','other'], { errorMap: () => ({ message: "Please select a gender" }) })
});

/**
 * Props:
 *  - onSubmit(formData) => Promise<{ success: boolean, message?: string } | boolean>
 *  - onSwitch() => toggles form mode in parent (LoginPage)
 */
export default function RegisterForm({ onSubmit, onSwitch }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  // today's date for date input max
  const today = new Date().toISOString().split("T")[0];

  const handleRegisterSubmit = async (data) => {
    setIsSubmitting(true);
    setServerError("");
    try {
      // data now contains: name, email, mobile, password, address, pincode, birthdate, gender
      const result = await onSubmit?.(data);
      const ok = typeof result === "object" ? result.success : result;
      if (ok) {
        setRegistrationSuccess(true);
        setTimeout(() => setRegistrationSuccess(false), 3000);
        // Parent (LoginPage) will navigate to /otp and pass data via navigate state if desired
      } else {
        setServerError(result?.message || "Registration failed");
      }
    } catch (err) {
      setServerError(err?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <AnimatePresence>
          {registrationSuccess && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-green-100 text-green-700 p-4 flex items-center gap-2">
              <CheckCircle size={20} />
              <span>Registration successful! Redirecting to verify OTP...</span>
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
            <h2 className="text-2xl md:text-3xl font-bold text-blue-700">Create an Account ✨</h2>
            <p className="text-gray-500 mt-2">Join us and unlock your potential</p>
          </motion.div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit(handleRegisterSubmit)}>
            {/* Name */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User size={18} className="text-gray-400" /></div>
                <input type="text" {...register("name")} placeholder="John Doe" className={`pl-10 mt-2 w-full px-4 py-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition`} />
              </div>
              {errors.name && (<p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.name.message}</p>)}
            </div>

            {/* Email */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail size={18} className="text-gray-400" /></div>
                <input type="email" {...register("email")} placeholder="you@example.com" className={`pl-10 mt-2 w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition`} />
              </div>
              {errors.email && (<p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.email.message}</p>)}
            </div>

            {/* Mobile */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">Mobile Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone size={18} className="text-gray-400" /></div>
                <input type="text" {...register("mobile")} placeholder="9876543210" className={`pl-10 mt-2 w-full px-4 py-3 border ${errors.mobile ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition`} />
              </div>
              {errors.mobile && (<p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.mobile.message}</p>)}
            </div>

            {/* Pincode */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">Pincode</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MapPin size={18} className="text-gray-400" /></div>
                <input type="text" {...register("pincode")} placeholder="560001" className={`pl-10 mt-2 w-full px-4 py-3 border ${errors.pincode ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition`} />
              </div>
              {errors.pincode && (<p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.pincode.message}</p>)}
            </div>

            {/* Birthdate (age) */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">Birthdate</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Calendar size={18} className="text-gray-400" /></div>
                <input
                  type="date"
                  {...register("birthdate")}
                  max={today}
                  className={`pl-10 mt-2 w-full px-4 py-3 border ${errors.birthdate ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition`}
                />
              </div>
              {errors.birthdate && (<p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.birthdate.message}</p>)}
            </div>

            {/* Gender */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
              <div className="relative">
                <select {...register("gender")} className={`pl-3 mt-2 w-full px-4 py-3 border ${errors.gender ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition`}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              {errors.gender && (<p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.gender.message}</p>)}
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none"><MapPin size={18} className="text-gray-400" /></div>
                <textarea {...register("address")} placeholder="Enter your full address" rows={3} className={`pl-10 mt-2 w-full px-4 py-3 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition`} />
              </div>
              {errors.address && (<p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.address.message}</p>)}
            </div>

            {/* Password */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock size={18} className="text-gray-400" /></div>
                <input type={showPassword ? "text" : "password"} {...register("password")} placeholder="••••••••" className={`pl-10 pr-10 mt-2 w-full px-4 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition`} />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-gray-400" />}
                </button>
              </div>
              {errors.password && (<p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.password.message}</p>)}
            </div>

            <div className="col-span-1 md:col-span-2">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {isSubmitting ? (<><div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>Registering...</>) : ("Register")}
              </motion.button>
            </div>
          </form>

          <p className="text-center text-gray-500 mt-6 text-sm">
            Already have an account?{" "}
            <button onClick={onSwitch} className="text-blue-600 hover:underline font-medium">Login</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
