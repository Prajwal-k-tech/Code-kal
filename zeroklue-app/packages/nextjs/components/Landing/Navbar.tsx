import Image from "next/image";
import Link from "next/link";

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
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1 text-gray-300 font-medium">
                    <li><Link href="#" className="hover:text-white">Product</Link></li>
                    <li><Link href="#" className="hover:text-white">How It Works</Link></li>
                    <li><Link href="#" className="hover:text-white">Students</Link></li>
                    <li><Link href="#" className="hover:text-white">Partners</Link></li>
                    <li><Link href="#" className="hover:text-white">Docs</Link></li>
                </ul>
            </div>
            <div className="navbar-end">
                <Link href="/verify" className="btn bg-white text-indigo-900 hover:bg-gray-100 border-none rounded-full px-6 font-bold">
                    GET STARTED ↗
                </Link>
            </div>
        </div>
    );
};
