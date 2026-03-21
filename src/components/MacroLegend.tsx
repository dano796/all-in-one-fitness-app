import React from 'react';
import { useTheme } from "../pages/ThemeContext";

interface MacroLegendProps {
  size?: 'small' | 'medium' | 'large';
}

const MacroLegend: React.FC<MacroLegendProps> = ({
  size = 'medium'
}) => {
  const { isDarkMode } = useTheme();
  
  // Ajustar el tamaño basado en la prop size
  const legendSize = {
    small: { fontSize: 9, indicatorSize: 6 },
    medium: { fontSize: 12, indicatorSize: 8 },
    large: { fontSize: 14, indicatorSize: 10 },
  }[size];

  const colors = {
    protein: '#1E90FF',
    carbs: '#8884d8',
    fat: '#FF9404',
  };
  
  return (
    <div 
      className={`flex items-center justify-center py-1 px-2 rounded ${
        isDarkMode ? 'bg-#282c3c' : 'bg-#fffff'
      }`}
      style={{ fontSize: legendSize.fontSize }}
    >
      <span className={`px-2 ${isDarkMode ? 'text-white' : 'text-gray-700'}`} title="Proteína">
        <span 
          className="inline-block mr-1 rounded-full" 
          style={{ 
            width: legendSize.indicatorSize, 
            height: legendSize.indicatorSize, 
            backgroundColor: colors.protein 
          }}
        ></span>
       Proteína
      </span>
      <span className={`px-2 ${isDarkMode ? 'text-white' : 'text-gray-700'}`} title="Carbohidratos">
        <span 
          className="inline-block mr-1 rounded-full" 
          style={{ 
            width: legendSize.indicatorSize, 
            height: legendSize.indicatorSize, 
            backgroundColor: colors.carbs 
          }}
        ></span>
        Carbohidratos
      </span>
      <span className={`px-2 ${isDarkMode ? 'text-white' : 'text-gray-700'}`} title="Grasas">
        <span 
          className="inline-block mr-1 rounded-full" 
          style={{ 
            width: legendSize.indicatorSize, 
            height: legendSize.indicatorSize, 
            backgroundColor: colors.fat
          }}
        ></span>
        Grasas
      </span>
    </div>
  );
};

export default MacroLegend;
