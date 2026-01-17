import { Offer } from "../data/offers";

interface OfferCardProps {
  offer: Offer;
  isUnlocked: boolean;
  minimal?: boolean;
}

export const OfferCard = ({ offer, isUnlocked, minimal = false }: OfferCardProps) => {
  return (
    <div
      className={`
        card w-full h-full shadow-2xl overflow-hidden relative
        ${isUnlocked ? "bg-base-100" : "bg-base-100 grayscale"}
        transition-all duration-300 border-4 border-white
      `}
      style={{
        borderRadius: "24px",
      }}
    >
      {/* Background with color/gradient */}
      <div 
        className={`absolute inset-0 ${offer.bgColor} opacity-90`} 
      />
      
      {/* Pattern Overlay (optional texture) */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/noise.png')] mix-blend-overlay"></div>

      <div className="relative h-full flex flex-col p-6 text-white z-10 justify-between">
        {/* Header */}
        <div className="flex justify-between items-start">
           <span className="text-4xl filter drop-shadow-md">{offer.logo}</span>
           {!minimal && (
             <div className="badge bg-black/20 border-0 text-white backdrop-blur-md">
               {offer.category}
             </div>
           )}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1">
          <h2 className={`font-black tracking-tight ${minimal ? "text-2xl" : "text-3xl"}`}>
            {offer.partnerName}
          </h2>
          
          <div className="bg-white/20 backdrop-blur-md self-start px-3 py-1 rounded-full mt-2">
             <span className="font-bold">{offer.discount}</span>
          </div>

          {!minimal && <p className="text-sm mt-3 font-medium opacity-90 leading-tight">{offer.description}</p>}
        </div>

        {/* Action (only in full view) */}
        {!minimal && (
           <div className="mt-4">
             {isUnlocked ? (
               <button className="btn btn-sm glass w-full text-white hover:text-white">Claim</button>
             ) : (
               <div className="flex items-center gap-2 text-white/70 text-sm font-bold">
                 🔒 Locked
               </div>
             )}
           </div>
        )}
      </div>
    </div>
  );
};
