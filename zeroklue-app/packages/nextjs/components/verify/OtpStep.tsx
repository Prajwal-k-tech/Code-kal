"use client";

import { useState, useRef, useEffect } from "react";

/**
 * OTP verification step
 * - 6-digit code input
 * - Auto-focus and auto-advance
 * - Resend functionality
 * 
 * @owner Frontend Dev 1
 * 
 * TODO:
 * - Add countdown timer for resend
 * - Add attempts limit display
 * - Connect to backend /api/verify-otp
 */

interface OtpStepProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}

export function OtpStep({ email, onVerified, onBack }: OtpStepProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only digits
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only last digit
    setOtp(newOtp);
    setError("");

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (newOtp.every(d => d) && index === 5) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid code");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        setLoading(false);
        return;
      }

      onVerified();
      
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    
    setResendCooldown(60);
    
    try {
      await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      console.error("Resend failed:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-base-content/60">
          We sent a code to
        </p>
        <p className="font-medium">{email}</p>
      </div>

      {/* OTP Input */}
      <div className="flex justify-center gap-2">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={el => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            className={`input input-bordered w-12 h-14 text-center text-2xl ${error ? "input-error" : ""}`}
            value={digit}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            disabled={loading}
          />
        ))}
      </div>

      {error && (
        <p className="text-center text-error text-sm">{error}</p>
      )}

      {loading && (
        <div className="flex justify-center">
          <span className="loading loading-spinner loading-md" />
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        <button 
          className="btn btn-ghost btn-sm w-full"
          onClick={handleResend}
          disabled={resendCooldown > 0}
        >
          {resendCooldown > 0 
            ? `Resend in ${resendCooldown}s` 
            : "Didn't receive? Resend code"
          }
        </button>
        
        <button 
          className="btn btn-ghost btn-sm w-full"
          onClick={onBack}
        >
          ← Use different email
        </button>
      </div>
    </div>
  );
}
