"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircleIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import { offers } from "../../marketplace/data/offers";
import ZeroKlueWidget from "../../../components/ZeroKlueWidget";

export default function MerchantCheckoutPage() {
  const { id } = useParams();
  const router = useRouter();
  const [offer, setOffer] = useState<(typeof offers)[0] | null>(null);
  const [discountApplied, setDiscountApplied] = useState(false);

  useEffect(() => {
    if (id) {
      const foundOffer = offers.find((o) => o.id === id);
      setOffer(foundOffer || null);
    }
  }, [id]);

  if (!offer) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center text-white">
        <p>Loading merchant checkout...</p>
      </div>
    );
  }

  const originalPrice = 9.99;
  const discountAmount = 5.0;
  const finalPrice = discountApplied ? originalPrice - discountAmount : originalPrice;

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans selection:bg-blue-500 selection:text-white">
      {/* Merchant Header */}
      <header className="border-b border-white/10 px-6 py-4 flex justify-between items-center sticky top-0 bg-[#121212]/90 backdrop-blur-md z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
           <ChevronLeftIcon className="w-5 h-5 text-gray-400" />
          </button>
          <div className="flex items-center gap-3">
             {/* Dynamic Brand mockup */}
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-sm">
                {offer.partnerName[0]}
             </div>
             <span className="font-bold text-lg tracking-tight">{offer.partnerName} Premium</span>
          </div>
        </div>
        <div className="text-sm text-gray-400">Secure Checkout</div>
      </header>

      <main className="max-w-4xl mx-auto p-6 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Left Column: Billing Form (Mock) */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-6">Payment Details</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Email Address</label>
                <input 
                  type="email" 
                  value="student@university.edu" 
                  disabled 
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-gray-300 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Card Information</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="**** **** **** 4242" 
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <input 
                    type="text" 
                    placeholder="MM/YY" 
                    className="w-24 bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <input 
                    type="text" 
                    placeholder="CVC" 
                    className="w-20 bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10">
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-lg shadow-lg hover:shadow-blue-500/20 transition-all transform active:scale-[0.99]">
              Pay ${finalPrice.toFixed(2)} / month
            </button>
            <p className="text-center text-xs text-gray-500 mt-4">
              Powered by secure payment processing.
            </p>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="bg-[#1A1A1A] rounded-2xl p-8 h-fit border border-white/5 sticky top-24">
          <h3 className="text-xl font-bold mb-6">Order Summary</h3>
          
          {/* Product Item */}
          <div className="flex items-start gap-4 mb-6 pb-6 border-b border-white/10">
            <div className="w-16 h-16 bg-white rounded-lg p-2 flex items-center justify-center shrink-0">
               <img src={offer.logo} alt={offer.partnerName} className="w-full h-full object-contain" />
            </div>
            <div>
              <h4 className="font-bold">{offer.partnerName} Premium</h4>
              <p className="text-sm text-gray-400 mt-1">{offer.description}</p>
              <div className="mt-2 text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded inline-block">
                Monthly Subscription
              </div>
            </div>
            <div className="ml-auto font-mono">
              ${originalPrice}
            </div>
          </div>

          {/* Discount Section */}
          <div className="space-y-3 mb-6">
             <div className="flex justify-between text-sm text-gray-400">
               <span>Subtotal</span>
               <span>${originalPrice}</span>
             </div>
             
             {discountApplied ? (
               <div className="flex justify-between text-sm text-green-400 font-medium items-center bg-green-500/10 p-2 rounded-lg border border-green-500/20">
                 <span className="flex items-center gap-1.5">
                   <CheckCircleIcon className="w-4 h-4" />
                   Student Discount
                 </span>
                 <span>-${discountAmount}</span>
               </div>
             ) : (
                <div className="my-4">
                   <p className="text-sm font-semibold text-gray-300 mb-2">Are you a student?</p>
                   {/* ZEROKLUE WIDGET INTEGRATION */}
                   <ZeroKlueWidget 
                      onVerifySuccess={() => setDiscountApplied(true)}
                      partnerName={offer.partnerName}
                   />
                </div>
             )}

             <div className="border-t border-dashed border-white/20 pt-3 flex justify-between font-bold text-lg">
               <span>Total</span>
               <span>${finalPrice.toFixed(2)}</span>
             </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4">
             <p className="text-xs text-blue-300 leading-relaxed">
               <strong>Note:</strong> This is a simulated merchant checkout. No real payment will be processed. The ZeroKlue verification widget above is the live demo component.
             </p>
          </div>

        </div>

      </main>
    </div>
  );
}
