import React from "react";
import { Link } from "react-router-dom";

interface ModuleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  icon,
  title,
  description,
  features,
}) => {
  return (
    <div className="bg-[#3B4252] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="border rounded-lg w-16 h-16 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-400 mb-4">{description}</p>
      <ul className="space-y-2 flex-grow mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-sm text-gray-400">
            <span className="w-2 h-2 bg-[#ff9404] rounded-full mr-2" />
            {feature}
          </li>
        ))}
      </ul>
      <Link
        to="/registro"
        className="mt-auto block text-center bg-[#FFFFFF] text-[#1C1C1E] font-semibold py-2 px-4 rounded-lg hover:bg-[#FF9500] transition"
      >
        Comenzar
      </Link>
    </div>
  );
};

export default ModuleCard;
