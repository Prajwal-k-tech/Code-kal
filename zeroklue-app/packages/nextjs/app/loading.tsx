import { Loader } from "~~/components/ui/Loader";

export default function Loading() {
    return (
        <div className="fixed inset-0 bg-[#0a0a2e] flex items-center justify-center z-[9999]">
            {/* Background gradient blob for depth */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-20 blur-[100px] pointer-events-none"
                style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }}
            />

            <div className="relative z-10">
                <Loader />
            </div>
        </div>
    );
}
