import React from "react";
import { FaPlus } from "react-icons/fa";
import { useTheme } from "../pages/ThemeContext";
import NutrientChart from "./NutrientChart";

interface Food {
  food_id: string;
  food_name: string;
  food_description: string;
  fat_g?: number;
  carbs_g?: number;
  protein_g?: number;
  calories?: number;
}

interface FoodItemProps {
  food: Food;
  onSelect: (food: Food) => void;
  onNavigate: (food: Food) => void;
}

const FoodItem: React.FC<FoodItemProps> = ({ food, onSelect, onNavigate }) => {
  const { isDarkMode } = useTheme();
  
  // Extraer macronutrientes o usar valores por defecto
  const calories = food.calories || 0;
  const fat = food.fat_g || 0;
  const carbs = food.carbs_g || 0;
  const protein = food.protein_g || 0;
    // Ya no necesitamos verificar si hay datos, siempre mostraremos el gráfico
  
  return (
    <div
      key={food.food_id}
      className={`p-3 rounded-lg border ${isDarkMode ? 'border-gray-600 hover:bg-[#4B5563]' : 'border-gray-300 hover:bg-gray-200'} transition duration-200 flex items-center justify-between cursor-pointer`}
      onClick={() => onNavigate(food)}
    >
      <div className="flex-1">
        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{food.food_name}</p>
        <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{food.food_description}</p>
      </div>      {/* Mostrar siempre el gráfico de nutrientes, incluso si no hay datos */}
      <div className="flex-shrink-0 mr-3">
        <NutrientChart 
          calories={calories}
          fat={fat}
          carbs={carbs}
          protein={protein}
          size="small"
          showCaloriesOutside={true}
        />
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