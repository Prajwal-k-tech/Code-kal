"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircleIcon, ArrowLeftIcon, StarIcon, PlayCircleIcon, DocumentTextIcon, ClockIcon } from "@heroicons/react/24/outline";
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
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-slate-300 font-mono">
        <div className="flex flex-col items-center gap-4">
           <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
           <p className="text-sm">Loading ChainAcademy...</p>
        </div>
      </div>
    );
  }

  const coursePrice = 1299.00;
  const discountAmount = 1299.00; // 100% OFF for demo or calculate based on offer
  const finalPrice = discountApplied ? 0 : coursePrice;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      
      {/* Navigation (Updraft Style) */}
      <nav className="border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
               <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
                 <span className="text-white font-mono text-lg">C</span>
               </div>
               ChainAcademy
            </div>
            <div className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Courses</a>
              <a href="#" className="hover:text-white transition-colors">Audits</a>
              <a href="#" className="hover:text-white transition-colors">Blog</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => router.back()} className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2">
               <ArrowLeftIcon className="w-4 h-4" />
               Back
             </button>
             <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10"></div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Course Content */}
        <div className="lg:col-span-8 space-y-8">
           {/* Breadcrumb */}
           <div className="flex items-center gap-2 text-xs font-mono text-blue-400">
              <span>COURSES</span>
              <span>/</span>
              <span className="text-slate-400">ADVANCED SECURITY</span>
           </div>

           <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
             Advanced Smart Contract <br/> 
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
               Security & Auditing
             </span>
           </h1>

           <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                 <div className="flex text-yellow-500"><StarIcon className="w-4 h-4 fill-current"/><StarIcon className="w-4 h-4 fill-current"/><StarIcon className="w-4 h-4 fill-current"/><StarIcon className="w-4 h-4 fill-current"/><StarIcon className="w-4 h-4 fill-current"/></div>
                 <span>(4.9/5 stars)</span>
              </div>
              <div className="flex items-center gap-2">
                 <DocumentTextIcon className="w-4 h-4" />
                 <span>75 Lessons</span>
              </div>
              <div className="flex items-center gap-2">
                 <ClockIcon className="w-4 h-4" />
                 <span>45 Hours</span>
              </div>
              <div className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
                INTERMEDIATE
              </div>
           </div>

           {/* Course Thumbnail / Preview */}
           <div className="aspect-video w-full rounded-2xl bg-slate-800 border border-white/5 relative overflow-hidden group shadow-2xl shadow-blue-900/10">
              <img 
                src="https://images.unsplash.com/photo-1639322537228-ad714291be30?q=80&w=2832&auto=format&fit=crop" 
                alt="Course Preview" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <button className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:scale-110 transition-transform">
                   <PlayCircleIcon className="w-8 h-8 ml-1" />
                 </button>
              </div>
           </div>

           {/* Syllabus Preview */}
           <div className="space-y-4 pt-8">
              <h3 className="text-xl font-bold text-white">Course Syllabus</h3>
              <div className="space-y-2">
                 {[1, 2, 3].map((i) => (
                   <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50 border border-white/5 hover:border-blue-500/30 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm">
                        {i}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-200">Module {i}: Foundation of EVM Opcode</div>
                        <div className="text-xs text-slate-500 mt-1">45 mins • 3 lectures</div>
                      </div>
                      <div className="text-slate-600">
                         <PlayCircleIcon className="w-5 h-5" />
                      </div>
                   </div>
                 ))}
                 <div className="p-4 text-center text-sm text-slate-500 font-medium">
                   + 12 more modules
                 </div>
              </div>
           </div>
        </div>

        {/* Right Column: Checkout Card */}
        <div className="lg:col-span-4 space-y-6">
           <div className="sticky top-24">
              <div className="p-6 rounded-2xl bg-slate-800/50 border border-white/10 shadow-xl backdrop-blur-sm">
                 <div className="flex items-end gap-2 mb-6">
                    {discountApplied ? (
                       <>
                         <span className="text-3xl font-extrabold text-white">FREE</span>
                         <span className="text-lg text-slate-500 line-through mb-1">${coursePrice}</span>
                       </>
                    ) : (
                       <span className="text-3xl font-extrabold text-white">${coursePrice}</span>
                    )}
                 </div>

                 <button 
                   className={`w-full py-4 rounded-xl font-bold text-sm mb-4 flex items-center justify-center gap-2 transition-all ${
                     discountApplied 
                      ? "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-900/20" 
                      : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
                   }`}
                 >
                   {discountApplied ? "Enroll for Free" : "Enroll Now"}
                 </button>

                 <p className="text-xs text-center text-slate-500 mb-6">
                   30-day money-back guarantee • Lifetime access
                 </p>

                 {/* VISIBLE SEPARATOR */}
                 <div className="relative h-px bg-white/10 my-6">
                    <span className="absolute left-1/2 -top-2.5 -ml-4 bg-slate-800/50 px-2 text-xs text-slate-500">
                      OR
                    </span>
                 </div>

                 {/* ZEROKLUE INTEGRATION */}
                 <div className="space-y-4">
                    {!discountApplied && (
                       <div>
                          <div className="flex items-center gap-2 mb-3">
                             <div className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-500/50"></div>
                             <span className="text-xs font-bold text-blue-400 tracking-wider">STUDENT DISCOUNT</span>
                             <div className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-500/50"></div>
                          </div>
                          
                          <ZeroKlueWidget 
                             partnerName="ChainAcademy" 
                             onVerifySuccess={() => setDiscountApplied(true)} 
                          />
                       </div>
                    )}

                    {discountApplied && (
                       <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex flex-col items-center text-center gap-2 animate-pulse">
                          <CheckCircleIcon className="w-8 h-8 text-green-400" />
                          <div>
                             <div className="font-bold text-green-400 text-sm">Student Verified!</div>
                             <div className="text-xs text-green-300/70">100% Discount Applied</div>
                          </div>
                       </div>
                    )}
                 </div>

              </div>

              {/* Trust Badges */}
              <div className="mt-8 grid grid-cols-2 gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                 {/* Mock Logos */}
                 <div className="h-8 bg-white/10 rounded flex items-center justify-center text-[10px] font-bold">ETHEREUM</div>
                 <div className="h-8 bg-white/10 rounded flex items-center justify-center text-[10px] font-bold">POLYGON</div>
              </div>
           </div>
        </div>

      </main>
    </div>
  );
}
