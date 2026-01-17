import Link from "next/link";
import { CheckBadgeIcon, ArrowRightIcon } from "@heroicons/react/24/solid";

export const Hero = () => {
    return (
        <div className="relative min-h-screen w-full bg-[#1a0b2e] overflow-hidden flex flex-col justify-center">
            {/* Background Gradient - Placeholder for user's background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#2a1b3d] via-[#4a1d5c] to-[#1a0b2e] opacity-80"></div>

            {/* Pink Diagonal Slash overlay effect (mimicking image) */}
            <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-purple-800/20 to-transparent transform -skew-x-12"></div>

            <div className="container mx-auto px-6 relative z-10 pt-20">
                <div className="flex flex-col lg:flex-row items-center gap-12">

                    {/* Left Content */}
                    <div className="flex-1 text-left">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-[2px] w-12 bg-pink-400"></div>
                            <span className="text-pink-400 font-bold tracking-widest text-sm">DECENTRALIZED SECURITY</span>
                        </div>

                        <h1 className="text-6xl lg:text-8xl font-black text-white leading-tight mb-8">
                            DECENTRALIZED,<br />
                            PRIVACY-SAFE<br />
                            VERIFICATION<span className="text-pink-400">*</span>
                        </h1>

                        {/* Upcoming Integration Card (Absolute/Floating style in original, inline here for mobile responsiveness) */}
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-sm mt-12 hover:bg-white/15 transition-all cursor-pointer group">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">Upcoming Integration</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-2xl">🏛️</div>
                                <div>
                                    <h3 className="text-white font-bold text-lg leading-none">EDU-CHAIN</h3>
                                    <p className="text-gray-300 text-sm">GLOBAL NETWORK</p>
                                </div>
                                <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-white ml-auto" />
                            </div>
                            <div className="mt-3 text-pink-400 text-xs font-bold uppercase">Launching October 2026</div>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="flex-1 lg:pl-12 flex flex-col justify-center">
                        <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                            A live experience that brings together professional designers, the brightest creative minds, and the most innovative brands using zero-knowledge technology.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/verify" className="btn bg-pink-500 hover:bg-pink-600 text-white border-none rounded-lg px-8 py-4 h-auto text-lg font-bold flex items-center gap-2">
                                GET VERIFIED
                                <CheckBadgeIcon className="w-6 h-6" />
                            </Link>
                            <Link href="#" className="btn bg-white/10 hover:bg-white/20 text-white border-none rounded-lg px-8 py-4 h-auto text-lg font-bold">
                                PARTNER WITH US
                            </Link>
                        </div>

                        {/* Big Background Text Element */}
                        <div className="absolute bottom-0 right-0 -mr-20 -mb-10 pointer-events-none opacity-10 select-none">
                            <span className="text-[200px] font-black text-white leading-none">ZEROKLUE</span>
                        </div>
                    </div>

                </div>
            </div>

            {/* Bottom Info Bar */}
            <div className="absolute bottom-0 left-0 w-full border-t border-white/10 bg-black/20 backdrop-blur-sm py-6 px-6 hidden lg:block">
                <div className="container mx-auto flex justify-center gap-20 text-xs font-bold tracking-widest text-gray-400">
                    <div className="flex flex-col gap-1">
                        <span>GLOBAL</span>
                        <span className="text-white">STANDARDS</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span>TRUST</span>
                        <span className="text-white">DECENTRALIZED</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span>PRIVACY</span>
                        <span className="text-white">ZK-PROOFS</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span>NETWORK</span>
                        <span className="text-white">COMMUNITY</span>
                    </div>
                </div>
            </div>

        </div>
    );
};
