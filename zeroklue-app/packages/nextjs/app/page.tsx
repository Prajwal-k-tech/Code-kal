import { VerificationCard } from "~~/components/VerificationCard";

export default function Home() {
  return (
    <main className="min-h-screen bg-base-200">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
        <section className="text-center space-y-4">
          <p className="text-sm uppercase tracking-wide text-primary">ZeroKlue</p>
          <h1 className="text-4xl md:text-5xl font-bold">Private Student & Professional Verification</h1>
          <p className="text-base md:text-lg opacity-70 max-w-3xl mx-auto">
            Sign in with Google Workspace, generate a ZK proof in-browser, and mint a soulbound credential.
            No backend, no email storage, fully trustless.
          </p>
        </section>

        <VerificationCard />

        <section className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-base-100 border border-base-300">
            <h3 className="font-semibold">1. Google OAuth</h3>
            <p className="text-sm opacity-70">JWT from your university/company domain; Google is the signer.</p>
          </div>
          <div className="p-4 rounded-lg bg-base-100 border border-base-300">
            <h3 className="font-semibold">2. ZK Proof</h3>
            <p className="text-sm opacity-70">noir-jwt circuit validates signature, nonce, and domain privately.</p>
          </div>
          <div className="p-4 rounded-lg bg-base-100 border border-base-300">
            <h3 className="font-semibold">3. Soulbound NFT</h3>
            <p className="text-sm opacity-70">Contract verifies proof and mints a non-transferable credential.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
