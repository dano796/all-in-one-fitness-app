import React from "react";
import { Link } from "react-router-dom";

interface ModuleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
}

const ModuleCard: React.FC<ModuleCardProps> = ({ icon, title, description, features }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="bg-gray-50 rounded-lg w-16 h-16 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-sm text-gray-600">
            <span className="w-1.5 h-1.5 bg-black rounded-full mr-2" />
            {feature}
          </li>
        ))}
      </ul>
      <Link to="/registro" className="mt-6 block text-center btn btn-primary w-full">
        Comenzar
      </Link>
    </div>
  );
};

export default ModuleCard;
