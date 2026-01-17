"use client";

import React from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "~~/lib/utils";

interface Step {
    id: string;
    label: string;
    description: string;
}

interface LiquidProgressIndicatorProps {
    steps: Step[];
    currentStep: number; // 0-indexed
    className?: string;
}

/**
 * Liquid-style progress indicator with flowing animations
 * Used for ZeroKlue verification flow
 */
export function LiquidProgressIndicator({
    steps,
    currentStep,
    className,
}: LiquidProgressIndicatorProps) {
    const progress = useSpring(currentStep / (steps.length - 1), {
        stiffness: 100,
        damping: 20,
    });

    return (
        <div className={cn("w-full max-w-2xl mx-auto", className)}>
            {/* Progress Track */}
            <div className="relative flex items-center justify-between mb-8">
                {/* Background Track */}
                <div className="absolute top-1/2 left-0 right-0 h-2 -translate-y-1/2 bg-white/10 rounded-full overflow-hidden">
                    {/* Liquid Fill */}
                    <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-400 rounded-full origin-left"
                        style={{
                            scaleX: progress,
                        }}
                    />
                </div>

                {/* Step Blobs */}
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isActive = index === currentStep;
                    const isPending = index > currentStep;

                    return (
                        <StepBlob
                            key={step.id}
                            stepNumber={index + 1}
                            isCompleted={isCompleted}
                            isActive={isActive}
                            isPending={isPending}
                            label={step.label}
                        />
                    );
                })}
            </div>

            {/* Current Step Details */}
            <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <h3 className="text-xl font-bold text-white mb-2">
                    {steps[currentStep]?.label}
                </h3>
                <p className="text-white/60">
                    {steps[currentStep]?.description}
                </p>
            </motion.div>
        </div>
    );
}

interface StepBlobProps {
    stepNumber: number;
    isCompleted: boolean;
    isActive: boolean;
    isPending: boolean;
    label: string;
}

function StepBlob({
    stepNumber,
    isCompleted,
    isActive,
    isPending,
    label,
}: StepBlobProps) {
    return (
        <div className="relative z-10 flex flex-col items-center">
            {/* The Blob */}
            <motion.div
                className={cn(
                    "relative w-14 h-14 rounded-full flex items-center justify-center",
                    "transition-colors duration-300",
                    isPending && "ring-4 ring-white/20 bg-transparent",
                    isActive && "ring-4 ring-purple-400 bg-purple-500/30",
                    isCompleted && "bg-gradient-to-br from-purple-500 to-pink-500"
                )}
                animate={{
                    scale: isActive ? 1.1 : 1,
                }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                }}
            >
                {/* Inner content */}
                {isCompleted ? (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                        <Check className="w-7 h-7 text-white" strokeWidth={3} />
                    </motion.div>
                ) : (
                    <span
                        className={cn(
                            "text-lg font-bold",
                            isActive ? "text-purple-300" : "text-white/40"
                        )}
                    >
                        {stepNumber}
                    </span>
                )}

                {/* Active Pulse Ring */}
                {isActive && (
                    <motion.div
                        className="absolute inset-0 rounded-full ring-2 ring-purple-400"
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.8, 0, 0.8],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                )}

                {/* Liquid Fill Animation for Active Step */}
                {isActive && (
                    <motion.div
                        className="absolute inset-1 rounded-full bg-gradient-to-t from-purple-500 to-transparent"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 50,
                            damping: 10,
                            delay: 0.3,
                        }}
                        style={{ transformOrigin: "bottom" }}
                    />
                )}
            </motion.div>

            {/* Label */}
            <span
                className={cn(
                    "mt-3 text-xs font-medium text-center max-w-[80px]",
                    isCompleted && "text-purple-300",
                    isActive && "text-white",
                    isPending && "text-white/40"
                )}
            >
                {label}
            </span>
        </div>
    );
}

export default LiquidProgressIndicator;
