import { Suspense } from "react";
import { OfferGrid } from "~~/components/offers/OfferGrid";
import { UnlockButton } from "~~/components/offers/UnlockButton";

/**
 * Marketplace Page
 * 
 * Shows offer cards in locked/unlocked state based on NFT ownership
 * 
 * @owner Frontend Dev 2
 */
export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold">Student Offers</h1>
          <p className="text-base-content/60 mt-2">
            Exclusive discounts for verified students
          </p>
        </header>

        <Suspense fallback={<OffersSkeleton />}>
          <OfferGrid />
        </Suspense>

        <div className="fixed bottom-8 left-0 right-0 flex justify-center">
          <UnlockButton />
        </div>
      </div>
    </div>
  );
}

function OffersSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="card bg-base-100 shadow-xl animate-pulse">
          <div className="h-32 bg-base-300" />
          <div className="card-body">
            <div className="h-6 bg-base-300 rounded w-2/3" />
            <div className="h-4 bg-base-300 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
