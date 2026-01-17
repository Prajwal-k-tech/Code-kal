"use client";

import { useState } from "react";
import { EmailStep } from "./EmailStep";
import { OtpStep } from "./OtpStep";
import { WalletStep } from "./WalletStep";
import { SuccessStep } from "./SuccessStep";

/**
 * Main verification flow component
 * Manages state transitions between steps
 * 
 * @owner Frontend Dev 1
 */

type Step = "email" | "otp" | "wallet" | "success";

interface VerificationState {
  email: string;
  university?: string;
  credential?: {
    signature: string;
    nullifier_seed: string;
    issuer_pubkey_x: string;
    issuer_pubkey_y: string;
    email_hash: string;
    wallet: string;
  };
}

export function VerificationFlow() {
  const [step, setStep] = useState<Step>("email");
  const [state, setState] = useState<VerificationState>({ email: "" });

  const handleEmailVerified = (email: string, university?: string) => {
    setState(prev => ({ ...prev, email, university }));
    setStep("otp");
  };

  const handleOtpVerified = () => {
    setStep("wallet");
  };

  const handleWalletConnected = (credential: VerificationState["credential"]) => {
    setState(prev => ({ ...prev, credential }));
    // Store credential in localStorage for later proof generation
    if (credential) {
      localStorage.setItem("zeroklue_credential", JSON.stringify(credential));
    }
    setStep("success");
  };

  return (
    <div className="w-full">
      {/* Progress indicator */}
      <ul className="steps steps-horizontal w-full mb-8">
        <li className={`step ${["email", "otp", "wallet", "success"].includes(step) ? "step-primary" : ""}`}>
          Email
        </li>
        <li className={`step ${["otp", "wallet", "success"].includes(step) ? "step-primary" : ""}`}>
          Verify
        </li>
        <li className={`step ${["wallet", "success"].includes(step) ? "step-primary" : ""}`}>
          Wallet
        </li>
        <li className={`step ${step === "success" ? "step-primary" : ""}`}>
          Done
        </li>
      </ul>

      {/* Step content */}
      {step === "email" && (
        <EmailStep onVerified={handleEmailVerified} />
      )}
      
      {step === "otp" && (
        <OtpStep 
          email={state.email} 
          onVerified={handleOtpVerified}
          onBack={() => setStep("email")}
        />
      )}
      
      {step === "wallet" && (
        <WalletStep 
          email={state.email}
          onConnected={handleWalletConnected}
        />
      )}
      
      {step === "success" && (
        <SuccessStep university={state.university} />
      )}
    </div>
  );
}
