/**
 * Offer data for marketplace
 * Easy to add more offers here
 *
 * @owner Frontend Dev 2
 */

export interface Offer {
  id: string;
  name: string;
  description: string;
  discount: string;
  icon: string;
  color: string;
  url?: string;
  isMerchantDemo?: boolean;
}

export const offers: Offer[] = [
  {
    id: "spotify",
    name: "Spotify",
    description: "Premium Student Plan",
    discount: "50% OFF",
    icon: "🎵",
    color: "#1DB954",
    url: "https://spotify.com/student",
  },
  {
    id: "uber",
    name: "Uber",
    description: "Ride Credits",
    discount: "$5 OFF",
    icon: "🚗",
    color: "#000000",
    url: "https://uber.com",
  },
  {
    id: "adobe",
    name: "Adobe",
    description: "Creative Cloud",
    discount: "60% OFF",
    icon: "🎨",
    color: "#FF0000",
    url: "https://adobe.com/students",
  },
  {
    id: "techmart",
    name: "TechMart",
    description: "Electronics Store",
    discount: "$200 OFF",
    icon: "💻",
    color: "#6366F1",
    isMerchantDemo: true,
  },
];
