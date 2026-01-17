"use client";

import { useEffect, useState, useRef } from "react";

/**
 * DecryptedText
 *
 * A component that reveals text by "decrypting" it from random characters.
 * Customized from standard "Hacker Effect" implementations.
 */

interface DecryptedTextProps {
    text: string;
    speed?: number;
    maxIterations?: number;
    className?: string;
    parentClassName?: string;
    animateOnHover?: boolean;
    revealDirection?: "start" | "end" | "center";
    useOriginalCharsOnly?: boolean;
    characters?: string;
    sequential?: boolean;
}

export default function DecryptedText({
    text,
    speed = 50,
    maxIterations = 10,
    className = "",
    parentClassName = "",
    animateOnHover = false,
    revealDirection = "start",
    useOriginalCharsOnly = false,
    characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+-=[]{}|;':\",./<>?",
    sequential = true, // Reveal characters sequentially (true) or all at once (false)
}: DecryptedTextProps) {
    const [displayText, setDisplayText] = useState(text);
    const [isHovering, setIsHovering] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Calculate how many times each character should change
    // We want a cascade effect

    const startAnimation = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);

        let iteration = 0;

        intervalRef.current = setInterval(() => {
            setDisplayText((prev) =>
                text
                    .split("")
                    .map((char, index) => {
                        if (char === " " || char === "\n") return char;

                        // reveal logic based on iteration and index
                        // If sequential is true, we reveal from left to right gradually
                        // 3 is a magic number to make the "wave" slower than the character cycling
                        if (index < iteration / 3) {
                            return text[index];
                        }

                        // Otherwise show random char
                        return characters[Math.floor(Math.random() * characters.length)];
                    })
                    .join("")
            );

            if (iteration >= text.length * 3 + maxIterations) { // Ensure enough iterations for full reveal
                if (intervalRef.current) clearInterval(intervalRef.current);
                setDisplayText(text); // Ensure final state is correct
            }

            iteration += 1;
        }, speed);
    };

    useEffect(() => {
        startAnimation();

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
    }, [text, speed, maxIterations]); // Re-run if text changes

    const handleMouseEnter = () => {
        if (animateOnHover) {
            startAnimation();
            setIsHovering(true);
        }
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
    }

    return (
        <span
            className={parentClassName}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <span className={className}>{displayText}</span>
        </span>
    );
}
