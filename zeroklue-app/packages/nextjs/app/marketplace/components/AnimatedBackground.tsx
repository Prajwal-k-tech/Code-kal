"use client";

import { useEffect, useState } from "react";

export const AnimatedBackground = () => {
  // Use a state to ensure we only render the heavy background on the client to avoid hydration mismatches
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="fixed inset-0 z-[-1] bg-[#0a0a2e]" />;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#0a0a2e] contain-content">
      {/* 
        Optimization Strategy:
        1. CSS Animations instead of JS (Framer Motion) for constant loops
        2. will-change: transform to hint GPU layer creation
        3. Reduced blur radius slightly to save fill-rate
      */}
      <style jsx>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(100px, 50px) scale(1.1); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-50px, 80px); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 40px) scale(1.05); }
        }
        @keyframes float4 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(0, -40px); }
        }
        .blob {
          position: absolute;
          border-radius: 50%;
          will-change: transform;
        }
      `}</style>

      {/* Mesh Gradient 1: Deep Purple/Blue */}
      <div 
        className="blob w-[70vw] h-[70vw] top-[-20%] left-[-10%] opacity-60 blend-multiply"
        style={{
            background: "radial-gradient(circle, #4c1d95 0%, transparent 70%)",
            animation: "float1 20s infinite ease-in-out",
            filter: "blur(80px)", // Reduced from 100px
        }}
      />

      {/* Mesh Gradient 2: Electric Purple */}
      <div 
        className="blob w-[60vw] h-[60vw] top-[20%] right-[-10%] opacity-50 blend-screen"
        style={{
            background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
            animation: "float2 15s infinite ease-in-out 2s",
            filter: "blur(90px)", // Reduced from 120px
        }}
      />

      {/* Mesh Gradient 3: Cyan/Teal */}
      <div 
        className="blob w-[50vw] h-[50vw] top-[-10%] right-[10%] opacity-40 blend-screen"
        style={{
            background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)",
            animation: "float3 18s infinite ease-in-out 5s",
            filter: "blur(80px)",
        }}
      />

      {/* Mesh Gradient 4: Deep Blue */}
      <div 
        className="blob w-[80vw] h-[80vw] bottom-[-20%] left-[20%] opacity-70 blend-multiply"
        style={{
            background: "radial-gradient(circle, #1e3a8a 0%, transparent 70%)",
            animation: "float4 25s infinite ease-in-out",
            filter: "blur(90px)",
        }}
      />
      
      {/* Noise Texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none"></div>
    </div>
  );
};
