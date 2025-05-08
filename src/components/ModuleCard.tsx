import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../pages/ThemeContext";
import { motion } from "framer-motion";

interface ModuleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  linkTo?: string;
  className?: string;
}

const FeatureItem: React.FC<{ feature: string; index: number }> = ({
  feature,
  index,
}) => {
  const { isDarkMode } = useTheme();
  return (
    <li
      key={index}
      className={`flex items-center text-sm ${
        isDarkMode ? "text-gray-400" : "text-gray-600"
      }`}
    >
      <span className="w-2 h-2 bg-[#ff9404] rounded-full mr-2" />
      {feature}
    </li>
  );
};

const ModuleCard: React.FC<ModuleCardProps> = ({
  icon,
  title,
  description,
  features,
  linkTo = "/registro",
  className = "",
}) => {
  const { isDarkMode } = useTheme();

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
  };

  return (
    <div
      className={`rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full ${
        isDarkMode ? "bg-[#3B4252]" : "bg-white"
      } ${className}`}
    >
      <div
        className={`border rounded-lg w-16 h-16 flex items-center justify-center mb-4 ${
          isDarkMode ? "border-gray-600" : "border-gray-300"
        }`}
      >
        {icon}
      </div>
      <h3
        className={`text-xl font-semibold mb-2 ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
      >
        {title}
      </h3>
      <p className={`mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
        {description}
      </p>
      <ul className="space-y-2 flex-grow mb-6">
        {features.map((feature, index) => (
          <FeatureItem key={index} feature={feature} index={index} />
        ))}
      </ul>
      <motion.div variants={buttonVariants} whileHover="hover">
        <Link
          to={linkTo}
          className={`mt-auto block text-center font-semibold py-2 px-4 rounded-lg transition text-[#2a2e3f] ${
            isDarkMode
              ? "bg-[#FFFFFF] hover:bg-[#FF9500]"
              : "bg-[#FF9500] text-white hover:text-[#2a2e3f]"
          }`}
        >
          Comenzar
        </Link>
      </motion.div>
    </div>
  );
};

export default React.memo(ModuleCard);
