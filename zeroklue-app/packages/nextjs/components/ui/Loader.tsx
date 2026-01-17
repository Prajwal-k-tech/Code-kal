"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const Loader = () => {
    const [text, setText] = useState("Loading");

    // Decrypting text effect
    useEffect(() => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
        const targetText = "ZERO KLUE";
        let iteration = 0;

        // Simulate initial loading delay before text cycles
        const interval = setInterval(() => {
            setText(prev =>
                targetText
                    .split("")
                    .map((letter, index) => {
                        if (index < iteration) {
                            return targetText[index];
                        }
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join("")
            );

            // Stop when decrypted
            if (iteration >= targetText.length) {
                // Optional: Loop the effect or just stop
                if (Math.random() > 0.95) iteration = 0; // Occasional glitch reset
            } else {
                iteration += 1 / 3;
            }

        }, 40);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center gap-8">
            {/* Animated ZK Logo/Ring */}
            <div className="relative w-24 h-24">
                {/* Outer Ring */}
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#7c3aed] border-r-[#06b6d4]"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    style={{ boxShadow: "0 0 20px rgba(124, 58, 237, 0.3)" }}
                />

                {/* Middle Ring (Reverse) */}
                <motion.div
                    className="absolute inset-3 rounded-full border-2 border-transparent border-b-[#4c1d95] border-l-[#7c3aed]"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />

                {/* Inner Core */}
                <motion.div
                    className="absolute inset-8 rounded-full bg-[#0a0a2e] flex items-center justify-center overflow-hidden"
                    animate={{ scale: [0.9, 1.1, 0.9] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <div className="w-full h-full bg-gradient-to-tr from-[#7c3aed] to-[#06b6d4] opacity-20" />
                    <span className="absolute text-white font-bold text-lg">ZK</span>
                </motion.div>

                {/* Glow pulsing behind */}
                <motion.div
                    className="absolute inset-0 rounded-full bg-[#7c3aed] blur-2xl -z-10"
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            </div>

            {/* Decrypting Text */}
            <div className="relative">
                <p className="font-mono text-lg font-bold tracking-[0.2em] text-white">
                    {text}
                </p>
                <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent mt-2 opacity-50" />
            </div>
        </div>
    );
};
