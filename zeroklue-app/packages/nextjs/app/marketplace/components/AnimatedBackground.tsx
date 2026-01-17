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
      /* 
        Optimization Strategy:
        1. CSS Animations instead of JS (Framer Motion)
        2. REMOVED expensive `filter: blur()` - relying on gradient for softness
        3. Reduced layer count
        4. Hardware acceleration cues
      */
      <style jsx>{`
        @keyframes float1 {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(50px, 30px, 0) scale(1.1); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(-30px, 50px, 0); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-20px, 20px, 0) scale(1.05); }
        }
        .blob {
          position: absolute;
          border-radius: 50%;
          will-change: transform;
          /* Force hardware acceleration */
          transform: translate3d(0,0,0);
        }
      `}</style>

      {/* Mesh Gradient 1: Deep Purple/Blue */}
      <div 
        className="blob w-[60vw] h-[60vw] top-[-10%] left-[-10%] opacity-50"
        style={{
            background: "radial-gradient(circle at center, #4c1d95 0%, transparent 60%)",
            animation: "float1 20s infinite ease-in-out",
        }}
      />

      {/* Mesh Gradient 2: Electric Purple */}
      <div 
        className="blob w-[50vw] h-[50vw] top-[30%] right-[-5%] opacity-40 mix-blend-screen"
        style={{
            background: "radial-gradient(circle at center, #7c3aed 0%, transparent 60%)",
            animation: "float2 15s infinite ease-in-out 1s",
        }}
      />

      {/* Mesh Gradient 3: Cyan/Teal */}
      <div 
        className="blob w-[45vw] h-[45vw] top-[-5%] right-[5%] opacity-30 mix-blend-screen"
        style={{
            background: "radial-gradient(circle at center, #06b6d4 0%, transparent 60%)",
            animation: "float3 18s infinite ease-in-out 3s",
        }}
      />
      
      {/* Noise Texture */}
      <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none"></div>
    </div>
  );
};
