"use client";

import { MeshGradient } from "@paper-design/shaders-react"
import { useEffect, useState } from "react"
import { ArrowRightIcon, CheckBadgeIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import DecryptedText from "./decrypted-text";

interface HeroSectionProps {
    title?: string
    highlightText?: string
    description?: string
    buttonText?: string
    onButtonClick?: () => void
    colors?: string[]
    distortion?: number
    swirl?: number
    speed?: number
    offsetX?: number
    className?: string
    titleClassName?: string
    descriptionClassName?: string
    buttonClassName?: string
    maxWidth?: string
    veilOpacity?: string
    fontFamily?: string
    fontWeight?: number
}

export function HeroSection({
    title = "DECENTRALIZED,\nPRIVACY-SAFE",
    highlightText = "VERIFICATION",
    description = "A live experience that brings together professional designers, the brightest creative minds, and the most innovative brands using zero-knowledge technology.",
    buttonText = "GET VERIFIED",
    onButtonClick,
    colors = ["#2c0075", "#5e17eb", "#2c5af2", "#2cc2f2", "#010229", "#8A2BE2"],
    distortion = 1.2,
    swirl = 0.6,
    speed = 0.8,
    offsetX = 0.08,
    className = "",
    titleClassName = "",
    descriptionClassName = "",
    buttonClassName = "",
    maxWidth = "max-w-7xl",
    veilOpacity = "bg-black/30",
    fontFamily = "inherit",
    fontWeight = 700,
}: HeroSectionProps) {
    const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 })
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const update = () =>
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            })
        update()
        window.addEventListener("resize", update)
        return () => window.removeEventListener("resize", update)
    }, [])

    return (
        <section className={`relative w-full min-h-screen overflow-hidden bg-[#1a0b2e] flex items-center justify-center ${className}`}>
            <div className="fixed inset-0 w-screen h-screen">
                {mounted && (
                    <>
                        <MeshGradient
                            width={dimensions.width}
                            height={dimensions.height}
                            colors={colors}
                            distortion={distortion}
                            swirl={swirl}
                            grainMixer={0}
                            grainOverlay={0}
                            speed={speed}
                            offsetX={offsetX}
                        />
                        <div className={`absolute inset-0 pointer-events-none ${veilOpacity}`} />
                    </>
                )}
            </div>

            {/* Main Content - Vertically Centered */}
            <div className={`relative z-10 ${maxWidth} mx-auto px-8 lg:px-12 w-full flex flex-col justify-center min-h-[calc(100vh-180px)] pb-32`}>
                <div className="flex flex-col lg:flex-row lg:items-end gap-8 lg:gap-16">
                    {/* Left Column - Title */}
                    <div className="flex-[1.2]">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-[2px] w-10 bg-pink-400"></div>
                            <span className="text-pink-400 font-bold tracking-[0.2em] text-xs uppercase">Decentralized Security</span>
                        </div>
                        <h1
                            className={`font-black text-white text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] leading-[0.9] tracking-tight ${titleClassName}`}
                            style={{ fontFamily, fontWeight }}
                        >
                            DECENTRALIZED,<br />
                            <span className="flex items-center gap-2">
                                <DecryptedText
                                    text="PRIVACY-SAFE"
                                    speed={40}
                                    maxIterations={8}
                                    className="text-white"
                                    animateOnHover={false}
                                    sequential={true}
                                    revealDirection="start"
                                />
                            </span>
                            <span className="text-pink-400">{highlightText}*</span>
                        </h1>
                    </div>

                    {/* Right Column - Description & CTAs */}
                    <div className="flex-1 lg:max-w-md">
                        <p className={`text-lg lg:text-xl text-gray-300 mb-8 leading-relaxed ${descriptionClassName}`}>
                            {description}
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link href="/verify" className={`btn bg-pink-500 hover:bg-pink-600 text-white border-none rounded-lg px-6 py-3 h-auto text-base font-bold flex items-center gap-2 shadow-lg shadow-pink-500/25 transition-all hover:shadow-pink-500/40 hover:scale-[1.02] ${buttonClassName}`}>
                                {buttonText}
                                <CheckBadgeIcon className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="btn bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg px-6 py-3 h-auto text-base font-bold backdrop-blur-sm transition-all hover:border-white/40">
                                PARTNER WITH US
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Info Bar - Flush to bottom */}
            <div className="absolute bottom-0 left-0 w-full border-t border-white/10 bg-gradient-to-t from-black/40 to-black/20 backdrop-blur-md py-6 px-8 hidden lg:block z-20">
                <div className="max-w-6xl mx-auto flex justify-between items-center text-xs font-semibold tracking-[0.15em] uppercase">
                    <div className="flex flex-col gap-0.5 text-center">
                        <span className="text-gray-500">Global</span>
                        <span className="text-white">Standards</span>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div className="flex flex-col gap-0.5 text-center">
                        <span className="text-gray-500">Trust</span>
                        <span className="text-white">Decentralized</span>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div className="flex flex-col gap-0.5 text-center">
                        <span className="text-gray-500">Privacy</span>
                        <span className="text-white">ZK-Proofs</span>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div className="flex flex-col gap-0.5 text-center">
                        <span className="text-gray-500">Network</span>
                        <span className="text-white">Community</span>
                    </div>
                </div>
            </div>
        </section>
    )
}
