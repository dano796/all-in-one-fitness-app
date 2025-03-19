import React, { useRef, useState, useEffect } from 'react';
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
import axios, { AxiosError } from 'axios';
import { supabase } from '../lib/supabaseClient';

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

// Interfaces para los datos de las comidas
interface RegisteredFood {
  id_comida: string;
  nombre_comida: string;
  descripcion: string;
  fecha: string;
  calorias: string | null;
  grasas: string | null;
  carbs: string | null;
  proteina: string | null;
  tipo: string;
  isEditable: boolean;
}

interface OrganizedFoods {
  Desayuno: RegisteredFood[];
  Almuerzo: RegisteredFood[];
  Merienda: RegisteredFood[];
  Cena: RegisteredFood[];
}

interface FoodsResponse {
  foods: OrganizedFoods;
  currentFoodType: keyof OrganizedFoods | null;
  isToday: boolean;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const TIMEZONE = 'America/Bogota';
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: TIMEZONE });
  const [date, setDate] = React.useState<string>(todayStr);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [foodsData, setFoodsData] = useState<FoodsResponse>({
    foods: { Desayuno: [], Almuerzo: [], Merienda: [], Cena: [] },
    currentFoodType: null,
    isToday: false,
  });
  const [error, setError] = useState<string | null>(null);

  // Verificar autenticación y obtener el email del usuario
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (error || !user) {
        setError('Debes iniciar sesión para ver el dashboard.');
      } else {
        setUserEmail(user.email || '');
      }
    };
    checkAuth();
  }, []);

  // Consultar las comidas registradas
  const fetchFoods = async () => {
    if (!userEmail || !date) return;
    try {
      const response = await axios.get<FoodsResponse>(
        'http://localhost:5000/api/foods/user',
        {
          params: { email: userEmail, date: date },
        }
      );
      setFoodsData(response.data);
      setError(null);
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setError(
        axiosError.response?.data?.error || 'Error al consultar las comidas registradas'
      );
    }
  };

  useEffect(() => {
    if (userEmail && date) fetchFoods();
  }, [userEmail, date]);

  // Calcular calorías por tipo de comida
  const calculateCaloriesByType = (type: keyof OrganizedFoods) => {
    const foods = foodsData.foods[type] || [];
    return foods.reduce((total, food) => {
      const calories = parseFloat(food.calorias || '0');
      return total + (isNaN(calories) ? 0 : calories);
    }, 0);
  };

  // Calcular valores totales para progressData
  const calculateTotalNutrition = () => {
    const allFoods = [
      ...foodsData.foods.Desayuno,
      ...foodsData.foods.Almuerzo,
      ...foodsData.foods.Merienda,
      ...foodsData.foods.Cena,
    ];

    const totalCalories = allFoods.reduce((total, food) => {
      const calories = parseFloat(food.calorias || '0');
      return total + (isNaN(calories) ? 0 : calories);
    }, 0);

    const totalCarbs = allFoods.reduce((total, food) => {
      const carbs = parseFloat(food.carbs || '0');
      return total + (isNaN(carbs) ? 0 : carbs);
    }, 0);

    const totalProtein = allFoods.reduce((total, food) => {
      const protein = parseFloat(food.proteina || '0');
      return total + (isNaN(protein) ? 0 : protein);
    }, 0);

    const totalFat = allFoods.reduce((total, food) => {
      const fat = parseFloat(food.grasas || '0');
      return total + (isNaN(fat) ? 0 : fat);
    }, 0);

    return {
      totalCalories,
      totalCarbs: Math.floor(totalCarbs), // Redondeamos a entero
      totalProtein: Math.floor(totalProtein), // Redondeamos a entero
      totalFat: Math.floor(totalFat), // Redondeamos a entero
    };
  };

  // Valores calculados
  const totalCaloriesGoal = 2381; // Este valor podría venir del backend o ser configurable
  const { totalCalories, totalCarbs, totalProtein, totalFat } = calculateTotalNutrition();
  const consumedCalories = totalCalories;
  const burnedCalories = 0; // Este valor podría venir del backend si se implementa
  const remainingCalories = totalCaloriesGoal - consumedCalories;

  // Datos para el gráfico de calorías
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

  // Datos para las barras de progreso
  const progressData = [
    { name: 'Carbs', value: totalCarbs, max: 232 },
    { name: 'Protein', value: totalProtein, max: 174 },
    { name: 'Fat', value: totalFat, max: 77 },
  ];

  // Calorías por tipo de comida con límites específicos
  const mealCalorieLimits = {
    Desayuno: 714,
    Almuerzo: 953,
    Merienda: 119,
    Cena: 595,
  };

  const meals = [
    {
      id: 1,
      type: 'Desayuno',
      calories: calculateCaloriesByType('Desayuno'),
      maxCalories: mealCalorieLimits.Desayuno,
      icon: '🍞',
    },
    {
      id: 2,
      type: 'Almuerzo',
      calories: calculateCaloriesByType('Almuerzo'),
      maxCalories: mealCalorieLimits.Almuerzo,
      icon: '🍽️',
    },
    {
      id: 3,
      type: 'Cena',
      calories: calculateCaloriesByType('Cena'),
      maxCalories: mealCalorieLimits.Cena,
      icon: '🍳',
    },
    {
      id: 4,
      type: 'Merienda',
      calories: calculateCaloriesByType('Merienda'),
      maxCalories: mealCalorieLimits.Merienda,
      icon: '🍎',
    },
  ];

  const handleMealClick = (type: string) => {
    navigate(`/comidas?type=${type.toLowerCase()}&date=${date}`);
  };

  const handleAddFoodClick = (type: string) => {
    // Pasamos un estado adicional para indicar que la navegación proviene del botón +
    navigate(`/foodsearch?type=${type.toLowerCase()}&date=${date}`, {
      state: { fromAddButton: true },
    });
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
        <div className="relative flex justify-center mb-8 -mt-7">
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
                  <p className="text-xs text-gray-400">
                    {meal.calories}/{meal.maxCalories} kcal
                  </p>
                </div>
              </div>
              {/* Mostrar el botón de agregar solo si es "hoy" */}
              {foodsData.isToday && (
                <button
                  className="add-food-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddFoodClick(meal.type);
                  }}
                >
                  <Plus className="h-4 w-4 text-white" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;