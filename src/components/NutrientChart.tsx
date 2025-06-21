import React from 'react';
import { useTheme } from "../pages/ThemeContext";

interface NutrientChartProps {
  calories: number;
  fat: number;
  carbs: number;
  protein: number;
  size?: 'small' | 'medium' | 'large';
  showLegend?: boolean;
  showCaloriesOutside?: boolean;
}

const NutrientChart: React.FC<NutrientChartProps> = ({ 
  calories, 
  fat, 
  carbs, 
  protein,
  size = 'medium',
  showLegend = false,
  showCaloriesOutside = false
}) => {
  const { isDarkMode } = useTheme();
  
  // Calcular porcentajes basados en el total de macros (sin considerar calorías)
  const totalMacros = fat + carbs + protein;
  const fatPercentage = totalMacros > 0 ? Math.round((fat / totalMacros) * 100) : 33;
  const carbsPercentage = totalMacros > 0 ? Math.round((carbs / totalMacros) * 100) : 33;
  const proteinPercentage = totalMacros > 0 ? Math.round((protein / totalMacros) * 100) : 34;
  
  // Ajustar el tamaño basado en la prop size
  const chartSize = {
    small: { circleSize: 38, fontSize: 10, thickness: 3 },
    medium: { circleSize: 60, fontSize: 14, thickness: 5 },
    large: { circleSize: 80, fontSize: 18, thickness: 6 },
  }[size];

  // Colores para cada macronutriente
  const colors = {
    fat: '#FF9404', // naranja
    carbs: '#8884d8', // morado
    protein: '#1E90FF', // azul
    calories: '#49b93c' // verde
  };
  
  // Para simplificar, creemos un arreglo con los datos para el gráfico de pastel
  const segments = [
    { color: colors.protein, percentage: proteinPercentage },
    { color: colors.carbs, percentage: carbsPercentage },
    { color: colors.fat, percentage: fatPercentage }
  ];
  
  // Calculamos el ángulo de inicio para cada segmento
  let currentAngle = 0;
  
  return (
    <div className="flex items-center">
      {/* Calorías a la izquierda si showCaloriesOutside es true */}
      {showCaloriesOutside && (
        <div className="mr-2 text-right">
          <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`} style={{ fontSize: chartSize.fontSize }}>
            {calories}
          </span>
          <span className={`ml-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`} style={{ fontSize: chartSize.fontSize * 0.7 }}>
            cal
          </span>
        </div>
      )}
      
      {/* Contenedor del gráfico circular */}
      <div className="relative" style={{ width: chartSize.circleSize, height: chartSize.circleSize }}>
        <svg width={chartSize.circleSize} height={chartSize.circleSize} viewBox="0 0 100 100">
          {/* Círculo de fondo */}
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke={isDarkMode ? '#3B4252' : '#E2E8F0'}
            strokeWidth="4"
          />
          
          {/* Gráfico circular usando segmentos con arcos SVG */}
          {segments.map((segment, index) => {
            // Calcular ángulos en radianes
            const startAngle = currentAngle;
            const angleSize = (segment.percentage / 100) * 2 * Math.PI;
            currentAngle += angleSize;
            
            // Convertir a coordenadas X,Y para los puntos de inicio y fin del arco
            const startX = 50 + 46 * Math.cos(startAngle - Math.PI/2);
            const startY = 50 + 46 * Math.sin(startAngle - Math.PI/2);
            const endX = 50 + 46 * Math.cos(startAngle + angleSize - Math.PI/2);
            const endY = 50 + 46 * Math.sin(startAngle + angleSize - Math.PI/2);
            
            // Determinar si el arco es mayor o menor a 180 grados (para el 'large-arc-flag')
            const largeArcFlag = angleSize > Math.PI ? 1 : 0;
            
            return (
              <path
                key={index}
                d={`M 50 50 L ${startX} ${startY} A 46 46 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                fill={segment.color}
                stroke="none"
              />
            );
          })}
          
          {/* Círculo central (hueco) */}
          <circle
            cx="50"
            cy="50"
            r="30"
            fill={isDarkMode ? '#3B4252' : 'white'}
            stroke="none"
          />
        </svg>
        
        {/* Calorías en el centro si showCaloriesOutside es false */}
        {!showCaloriesOutside && (
          <div 
            className="absolute inset-0 flex items-center justify-center flex-col"
            style={{ fontSize: chartSize.fontSize }}
          >
            <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {calories}
            </div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`} style={{ fontSize: chartSize.fontSize * 0.7 }}>
              cal
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NutrientChart;
