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
                        title="Proof Generation Prototype"
                        description="The browser can generate proof material, but the current contract does not verify it or establish student status."
                    />

                    <FeatureCard
                        icon={<CubeTransparentIcon className="w-6 h-6" />}
                        title="On-Chain Registry"
                        description="The contract stores wallet keys and timestamps. It is a prototype and is not connected to real student-benefit providers."
                    />

                    <FeatureCard
                        icon={<KeyIcon className="w-6 h-6" />}
                        title="Development Status"
                        description="JWT source, shipped circuit artifacts, and contract verification are not yet connected as a complete credential-verification flow."
                    />

                </div>
            </div>
        </div>
    );
};
