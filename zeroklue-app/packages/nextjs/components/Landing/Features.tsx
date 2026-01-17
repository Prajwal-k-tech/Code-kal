import { ShieldCheckIcon, CubeTransparentIcon, KeyIcon } from "@heroicons/react/24/solid";

const FeatureCard = ({ icon, title, description }: { icon: any; title: string; description: string }) => (
    <div className="flex flex-col items-start gap-4 p-6">
        <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center text-pink-500 mb-2">
            {icon}
        </div>
        <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        <p className="text-gray-600 leading-relaxed max-w-sm">
            {description}
        </p>
    </div>
);

export const Features = () => {
    return (
        <div className="w-full bg-white py-24">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

                    <FeatureCard
                        icon={<ShieldCheckIcon className="w-6 h-6" />}
                        title="Privacy First"
                        description="Share your status without revealing your sensitive personal data. Pure cryptographic proof."
                    />

                    <FeatureCard
                        icon={<CubeTransparentIcon className="w-6 h-6" />}
                        title="Interoperable"
                        description="One digital identity for every campus, library, and student discount provider globally."
                    />

                    <FeatureCard
                        icon={<KeyIcon className="w-6 h-6" />}
                        title="Self-Sovereign"
                        description="You own your credentials. No central authority can revoke your digital accomplishments."
                    />

                </div>
            </div>
        </div>
    );
};
