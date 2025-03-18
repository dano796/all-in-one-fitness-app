import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const TIMEZONE = 'America/Bogota';
  const [date, setDate] = useState<string>(
    new Date().toLocaleDateString('en-CA', { timeZone: TIMEZONE })
  );

  const macroData = {
    datasets: [
      {
        data: [85, 92, 96], // Example percentages for Protein, Carbs, Fats
        backgroundColor: ['#3B82F6', '#8B5CF6', '#F59E0B'],
        borderWidth: 0,
        circumference: 270,
        rotation: 225,
      },
    ],
  };

  const weeklyData = {
    labels: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
    datasets: [
      {
        data: [2100, 1950, 1800, 2000, 1750, 1900, 2000],
        backgroundColor: '#ff9404',
        borderRadius: 4,
        barThickness: 20,
      },
    ],
  };

  const weightData = {
    labels: Array.from({ length: 30 }, (_, i) => `Día ${i + 1}`),
    datasets: [
      {
        data: Array.from({ length: 30 }, () => 75 + Math.random() * 2),
        borderColor: '#ff9404',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 2,
      },
    ],
  };

  const meals = [
    { id: 1, type: 'Desayuno', calories: 714, icon: '🍞' },
    { id: 2, type: 'Almuerzo', calories: 850, icon: '🍽️' },
    { id: 4, type: 'Merienda', calories: 123, icon: '🍎' },
    { id: 3, type: 'Cena', calories: 595, icon: '🍳' },
  ];

  const handleMealClick = (type: string) => {
    navigate(`/comidas?type=${type.toLowerCase()}&date=${date}`);
  };

  const handleAddFoodClick = (type: string) => {
    navigate(`/foodsearch?type=${type.toLowerCase()}&date=${date}`);
  };

  const handlePreviousDay = () => {
    const currentDate = new Date(date + 'T00:00:00');
    currentDate.setDate(currentDate.getDate() - 1);
    setDate(currentDate.toLocaleDateString('en-CA', { timeZone: TIMEZONE }));
  };

  const handleNextDay = () => {
    const currentDate = new Date(date + 'T00:00:00');
    currentDate.setDate(currentDate.getDate() + 1);
    setDate(currentDate.toLocaleDateString('en-CA', { timeZone: TIMEZONE }));
  };

  return (
    <div className="p-6 space-y-6 bg-[#282c3c] min-h-screen overflow-hidden">
      <style>
        {`
          html, body {
            -ms-overflow-style: none;
            scrollbar-width: none;
            overflow-y: hidden;
          }
          html::-webkit-scrollbar, body::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>

      {/* Date Navigation at the Top Center */}
      <div className="mb-6 text-center w-full max-w-2xl mx-auto">
        <div className="flex justify-center items-center space-x-4">
          <button
            onClick={handlePreviousDay}
            className="flex items-center py-2 px-4 bg-gradient-to-r from-[#ff9404] to-[#FF6B35] text-white font-semibold rounded-full shadow-md hover:shadow-lg hover:from-[#FF6B35] hover:to-[#ff9404] transition-all duration-300 transform hover:-translate-y-1 z-10"
          >
            <FaArrowLeft className="text-base" />
          </button>
        
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2 border border-gray-500 rounded-lg bg-[#1C2526] text-white focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
          />
          <button
            onClick={handleNextDay}
            className="flex items-center py-2 px-4 bg-gradient-to-r from-[#ff9404] to-[#FF6B35] text-white font-semibold rounded-full shadow-md hover:shadow-lg hover:from-[#FF6B35] hover:to-[#ff9404] transition-all duration-300 transform hover:-translate-y-1 z-10"
          >
            <FaArrowRight className="text-base" />
          </button>
        </div>
      </div>

      {/* Original Module Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#3B4252] rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">
              Ingesta Calórica dd/mm/aaaa
            </h2>
            <div className="flex space-x-2">
              <button className="hover:text-[#FF9500]">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button className="hover:text-[#FF9500]">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="h-48 relative mb-8">
            <Doughnut
              data={macroData}
              options={{
                cutout: '80%',
                plugins: {
                  legend: { display: false },
                },
              }}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm font-medium">Proteína</div>
              <div className="text-xs">0/174g</div>
            </div>
            <div>
              <div className="text-sm font-medium">Carbohidratos</div>
              <div className="text-xs">0/232g</div>
            </div>
            <div>
              <div className="text-sm font-medium">Grasas</div>
              <div className="text-xs">0/77g</div>
            </div>
          </div>
        </div>

        <div className="bg-[#3B4252] rounded-lg p-6 shadow-md">
          <h2 className="text-sm font-semibold mb-4">
            Ingesta Calórica - Semana
          </h2>
          <Bar
            data={weeklyData}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: { color: '#282c3c' },
                  ticks: { color: '#fff' },
                },
                x: {
                  grid: { display: false },
                  ticks: { color: '#fff' },
                },
              },
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          {meals.map((meal) => (
            <div
              key={meal.id}
              className="flex items-center justify-between p-3 bg-[#3B4252] rounded-lg cursor-pointer hover:bg-[#4B5563] transition duration-200"
              onClick={() => handleMealClick(meal.type)}
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{meal.icon}</span>
                <div>
                  <h3 className="text-sm font-semibold">{meal.type}</h3>
                  <p className="text-xs text-gray-400">0/{meal.calories} kcal</p>
                </div>
              </div>
              <button
                className="hover:text-[#FF9500]"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent the meal click event
                  handleAddFoodClick(meal.type);
                }}
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-[#3B4252] rounded-lg p-6 shadow-md">
          <h2 className="text-sm font-semibold mb-4">Peso - Mes</h2>
          <Line
            data={weightData}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                y: {
                  grid: { color: '#282c3c' },
                  ticks: { color: '#fff' },
                },
                x: {
                  grid: { display: false },
                  ticks: { color: '#fff' },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;