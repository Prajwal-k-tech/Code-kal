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
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Calculate how many times each character should change
    // We want a cascade effect

    const startAnimation = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);

        let iteration = 0;

        intervalRef.current = setInterval(() => {
            setDisplayText(
                text
                    .split("")
                    .map((char, index) => {
                        if (char === " " || char === "\n") return char;

                        const revealIndex =
                            revealDirection === "end"
                                ? text.length - index - 1
                                : revealDirection === "center"
                                  ? Math.abs(index - (text.length - 1) / 2)
                                  : index;
                        const isRevealed = sequential
                            ? revealIndex < iteration / 3
                            : iteration >= maxIterations;
                        if (isRevealed) {
                            return text[index];
                        }

                        const randomCharacters = useOriginalCharsOnly ? text : characters;
                        return randomCharacters[Math.floor(Math.random() * randomCharacters.length)];
                    })
                    .join("")
            );

            const completionIteration = sequential ? text.length * 3 + maxIterations : maxIterations;
            if (iteration >= completionIteration) {
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
    }, [text, speed, maxIterations, revealDirection, useOriginalCharsOnly, characters, sequential]);

    const handleMouseEnter = () => {
        if (animateOnHover) {
            startAnimation();
        }
    };

    return (
        <span
            className={parentClassName}
            onMouseEnter={handleMouseEnter}
        >
            <span className={className}>{displayText}</span>
        </span>
    );
}
