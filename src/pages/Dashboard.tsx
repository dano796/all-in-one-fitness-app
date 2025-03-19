import React, { useRef } from 'react';
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
import { Plus } from 'lucide-react';
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

// Función para obtener el número de semana
const getWeekNumber = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00');
  const oneJan = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + oneJan.getDay() + 1) / 7);
  return weekNumber;
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const TIMEZONE = 'America/Bogota';
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: TIMEZONE });
  const [date, setDate] = React.useState<string>(todayStr);
  const dateInputRef = useRef<HTMLInputElement>(null);

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

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
  };

  const openDatePicker = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };

  const getDateLabel = () => {
    const selectedDate = new Date(date + 'T00:00:00');
    const today = new Date(todayStr + 'T00:00:00');
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (selectedDate.getTime() === today.getTime()) return 'Today';
    if (selectedDate.getTime() === yesterday.getTime()) return 'Yesterday';
    return selectedDate.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getWeek = () => {
    return getWeekNumber(date);
  };

  return (
    <div className="p-4 space-y-6 bg-[#282c3c] min-h-screen overflow-hidden">
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
          .date-button {
            min-width: 120px;
            transition: all 0.3s ease;
          }
          .hidden-date-input {
            position: absolute;
            opacity: 0;
            width: 0;
            height: 0;
          }
          .summary-section {
            max-width: 700px; /* Ancho del resumen */
            margin: 0 auto;
            background: #3B4252;
            border-radius: 8px;
            padding: 20px;
          }
          .nutrition-section {
            max-width: 700px; /* Mismo ancho que el resumen */
            margin: 0 auto;
          }
          .meal-item {
            max-width: 100%; /* Ocupa todo el ancho del contenedor padre (nutrition-section) */
            background: #3B4252;
            border-radius: 8px;
            padding: 10px;
          }
          .add-food-button {
            background: none;
            padding: 2px;
            transition: transform 0.2s ease;
          }
          .add-food-button:hover {
            transform: scale(1.2);
          }
          @media (max-width: 640px) {
            .date-button {
              font-size: 0.875rem;
              padding: 0.5rem 1rem;
              min-width: 100px;
            }
            .summary-section {
              max-width: 90%;
            }
            .nutrition-section {
              max-width: 90%;
            }
            .meal-item {
              max-width: 100%;
            }
          }
          @media (min-width: 641px) {
            .date-button {
              font-size: 1rem;
              padding: 0.75rem 1.5rem;
            }
          }
        `}
      </style>

      {/* Date Navigation at the Top */}
      <div className="mb-6 text-center">
        <div className="mb-2 text-xs text-gray-400">Week {getWeek()}</div>
        <div>
          <button
            onClick={openDatePicker}
            className="px-6 py-2 bg-[#3B4252] text-white font-semibold rounded-lg date-button"
          >
            {getDateLabel()}
          </button>
          <input
            type="date"
            ref={dateInputRef}
            value={date}
            onChange={handleDateChange}
            max={todayStr}
            className="hidden-date-input"
          />
        </div>
      </div>

      {/* Summary Section */}
      <div className="summary-section">
        <h2 className="text-sm font-semibold mb-4">Resumen</h2>
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
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold">624</div>
              <div className="text-xs text-gray-400">Consumidas</div>
              <div className="text-2xl font-bold">1,757</div>
              <div className="text-xs text-gray-400">Restantes</div>
              <div className="text-2xl font-bold">0</div>
              <div className="text-xs text-gray-400">Quemadas</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs">Carbohidratos</div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-[#3B82F6] h-2 rounded-full" style={{ width: '50%' }}></div>
            </div>
            <div className="text-xs">51/232g</div>
          </div>
          <div>
            <div className="text-xs">Proteína</div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-[#3B82F6] h-2 rounded-full" style={{ width: '20%' }}></div>
            </div>
            <div className="text-xs">34/174g</div>
          </div>
          <div>
            <div className="text-xs">Grasas</div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-[#3B82F6] h-2 rounded-full" style={{ width: '36%' }}></div>
            </div>
            <div className="text-xs">28/77g</div>
          </div>
        </div>
      </div>

      {/* Nutrition Section */}
      <div className="nutrition-section mt-6">
        <h2 className="text-sm font-semibold mb-4">Nutrición</h2>
        <div className="space-y-2">
          {meals.map((meal) => (
            <div
              key={meal.id}
              className="meal-item flex items-center justify-between cursor-pointer hover:bg-[#4B5563] transition duration-200"
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
                className="add-food-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddFoodClick(meal.type);
                }}
              >
                <Plus className="h-4 w-4 text-white" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Optional Weekly and Weight Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 hidden">
        <div className="bg-[#3B4252] rounded-lg p-6 shadow-md">
          <h2 className="text-sm font-semibold mb-4">Ingesta Calórica - Semana</h2>
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