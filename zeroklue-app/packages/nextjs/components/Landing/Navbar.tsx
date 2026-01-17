"use client";

import Image from "next/image";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export const Navbar = () => {
    return (
        <div className="navbar bg-transparent absolute top-0 left-0 w-full z-50 px-6 py-4">
            <div className="navbar-start">
                <Link href="/" className="btn btn-ghost text-2xl font-bold text-white normal-case hover:bg-white/10 gap-3">
                    <div className="relative w-8 h-8">
                        <Image
                            src="/favicon.png"
                            alt="ZeroKlue Logo"
                            fill
                            className="object-contain brightness-0 invert"
                        />
                    </div>
                    ZeroKlue
                </Link>
            </div>

            <div className="navbar-end">
                <ConnectButton.Custom>
                    {({ account, chain, openConnectModal, mounted }) => {
                        const connected = mounted && account && chain;

                        return (
                            <>
                                {!connected ? (
                                    <button
                                        onClick={openConnectModal}
                                        type="button"
                                        className="btn bg-white text-indigo-900 hover:bg-gray-100 border-none rounded-full px-6 font-bold"
                                    >
                                        Connect Wallet
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <span className="text-white/80 text-sm hidden md:block">
                                            {account.displayName}
                                        </span>
                                        <Link
                                            href="/verify"
                                            className="btn bg-pink-500 hover:bg-pink-600 text-white border-none rounded-full px-6 font-bold"
                                        >
                                            Get Verified
                                        </Link>
                                    </div>
                                )}
                            </>
                        );
                    }}
                </ConnectButton.Custom>
            </div>
        </div>
    );
};
