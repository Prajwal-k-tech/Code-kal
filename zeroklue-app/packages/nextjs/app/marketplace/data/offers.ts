export type Offer = {
  id: string;
  partnerName: string;
  description: string;
  discount: string;
  logo: string;
  category: "Entertainment" | "Software" | "Travel" | "Electronics" | "Food";
  bgColor: string;
};

export const offers: Offer[] = [
  {
    id: "1",
    partnerName: "Spotify",
    description: "Premium Individual Plan",
    discount: "50% OFF",
    logo: "🎵",
    category: "Entertainment",
    bgColor: "bg-[#1DB954]",
  },
  {
    id: "2",
    partnerName: "Adobe",
    description: "Creative Cloud All Apps",
    discount: "60% OFF",
    logo: "🎨",
    category: "Software",
    bgColor: "bg-[#FF0000]",
  },
  {
    id: "3",
    partnerName: "Uber",
    description: "Rides & Uber Eats",
    discount: "$5 OFF",
    logo: "🚗",
    category: "Travel",
    bgColor: "bg-black",
  },
  {
    id: "4",
    partnerName: "TechMart",
    description: "Laptops & Accessories",
    discount: "$200 OFF",
    logo: "💻",
    category: "Electronics",
    bgColor: "bg-blue-600",
  },
  {
    id: "5",
    partnerName: "Notion",
    description: "Personal Pro Plan",
    discount: "FREE",
    logo: "📝",
    category: "Software",
    bgColor: "bg-black",
  },
  {
    id: "6",
    partnerName: "Github",
    description: "Student Developer Pack",
    discount: "FREE",
    logo: "🐱",
    category: "Software",
    bgColor: "bg-[#24292e]",
  },
];
