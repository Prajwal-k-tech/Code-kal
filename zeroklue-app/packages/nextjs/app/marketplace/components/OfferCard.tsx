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
           <div className="bg-white rounded-xl p-2 shadow-lg w-16 h-16 flex items-center justify-center">
             <img 
               src={offer.logo} 
               alt={`${offer.partnerName} logo`} 
               className="w-full h-full object-contain"
             />
           </div>
           {!minimal && (
             <div className="badge bg-black/20 border-0 text-white backdrop-blur-md">
               {offer.category}
             </div>
           )}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1 mt-auto mb-4">
          {/* Partner Name (Platform) */}
          <h2 className={`font-black tracking-tight text-white ${minimal ? "text-2xl" : "text-4xl"}`}>
            {offer.partnerName}
          </h2>
          
          {/* Discount - Huge in descriptive mode */}
          <div className={`${minimal ? "mt-2" : "mt-4"}`}>
             <span className={`font-black text-white ${minimal ? "text-lg bg-white/20 px-3 py-1 rounded-full" : "text-5xl drop-shadow-lg"}`}>
               {offer.discount}
             </span>
             {!minimal && <span className="block text-lg font-medium text-white/80 mt-1">OFF</span>}
          </div>

          {!minimal && <p className="text-base mt-4 font-medium text-gray-100 leading-snug">{offer.description}</p>}
        </div>

        {/* Action (only in full view) */}
        {!minimal && (
           <div className="mt-4">
             {isUnlocked ? (
               <button className="btn btn-sm bg-white text-black border-none w-full hover:bg-gray-100 hover:scale-[1.02] transition-all shadow-lg font-bold flex items-center justify-center gap-2 group">
                 Claim Reward 
                 <span className="group-hover:translate-x-1 transition-transform">➜</span>
               </button>
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
