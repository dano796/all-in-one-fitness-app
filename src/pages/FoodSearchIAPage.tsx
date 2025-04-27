import React from "react";
import FoodSearchIA from "../components/FoodSearchIA";
import GalaxyBackground from "../components/GalaxyBackground";
import { FaArrowLeft } from "react-icons/fa";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

const FoodSearchIAPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const foodType = searchParams.get("type") || "desayuno";
  const date =
    searchParams.get("date") ||
    new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });

  return (
    <div className="relative min-h-screen w-full bg-[#282c3c] overflow-hidden">
      <div className="absolute inset-0 z-0">
        <GalaxyBackground />
      </div>

      <div className="relative z-10 p-4 sm:p-6 space-y-4 sm:space-y-6">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="flex items-center"
        >
          <Link to="/dashboard" className="inline-block">
            <button className="flex items-center py-2 px-4 mt-4 sm:mt-6 mx-4 sm:mx-6 bg-gradient-to-r from-[#ff9404] to-[#FF6B35] text-white font-semibold rounded-full shadow-md hover:shadow-lg hover:from-[#FF6B35] hover:to-[#ff9404] transition-all duration-300 hover:-translate-y-1">
              <FaArrowLeft className="mr-2 text-base sm:text-lg" />
              Volver
            </button>
          </Link>
        </motion.div>

        <div className="w-full px-4 py-4 sm:py-6">
          <div className="max-w-4xl mx-auto">
            <FoodSearchIA initialType={foodType} date={date} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodSearchIAPage;
