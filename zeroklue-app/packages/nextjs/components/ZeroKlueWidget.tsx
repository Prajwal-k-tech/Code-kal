"use client";

import { useState } from "react";
import { ShieldCheckIcon } from "@heroicons/react/24/solid";
import  { ProofModal }  from "./offers/ProofModal";

type ZeroKlueWidgetProps = {
  onVerifySuccess: () => void;
  partnerName: string;
};

export default function ZeroKlueWidget({ onVerifySuccess, partnerName }: ZeroKlueWidgetProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock data for the modal (offer ID doesn't matter much here since we just want the flow)
  const mockOffer = {
    id: "widget-flow",
    partnerName: partnerName,
    description: "Student Verification",
    discount: "50% OFF",
    logo: "", // Not needed for modal logic
    category: "Software" as const,
    bgColor: "bg-blue-600"
  };

  const handleVerificationComplete = () => {
    setIsModalOpen(false);
    onVerifySuccess();
  };

  return (
    <div className="bg-[#0a0a2e] rounded-xl p-1 border border-white/10 shadow-lg relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none"></div>
      
      <div className="bg-[#0f0f4a]/50 rounded-lg p-3 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
             <ShieldCheckIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-cyan-300 font-bold tracking-wider">ZEROKLUE</div>
            <div className="text-[10px] text-gray-400">Privacy-First Verification</div>
          </div>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-[#0a0a2e] text-xs font-bold px-3 py-2 rounded-md hover:bg-cyan-50 transition-colors shadow-sm"
        >
          Verify Status
        </button>
      </div>

      {isModalOpen && (
        <ProofModal 
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleVerificationComplete}
        />
      )}
    </div>
  );
}
