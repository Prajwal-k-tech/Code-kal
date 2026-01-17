import { Navbar } from "~~/components/Landing/Navbar";
import { HeroSection } from "~~/components/ui/hero-section-with-smooth-bg-shader";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <HeroSection />
    </div>
  );
};

export default Home;
