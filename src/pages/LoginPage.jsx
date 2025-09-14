/**
 *  @author Mandar K.
 * @date 2025-09-13
 * 
 */

// File: src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Changed from AuthContext to useAuth
import LoginForm from "../components/LoginForm.jsx";
import RegisterForm from "../components/RegisterForm.jsx";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth(); // Using useAuth hook instead of useContext
  const navigate = useNavigate();

  // called by LoginForm
  const handleLogin = async (data) => {
    try {
      const result = await login(data.email, data.password);
      
      if (result.success) {
        // Navigation is handled automatically in AuthContext
        return { success: true };
      } else {
        return { success: false, message: result.message || "Login failed" };
      }
    } catch (error) {
      return { success: false, message: error.message || "Login failed" };
    }
  };

  // called by RegisterForm
  const handleRegister = async (data) => {
    try {
      const result = await register(data);
      
      if (result.success) {
        // Navigation is handled automatically in AuthContext
        return { success: true };
      } else {
        return { success: false, message: result.message || "Registration failed" };
      }
    } catch (error) {
      return { success: false, message: error.message || "Registration failed" };
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-lavender-200 p-6">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-lg overflow-hidden">
        {/* pass onSwitch to the forms; forms will show the switch link internally */}
        {isLogin ? (
          <LoginForm onSubmit={handleLogin} onSwitch={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onSubmit={handleRegister} onSwitch={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
}