// src/pages/OtpVerification.jsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
// import { verifyOTP, resendOTP } from "../services/authService";
import authService from "../services/authService";
// use: authService.resendOtp(email)

export default function OtpVerification({ otpLength = 6, resendCooldownSec = 30 }) {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const mobile = location.state?.mobile;

  const length = otpLength;
  const [otp, setOtp] = useState(Array(length).fill(""));
  const inputsRef = useRef([]);

  const [isVerifying, setIsVerifying] = useState(false);
  const [serverMsg, setServerMsg] = useState("");
  const [isError, setIsError] = useState(false);
  const [shake, setShake] = useState(0);

  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef(null);

  useEffect(() => {
    // Redirect if no email/mobile
    if (!email && !mobile) {
      navigate("/login");
      return;
    }

    // Auto-focus first empty input
    const firstEmpty = otp.findIndex((d) => !d);
    const idx = firstEmpty === -1 ? length - 1 : firstEmpty;
    inputsRef.current[idx]?.focus();
    
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [email, mobile, navigate, otp, length]);

  // Countdown for resend cooldown
  useEffect(() => {
    if (cooldown <= 0) {
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current);
        cooldownRef.current = null;
      }
      return;
    }
    if (!cooldownRef.current) {
      cooldownRef.current = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) {
            clearInterval(cooldownRef.current);
            cooldownRef.current = null;
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
  }, [cooldown]);

  const setDigit = (value, idx) => {
    const v = value.replace(/[^0-9]/g, "").slice(0, 1);
    const next = [...otp];
    next[idx] = v;
    setOtp(next);
    if (v && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleChange = (e, idx) => {
    setServerMsg("");
    setIsError(false);
    setDigit(e.target.value, idx);
  };

  const handleKeyDown = (e, idx) => {
    setServerMsg("");
    setIsError(false);
    if (e.key === "Backspace") {
      if (otp[idx]) {
        const next = [...otp];
        next[idx] = "";
        setOtp(next);
      } else if (idx > 0) {
        inputsRef.current[idx - 1]?.focus();
        const next = [...otp];
        next[idx - 1] = "";
        setOtp(next);
      }
    } else if (e.key === "ArrowLeft" && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    } else if (e.key === "ArrowRight" && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
    } else if (e.key === "Enter") {
      attemptVerify();
    }
  };

  const handlePaste = (e) => {
    const clipboard = e.clipboardData?.getData?.("Text") ?? "";
    const digits = clipboard.replace(/\D/g, "");
    if (!digits) return;
    e.preventDefault();

    const chars = digits.split("").slice(0, length);
    const next = [...otp];
    for (let i = 0; i < chars.length; i++) {
      next[i] = chars[i];
    }
    setOtp(next);
    
    const firstEmpty = next.findIndex((d) => !d);
    const idx = firstEmpty === -1 ? length - 1 : firstEmpty;
    inputsRef.current[idx]?.focus();
    
    if (next.every((d) => d !== "")) {
      setTimeout(attemptVerify, 150);
    }
  };

  const attemptVerify = async () => {
    if (isVerifying) return;
    const code = otp.join("");
    if (code.length !== length || /\D/.test(code)) {
      setServerMsg("Please enter the full code.");
      setIsError(true);
      triggerShake();
      return;
    }

    setIsVerifying(true);
    setServerMsg("");
    setIsError(false);

    try {
       authService.verifyOTP(email, mobile, code);
      setServerMsg("Verified! Redirecting to Login...!");
      setIsError(false);
      setTimeout(() => {
        navigate("/login");
      }, 800);
    } catch (error) {
      setServerMsg(error.message);
      setIsError(true);
      triggerShake();
    } finally {
      setIsVerifying(false);
    }
  };

  const triggerShake = () => {
    setShake((s) => s + 1);
  };

  const handleResend = async () => {
    if (isResending || cooldown > 0) return;
    setIsResending(true);
    setServerMsg("");
    setIsError(false);

    try {
       authService.resendOTP(email, mobile);
      setServerMsg("OTP resent. Check your inbox/phone.");
      setIsError(false);
      setCooldown(resendCooldownSec);
    } catch (error) {
      setServerMsg(error.message);
      setIsError(true);
    } finally {
      setIsResending(false);
    }
  };

  const inputClass =
    "w-14 h-14 sm:w-16 sm:h-16 text-center text-xl sm:text-2xl font-medium rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 outline-none shadow-sm";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-2">Verify OTP</h2>
        <p className="text-gray-500 mb-6 text-sm">
          Enter the {length}-digit code sent to{" "}
          <span className="font-medium text-gray-700">{email ?? mobile ?? "your contact"}</span>
        </p>

        <AnimatePresence>
          {serverMsg && (
            <motion.div
              key="serverMsg"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mb-4 p-3 rounded-md text-sm ${isError ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
            >
              {serverMsg}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          onPaste={handlePaste}
          className="flex justify-center gap-3 mb-6"
          aria-label="OTP input"
          animate={shake}
          variants={{
            0: { x: 0 },
            1: { x: [-6, 6, -4, 4, -2, 2, 0] }
          }}
        >
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputsRef.current[idx] = el)}
              value={digit}
              onChange={(e) => handleChange(e, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              inputMode="numeric"
              maxLength={1}
              aria-label={`Digit ${idx + 1}`}
              className={`${inputClass} ${isError ? "border-red-400" : ""}`}
            />
          ))}
        </motion.div>

        <button
          onClick={attemptVerify}
          disabled={isVerifying}
          className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium disabled:opacity-60 flex items-center justify-center gap-3"
        >
          {isVerifying ? (
            <>
              <span className="w-4 h-4 border-t-2 border-r-2 border-white rounded-full animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify OTP"
          )}
        </button>

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={handleResend}
            disabled={isResending || cooldown > 0}
            className="text-sm text-blue-600 hover:underline disabled:opacity-50"
          >
            {isResending ? "Resending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
          </button>

          <button
            onClick={() => navigate("/login")}
            className="text-sm text-gray-500 hover:underline"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}