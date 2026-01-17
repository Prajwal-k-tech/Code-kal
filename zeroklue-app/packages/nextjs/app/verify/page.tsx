import { Suspense } from "react";
import { VerificationFlow } from "~~/components/verify/VerificationFlow";

/**
 * Student Verification Page
 * 
 * Flow:
 * 1. Email entry + domain validation
 * 2. OTP verification
 * 3. Wallet connection
 * 4. Credential storage
 * 5. Redirect to marketplace
 * 
 * @owner Frontend Dev 1
 */
export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Verify Your Student Email</h1>
            <p className="text-base-content/60 mt-2">
              Prove you&apos;re a student without revealing your identity
            </p>
          </div>
          
          <Suspense fallback={<VerificationSkeleton />}>
            <VerificationFlow />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function VerificationSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-base-300 rounded-lg" />
      <div className="h-12 bg-base-300 rounded-lg" />
      <div className="h-12 bg-primary/20 rounded-lg" />
    </div>
  );
}
