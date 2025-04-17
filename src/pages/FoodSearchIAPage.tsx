import React from "react";
import FoodSearchIA from "../components/FoodSearchIA";
import GalaxyBackground from "../components/GalaxyBackground";
import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";

const FoodSearchIAPage: React.FC = () => {
  return (
    <div className="relative z-0 min-h-screen w-full mt-4 sm:mt-0">
      <GalaxyBackground />
      <div className="ml-0 mr-2 mt-0 relative z-10">
        <Link to="/dashboard" className="inline-block">
          <button className="flex items-center py-2 px-4 mt-8 mx-4 bg-gradient-to-r from-[#ff9404] to-[#FF6B35] text-white font-semibold rounded-full shadow-md hover:shadow-lg hover:from-[#FF6B35] hover:to-[#ff9404] transition-all duration-300 hover:-translate-y-1 z-10">
            <FaArrowLeft className="mr-1 text-base" />
            Volver
          </button>
        </Link>
      </div>
      <div className="w-full px-4 py-8 md:py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <FoodSearchIA />
        </div>
      </div>
    </div>
  );
};

export default FoodSearchIAPage;
