import React from "react";
import { FaPlus } from "react-icons/fa";

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

const FoodItem: React.FC<FoodItemProps> = ({ food, onSelect, onNavigate }) => (
  <div
    key={food.food_id}
    className="p-3 rounded-lg border border-gray-600 hover:bg-[#4B5563] transition duration-200 flex items-center justify-between cursor-pointer"
    onClick={() => onNavigate(food)}
  >
    <div className="flex-1">
      <p className="text-sm font-medium text-white">{food.food_name}</p>
      <p className="text-xs text-gray-300">{food.food_description}</p>
    </div>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onSelect(food);
      }}
      className="text-gray-400 hover:text-[#FF6B35] active:text-[#ff9404] transition-all duration-200 transform hover:scale-125 active:scale-95 ml-3"
    >
      <FaPlus className="text-sm" />
    </button>
  </div>
);

export default FoodItem;