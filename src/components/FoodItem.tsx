import React from "react";
import { FaPlus } from "react-icons/fa";
import { useTheme } from "../pages/ThemeContext";

interface Food {
  food_id: string;
  food_name: string;
  food_description: string;
}

interface FoodItemProps {
  food: Food;
  onSelect: (food: Food) => void;
  onNavigate: (food: Food) => void;
}

const FoodItem: React.FC<FoodItemProps> = ({ food, onSelect, onNavigate }) => {
  const { isDarkMode } = useTheme();
  return (
    <div
      key={food.food_id}
      className={`p-3 rounded-lg border ${isDarkMode ? 'border-gray-600 hover:bg-[#4B5563]' : 'border-gray-300 hover:bg-gray-200'} transition duration-200 flex items-center justify-between cursor-pointer`}
      onClick={() => onNavigate(food)}
    >
      <div className="flex-1">
        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{food.food_name}</p>
        <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{food.food_description}</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect(food);
        }}
        className={`${isDarkMode ? 'text-gray-400 hover:text-[#FF6B35] active:text-[#ff9404]' : 'text-gray-600 hover:text-[#FF6B35] active:text-[#ff9404]'} transition-all duration-200 transform hover:scale-125 active:scale-95 ml-3`}
      >
        <FaPlus className="text-sm" />
      </button>
    </div>
  );
};

export default FoodItem;