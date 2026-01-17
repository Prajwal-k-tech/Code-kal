import { offers } from "../data/offers";
import { OfferCard } from "./OfferCard";

interface OfferGridProps {
  isUnlocked?: boolean;
}

export const OfferGrid = ({ isUnlocked = false }: OfferGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {offers.map(offer => (
        <OfferCard key={offer.id} offer={offer} isUnlocked={isUnlocked} />
      ))}
    </div>
  );
};
