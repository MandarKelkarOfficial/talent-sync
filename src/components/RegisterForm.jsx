/**
 * @author Mandar K.
 * @date 2025-09-13
 * */

// File: src/components/RegisterForm.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, User, Mail, Phone, MapPin, Lock, AlertCircle, CheckCircle, Calendar, Briefcase, Hash } from "lucide-react";

// --- Validation schema ---
const MIN_AGE = 13;

// 1. Define Common Fields (used by both) to avoid duplication
const commonFields = {
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter"),
  address: z.string().min(5, "Address must be at least 5 characters"),
};

// 2. Student Schema
const studentSchema = z.object({
  ...commonFields,
  isRecruiter: z.literal(false),
  pincode: z.string().regex(/^[0-9]{6}$/, "Pincode must be exactly 6 digits"),
  birthdate: z.string().refine((val) => {
    if (!val) return false;
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return false;
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return age >= MIN_AGE;
  }, { message: `You must be at least ${MIN_AGE} years old` }),
  gender: z.enum(['male', 'female', 'other'], { errorMap: () => ({ message: "Please select a gender" }) })
});

// 3. Recruiter Schema
const recruiterSchema = z.object({
  ...commonFields,
  isRecruiter: z.literal(true),
  companyName: z.string().min(2, "Company name is required"),
  // Handle empty string OR valid email for optional field
  companyEmail: z.union([z.literal(""), z.string().email("Invalid company email")]),
  // Handle number input (valueAsNumber returns NaN if empty)
  age: z.number({ invalid_type_error: "Age must be a number" })
        .min(18, "Must be at least 18")
        .optional()
        .or(z.nan()),
});

// 4. Discriminated Union
const formSchema = z.discriminatedUnion("isRecruiter", [
  studentSchema,
  recruiterSchema,
]);

/**
 * Props:
 * - onSubmit(formData) => Promise<{ success: boolean, message?: string } | boolean>
 * - onSwitch() => toggles form mode in parent (LoginPage)
 */
export default function RegisterForm({ onSubmit, onSwitch }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isRecruiter, setIsRecruiter] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      isRecruiter: false, 
      gender: '',
      companyEmail: '', // Ensure default exists
    }
  });

  // Watch for Recruiter checkbox change and reset the form/validation
  const handleRecruiterToggle = (checked) => {
    setIsRecruiter(checked);
    setServerError(""); // Clear previous errors
    // Reset form fields state when switching role to match new schema defaults
    reset({ 
      isRecruiter: checked, 
      gender: '', 
      name: '', 
      email: '', 
      mobile: '', 
      password: '', 
      address: '',
      companyName: '',
      companyEmail: '',
      age: NaN
    });
  };

  // today's date for date input max
  const today = new Date().toISOString().split("T")[0];

  const handleRegisterSubmit = async (data) => {
    setIsSubmitting(true);
    setServerError("");
    try {
      // Ensure isRecruiter is strictly boolean in payload
      const payload = { ...data, isRecruiter: isRecruiter }; 

      // If recruiter, manually map mobile to phoneNumber if needed, and clean up
      if (isRecruiter) {
        payload.phoneNumber = payload.mobile;
        delete payload.mobile;
        
        // Clean up optional fields if they are NaN or empty
        if (Number.isNaN(payload.age)) delete payload.age;
        if (payload.companyEmail === "") delete payload.companyEmail;
      }

      const result = await onSubmit?.(payload);
      const ok = typeof result === "object" ? result.success : result;
      if (ok) {
        setRegistrationSuccess(true);
        // Recruiter flow handles navigation immediately to /login
        // Student flow navigates to /otp
      } else {
        setServerError(result?.message || "Registration failed");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setServerError(err?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formTitle = isRecruiter ? "Register as Recruiter" : "Create a Student Account";
  const formSubtitle = isRecruiter ? "Find talent and manage recruitment" : "Join us and unlock your potential";

  const Input = ({ label, name, icon: Icon, type = "text", ...rest }) => (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icon size={18} className="text-gray-400" /></div>
        <input
          type={type}
          {...register(name, { valueAsNumber: type === 'number' })}
          className={`pl-10 mt-2 w-full px-4 py-3 border ${errors[name] ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition`}
          {...rest}
        />
      </div>
      {errors[name] && (<p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors[name].message}</p>)}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <AnimatePresence>
          {registrationSuccess && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-green-100 text-green-700 p-4 flex items-center gap-2">
              <CheckCircle size={20} />
              <span>Registration successful! Redirecting...</span>
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
            <h2 className="text-2xl md:text-3xl font-bold text-blue-700">{formTitle} ✨</h2>
            <p className="text-gray-500 mt-2">{formSubtitle}</p>
          </motion.div>

          {/* Recruiter Toggle */}
          <div className="flex items-center justify-end mb-4">
            <label className="flex items-center space-x-2 cursor-pointer p-2 bg-purple-50 rounded-lg transition-colors hover:bg-purple-100">
              <input
                type="checkbox"
                checked={isRecruiter}
                onChange={(e) => handleRecruiterToggle(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-purple-700">I am a Recruiter</span>
            </label>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit(handleRegisterSubmit)}>

            {/* Common Fields */}
            <Input label="Full Name" name="name" icon={User} placeholder="John Doe" />
            <Input label="Email Address" name="email" icon={Mail} type="email" placeholder="you@example.com" />
            <Input label="Mobile Number" name="mobile" icon={Phone} placeholder="9876543210" />

            {/* Recruiter Specific Fields */}
            {isRecruiter && (
              <>
                <Input label="Company Name" name="companyName" icon={Briefcase} placeholder="Acme Corp" />
                <Input label="Company Email" name="companyEmail" icon={Mail} type="email" placeholder="hr@acmecorp.com" />
                <Input label="Age" name="age" icon={Hash} type="number" placeholder="25" />
              </>
            )}

            {/* Student Specific Fields */}
            {!isRecruiter && (
              <>
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
              </>
            )}

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none"><MapPin size={18} className="text-gray-400" /></div>
                <textarea {...register("address")} placeholder="Enter your full address" rows={3} className={`pl-10 mt-2 w-full px-4 py-3 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition`} />
              </div>
              {errors.address && (<p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.address.message}</p>)}
            </div>

            {/* Pincode (only for student) */}
            {!isRecruiter && (
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-600 mb-1">Pincode</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MapPin size={18} className="text-gray-400" /></div>
                  <input type="text" {...register("pincode")} placeholder="560001" className={`pl-10 mt-2 w-full px-4 py-3 border ${errors.pincode ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition`} />
                </div>
                {errors.pincode && (<p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.pincode.message}</p>)}
              </div>
            )}

            {/* Password */}
            <div className={isRecruiter ? "md:col-span-1" : "md:col-span-2"}>
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