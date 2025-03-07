import React from 'react';
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
  // Datos de los gráficos con la nueva paleta de colores
  const macroData = {
    datasets: [
      {
        data: [85, 92, 96],
        backgroundColor: ['#FF3B30', '#FF9500', '#FFCC00'],
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
        backgroundColor: '#FF9500',
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
        borderColor: '#FF3B30',
        backgroundColor: 'rgba(255, 59, 48, 0.2)',
        tension: 0.4,
        fill: true,
        pointRadius: 2,
      },
    ],
  };

  const meals = [
    { id: 1, type: 'Desayuno', calories: 714, icon: '🍞' },
    { id: 2, type: 'Almuerzo', calories: 850, icon: '🍽️' },
    { id: 3, type: 'Cena', calories: 595, icon: '🍳' },
    { id: 4, type: 'Snacks', calories: 123, icon: '🍎' },
  ];

  return (
    <div className="p-6 space-y-6 bg-[#1C1C1E] min-h-screen text-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tarjeta de Ingesta Calórica */}
        <div className="bg-[#141414] rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#FF3B30]">
              Ingesta Calórica dd/mm/aaaa
            </h2>
            <div className="flex space-x-2">
              <button className="text-[#FF9500] hover:text-[#FFCC00]">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button className="text-[#FF9500] hover:text-[#FFCC00]">
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
          <div className="grid grid-cols-3 gap-4 text-center text-[#FFCC00]">
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

        {/* Tarjeta de Ingesta Semanal */}
        <div className="bg-[#141414] rounded-lg p-6 shadow-md">
          <h2 className="text-sm font-semibold text-[#FF3B30] mb-4">
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
                  grid: { color: '#333' },
                  ticks: { color: '#FFCC00' },
                },
                x: {
                  grid: { display: false },
                  ticks: { color: '#FFCC00' },
                },
              },
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de comidas */}
        <div className="space-y-2">
          {meals.map((meal) => (
            <div
              key={meal.id}
              className="flex items-center justify-between p-3 bg-[#2C2C2E] rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{meal.icon}</span>
                <div>
                  <h3 className="text-sm font-semibold text-[#FFCC00]">{meal.type}</h3>
                  <p className="text-xs text-gray-400">0/{meal.calories} kcal</p>
                </div>
              </div>
              <button className="text-[#FF9500] hover:text-[#FFCC00]">
                <Plus className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Gráfico de Peso */}
        <div className="bg-[#141414] rounded-lg p-6 shadow-md">
          <h2 className="text-sm font-semibold text-[#FF3B30] mb-4">Peso - Mes</h2>
          <Line
            data={weightData}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                y: {
                  grid: { color: '#333' },
                  ticks: { color: '#FFCC00' },
                },
                x: {
                  grid: { display: false },
                  ticks: { color: '#FFCC00' },
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
