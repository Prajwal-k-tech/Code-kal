"use client";

import { useState } from "react";
import { validateEmailDomain } from "~~/lib/universities";

/**
 * Email entry step
 * - Validates email format
 * - Checks domain against university list
 * - Triggers OTP send via backend
 * 
 * @owner Frontend Dev 1
 * 
 * TODO:
 * - Add loading state
 * - Add error handling
 * - Connect to backend /api/verify-email
 */

interface EmailStepProps {
  onVerified: (email: string, university?: string) => void;
}

export function EmailStep({ onVerified }: EmailStepProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate domain
      const validation = await validateEmailDomain(email);
      
      if (!validation.valid) {
        setError(validation.error || "Invalid email domain");
        setLoading(false);
        return;
      }

      // Send OTP via backend
      const response = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send verification code");
        setLoading(false);
        return;
      }

      // Success - move to OTP step
      onVerified(email, validation.university?.name);
      
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">University Email</span>
        </label>
        <input
          type="email"
          placeholder="you@university.edu"
          className={`input input-bordered w-full ${error ? "input-error" : ""}`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
        {error && (
          <label className="label">
            <span className="label-text-alt text-error">{error}</span>
          </label>
        )}
      </div>

      <button 
        type="submit" 
        className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
        disabled={loading || !email}
      >
        {loading ? "Sending Code..." : "Send Verification Code"}
      </button>

      <p className="text-center text-sm text-base-content/60">
        Supported: .edu, .ac.in, .ac.uk, and more
      </p>
    </form>
  );
}
