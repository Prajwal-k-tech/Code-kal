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
    discount: "50%",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
    category: "Entertainment",
    bgColor: "bg-[#1DB954]",
  },
  {
    id: "2",
    partnerName: "PixelPerfect",
    description: "Ultimate Design Suite",
    discount: "60%",
    logo: "/pixelperfect.svg",
    category: "Software",
    bgColor: "bg-[#FF3366]",
  },
  {
    id: "3",
    partnerName: "Uber",
    description: "Rides & Uber Eats",
    discount: "$5",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png",
    category: "Travel",
    bgColor: "bg-black",
  },
  {
    id: "4",
    partnerName: "Amazon",
    description: "Prime Student (6 months)",
    discount: "FREE",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg",
    category: "Electronics",
    bgColor: "bg-[#232F3E]",
  },
  {
    id: "5",
    partnerName: "Notion",
    description: "Personal Pro Plan",
    discount: "FREE",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
    category: "Software",
    bgColor: "bg-black",
  },
  {
    id: "6",
    partnerName: "GitHub",
    description: "Student Developer Pack",
    discount: "FREE",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/c2/GitHub_Invertocat_Logo.svg",
    category: "Software",
    bgColor: "bg-[#24292e]",
  },
];
