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
import { Doughnut } from 'react-chartjs-2';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

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

// Function to get the week number
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

  // Data for the calories circle
  const totalCaloriesGoal = 2381;
  const consumedCalories = 624;
  const burnedCalories = 0;
  const remainingCalories = totalCaloriesGoal - consumedCalories;
  const caloriesData = {
    datasets: [
      {
        data: [consumedCalories, remainingCalories],
        backgroundColor: ['#ff9404', '#4B5563'],
        borderWidth: 5,
        borderColor: '#3B4252',
        circumference: 240,
        rotation: 240,
      },
    ],
  };

  // Data for the progress bars
  const progressData = [
    { name: 'Carbs', value: 51, max: 232 },
    { name: 'Protein', value: 34, max: 174 },
    { name: 'Fat', value: 28, max: 77 },
  ];

  const meals = [
    { id: 1, type: 'Desayuno', calories: 714, icon: '🍞' },
    { id: 2, type: 'Almuerzo', calories: 850, icon: '🍽️' },
    { id: 3, type: 'Cena', calories: 595, icon: '🍳' },
    { id: 4, type: 'Merienda', calories: 123, icon: '🍎' },
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

  const handleDatePicker = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };

  const getDateLabel = () => {
    const selectedDate = new Date(date + 'T00:00:00');
    const today = new Date(todayStr + 'T00:00:00');
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (selectedDate.getTime() === today.getTime()) return 'Hoy';
    if (selectedDate.getTime() === yesterday.getTime()) return 'Ayer';
    return selectedDate.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getWeek = () => {
    return getWeekNumber(date);
  };

  return (
    <div className="p-4 space-y-6 bg-[#282c3c] min-h-screen overflow-auto -mt-12">
      <style>
        {`
          html, body {
            -ms-overflow-style: none;
            scrollbar-width: none;
            overflow-y: auto;
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
            max-width: 700px;
            margin: 0 auto;
            background: #3B4252;
            border-radius: 8px;
            padding: 20px;
          }
          .nutrition-section {
            max-width: 700px;
            margin: 0 auto;
          }
          .meal-item {
            max-width: 100%;
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
          .progress-bar .bg-primary {
            background-color: #ff9404 !important;
            border-radius: 9999px;
          }
          .progress-bar {
            background-color: #4B5563 !important;
            border-radius: 9999px;
          }
          .circle-container {
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .eaten-label {
            position: absolute;
            left: -120px;
            top: 50%;
            transform: translateY(-50%);
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .burned-label {
            position: absolute;
            right: -120px;
            top: 50%;
            transform: translateY(-50%);
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .remaining-label {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          @media (max-width: 640px) {
            .date-button {
              font-size: 0.875rem;
              padding: 0.5rem 1rem;
              min-width: 100px;
            }
            .summary-section {
              max-width: 100%;
              padding: 15px;
            }
            .nutrition-section {
              max-width: 100%;
            }
            .meal-item {
              max-width: 100%;
            }
            .circle-container {
              width: 100%;
              height: 100%;
            }
            .eaten-label {
              left: -70px;
              font-size: 0.875rem;
            }
            .burned-label {
              right: -70px;
              font-size: 0.875rem;
            }
            .remaining-label {
              font-size: 1.25rem;
            }
            .progress-bar {
              height: 6px;
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
        <div className="mb-2 text-xs text-gray-400">Semana {getWeek()}</div>
        <div>
          <button
            onClick={handleDatePicker}
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
        <div className="relative flex justify-center mb-8 -mt-7"> {/* Added -mt-2 to move the circle up */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56">
            <Doughnut
              data={caloriesData}
              options={{
                cutout: '85%',
                plugins: {
                  legend: { display: false },
                },
                maintainAspectRatio: true,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center mt-4">
              <div className="circle-container">
                <div className="eaten-label">
                  <div className="text-lg font-bold sm:text-xl">{consumedCalories}</div>
                  <div className="text-xs text-gray-400">Consumido</div>
                </div>
                <div className="remaining-label">
                  <div className="text-2xl font-bold sm:text-3xl">{remainingCalories}</div>
                  <div className="text-xs text-gray-400">Restante</div>
                </div>
                <div className="burned-label">
                  <div className="text-lg font-bold sm:text-xl">{burnedCalories}</div>
                  <div className="text-xs text-gray-400">Quemado</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {progressData.map((item) => (
            <div key={item.name} className="text-center">
              <div className="text-xs text-gray-400 mb-1">{item.name}</div>
              <Progress
                value={(item.value / item.max) * 100}
                className="w-full h-2 progress-bar"
              />
              <div className="text-xs text-gray-400 mt-1">
                {item.value}/{item.max} g
              </div>
            </div>
          ))}
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
    </div>
  );
};

export default Dashboard;