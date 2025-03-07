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
  // Mock data for charts
  const macroData = {
    datasets: [
      {
        data: [85, 92, 96],
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
        backgroundColor: '#3B82F6',
        borderRadius: 4,
        barThickness: 20,
      },
    ],
  };

  const weightData = {
    labels: Array.from({ length: 30 }, (_, i) => `Aug ${i + 1}`),
    datasets: [
      {
        data: Array.from({ length: 30 }, () => 75 + Math.random() * 2),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 2,
      },
    ],
  };

  const meals = [
    { id: 1, type: 'Desayuno', calories: 714, icon: '🔍' },
    { id: 2, type: 'Almuerzo', calories: 850, icon: '🍽️' },
    { id: 3, type: 'Cena', calories: 595, icon: '🍳' },
    { id: 4, type: 'Snacks', calories: 123, icon: '🍎' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-100 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-600">
              Ingesta Calórica dd/mm/aaa
            </h2>
            <div className="flex space-x-2">
              <button className="text-gray-600">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button className="text-gray-600">
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
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm font-medium">Proteína</div>
              <div className="text-xs text-gray-500">0/174g</div>
            </div>
            <div>
              <div className="text-sm font-medium">Carbohidratos</div>
              <div className="text-xs text-gray-500">0/232g</div>
            </div>
            <div>
              <div className="text-sm font-medium">Grasas</div>
              <div className="text-xs text-gray-500">0/77g</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6">
          <h2 className="text-sm font-medium text-gray-600 mb-4">
            Ingesta Calórica - Semana
          </h2>
          <Bar
            data={weeklyData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: '#f3f4f6',
                  },
                  border: {
                    display: false,
                  },
                  ticks: {
                    display: false,
                  },
                },
                x: {
                  grid: {
                    display: false,
                  },
                  border: {
                    display: false,
                  },
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
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{meal.icon}</span>
                <div>
                  <h3 className="text-sm font-medium">{meal.type}</h3>
                  <p className="text-xs text-gray-500">0/{meal.calories} kcal</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <Plus className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg p-6">
          <h2 className="text-sm font-medium text-gray-600 mb-4">Peso - Mes</h2>
          <Line
            data={weightData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  grid: {
                    color: '#f3f4f6',
                  },
                  border: {
                    display: false,
                  },
                  ticks: {
                    display: false,
                  },
                },
                x: {
                  grid: {
                    display: false,
                  },
                  border: {
                    display: false,
                  },
                  ticks: {
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 6,
                  },
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