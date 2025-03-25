import React, { useRef, useState, useEffect } from "react";
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
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import axios, { AxiosError } from "axios";
import { supabase } from "../lib/supabaseClient";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import GalaxyBackground from "../components/GalaxyBackground";

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

const getWeekNumber = (dateStr: string) => {
  const date = new Date(dateStr + "T00:00:00");
  const oneJan = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor(
    (date.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000)
  );
  const weekNumber = Math.ceil((days + oneJan.getDay() + 1) / 7);
  return weekNumber;
};

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
  const TIMEZONE = "America/Bogota";
  const todayStr = new Date().toLocaleDateString("en-CA", {
    timeZone: TIMEZONE,
  });
  const [date, setDate] = React.useState<string>(todayStr);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [foodsData, setFoodsData] = useState<FoodsResponse>({
    foods: { Desayuno: [], Almuerzo: [], Merienda: [], Cena: [] },
    currentFoodType: null,
    isToday: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [totalCaloriesGoal, setTotalCaloriesGoal] = useState<number | null>(null);
  const [customCalorieGoal, setCustomCalorieGoal] = useState<string>("");
  const [calorieGoalError, setCalorieGoalError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        setError("Debes iniciar sesión para ver el dashboard.");
        navigate("/login");
      } else {
        const email = user.email || "";
        setUserEmail(email);
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/get-calorie-goal`,
            { params: { email } }
          );
          if (response.data.calorieGoal) {
            setTotalCaloriesGoal(response.data.calorieGoal);
          }
        } catch (err) {
          console.log(err);
          setError("Error al obtener el límite de calorías.");
        }
      }
    };
    checkAuth();
  }, [navigate]);

  const fetchFoods = async () => {
    if (!userEmail || !date) return;
    try {
      const response = await axios.get<FoodsResponse>(
        `${import.meta.env.VITE_BACKEND_URL}/api/foods/user`,
        { params: { email: userEmail, date: date } }
      );
      setFoodsData(response.data);
      setError(null);
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setError(
        axiosError.response?.data?.error || "Error al consultar las comidas registradas"
      );
    }
  };

  useEffect(() => {
    if (userEmail && date) fetchFoods();
  }, [userEmail, date]);

  const handleSetCustomCalorieGoal = async () => {
    const goal = parseInt(customCalorieGoal, 10);
    const inputElement = document.getElementById("customCalorieGoal");
    if (isNaN(goal) || goal < 2000) {
      setCalorieGoalError("El límite de calorías debe ser un número mayor o igual a 2000.");
      inputElement?.classList.add("error");
      return;
    }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/set-calorie-goal`,
        { email: userEmail, calorieGoal: goal }
      );
      if (response.data.success) {
        setTotalCaloriesGoal(goal);
        setCustomCalorieGoal("");
        setCalorieGoalError(null);
        inputElement?.classList.remove("error");
      } else {
        setCalorieGoalError(response.data.error || "Error al establecer el límite de calorías.");
        inputElement?.classList.add("error");
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setCalorieGoalError(
        axiosError.response?.data?.error || "Error al conectar con el servidor. Intenta de nuevo."
      );
      inputElement?.classList.add("error");
    }
  };

  const handleRemoveCalorieGoal = async () => {
    const result = await Swal.fire({
      title: "Seguro de que quiere eliminar su límite?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff9404",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí",
      cancelButtonText: "No",
      customClass: {
        container: "dashboard-swal-container",
        popup: "dashboard-swal-popup",
        icon: "dashboard-swal-icon",
        title: "dashboard-swal-title",
        htmlContainer: "dashboard-swal-text",
        confirmButton: "dashboard-swal-confirm-button",
        cancelButton: "dashboard-swal-cancel-button",
      },
    });
    if (result.isConfirmed) {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/set-calorie-goal`,
          { email: userEmail, calorieGoal: 0 }
        );
        if (response.data.success) {
          setTotalCaloriesGoal(null);
          setCalorieGoalError(null);
          Swal.fire({
            title: "Límite eliminado",
            text: "El límite de calorías ha sido eliminado exitosamente.",
            icon: "success",
            confirmButtonColor: "#ff9404",
            customClass: {
              container: "dashboard-swal-container",
              popup: "dashboard-swal-popup",
              icon: "dashboard-swal-icon",
              title: "dashboard-swal-title",
              htmlContainer: "dashboard-swal-text",
              confirmButton: "dashboard-swal-confirm-button",
            },
          });
        } else {
          setCalorieGoalError(response.data.error || "Error al eliminar el límite de calorías.");
        }
      } catch (err) {
        const axiosError = err as AxiosError<{ error?: string }>;
        setCalorieGoalError(
          axiosError.response?.data?.error || "Error al conectar con el servidor. Intenta de nuevo."
        );
      }
    }
  };

  const calculateCaloriesByType = (type: keyof OrganizedFoods) => {
    const foods = foodsData.foods[type] || [];
    return foods.reduce((total, food) => {
      const calories = parseFloat(food.calorias || "0");
      return total + (isNaN(calories) ? 0 : calories);
    }, 0);
  };

  const calculateTotalNutrition = () => {
    const allFoods = [
      ...foodsData.foods.Desayuno,
      ...foodsData.foods.Almuerzo,
      ...foodsData.foods.Merienda,
      ...foodsData.foods.Cena,
    ];
    const totalCalories = allFoods.reduce((total, food) => {
      const calories = parseFloat(food.calorias || "0");
      return total + (isNaN(calories) ? 0 : calories);
    }, 0);
    const totalCarbs = allFoods.reduce((total, food) => {
      const carbs = parseFloat(food.carbs || "0");
      return total + (isNaN(carbs) ? 0 : carbs);
    }, 0);
    const totalProtein = allFoods.reduce((total, food) => {
      const protein = parseFloat(food.proteina || "0");
      return total + (isNaN(protein) ? 0 : protein);
    }, 0);
    const totalFat = allFoods.reduce((total, food) => {
      const fat = parseFloat(food.grasas || "0");
      return total + (isNaN(fat) ? 0 : fat);
    }, 0);
    return {
      totalCalories,
      totalCarbs: Math.floor(totalCarbs),
      totalProtein: Math.floor(totalProtein),
      totalFat: Math.floor(totalFat),
    };
  };

  const { totalCalories, totalCarbs, totalProtein, totalFat } = calculateTotalNutrition();
  const consumedCalories = totalCalories;
  const burnedCalories = 0;
  const remainingCalories = totalCaloriesGoal ? totalCaloriesGoal - consumedCalories : 0;

  const mealCalorieLimits = totalCaloriesGoal
    ? {
        Desayuno: Math.round(totalCaloriesGoal * 0.3),
        Almuerzo: Math.round(totalCaloriesGoal * 0.4),
        Merienda: Math.round(totalCaloriesGoal * 0.05),
        Cena: Math.round(totalCaloriesGoal * 0.25),
      }
    : { Desayuno: 0, Almuerzo: 0, Merienda: 0, Cena: 0 };

  const carbGoal = totalCaloriesGoal ? Math.round((totalCaloriesGoal * 0.4) / 4) : 0;
  const proteinGoal = totalCaloriesGoal ? Math.round((totalCaloriesGoal * 0.3) / 4) : 0;
  const fatGoal = totalCaloriesGoal ? Math.round((totalCaloriesGoal * 0.3) / 9) : 0;

  const caloriesData = {
    datasets: [
      {
        data: [Math.min(consumedCalories, totalCaloriesGoal || consumedCalories), remainingCalories > 0 ? remainingCalories : 0],
        backgroundColor: ["#ff9404", "#4B5563"],
        borderWidth: 5,
        borderColor: "#3B4252",
        circumference: 240,
        rotation: 240,
      },
    ],
  };

  const progressData = [
    { name: "Carbohidratos", value: totalCarbs, max: carbGoal },
    { name: "Proteínas", value: totalProtein, max: proteinGoal },
    { name: "Grasas", value: totalFat, max: fatGoal },
  ];

  const meals = [
    { id: 1, type: "Desayuno", calories: calculateCaloriesByType("Desayuno"), maxCalories: mealCalorieLimits.Desayuno, icon: "🍞" },
    { id: 2, type: "Almuerzo", calories: calculateCaloriesByType("Almuerzo"), maxCalories: mealCalorieLimits.Almuerzo, icon: "🍽️" },
    { id: 3, type: "Cena", calories: calculateCaloriesByType("Cena"), maxCalories: mealCalorieLimits.Cena, icon: "🍳" },
    { id: 4, type: "Merienda", calories: calculateCaloriesByType("Merienda"), maxCalories: mealCalorieLimits.Merienda, icon: "🍎" },
  ];

  const handleMealClick = (type: string) => {
    navigate(`/comidas?type=${type.toLowerCase()}&date=${date}`);
  };

  const handleAddFoodClick = (type: string) => {
    navigate(`/foodsearch?type=${type.toLowerCase()}&date=${date}`, { state: { fromAddButton: true } });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
  };

  const handleDatePicker = () => {
    if (dateInputRef.current) {
      dateInputRef.current.focus(); // Ensure focus for mobile
      dateInputRef.current.showPicker(); // Trigger native picker
    }
  };

  const getDateLabel = () => {
    const selectedDate = new Date(date + "T00:00:00");
    const today = new Date(todayStr + "T00:00:00");
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (selectedDate.getTime() === today.getTime()) return "Hoy";
    if (selectedDate.getTime() === yesterday.getTime()) return "Ayer";
    return selectedDate.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const getWeek = () => {
    return getWeekNumber(date);
  };

  return (
    <div className="relative p-4 space-y-6 bg-[#282c3c] min-h-screen overflow-hidden -mt-12">
      <GalaxyBackground />

      <motion.div 
        initial={{ opacity: 0, y: -50 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 1.2, ease: "easeOut" }} 
        className="mb-6 text-center"
      >
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.4, duration: 0.8 }} 
          className="mb-2 text-xs text-gray-400"
        >
          Semana {getWeek()}
        </motion.div>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <button 
            onClick={handleDatePicker} 
            className="min-w-[120px] px-6 py-3 bg-gradient-to-br from-[#2D3242] to-[#3B4252] text-gray-200 font-semibold rounded-lg border border-[#ff9404] shadow-[0_0_10px_rgba(255,148,4,0.3)] hover:bg-gradient-to-br hover:from-[#3B4252] hover:to-[#4B5563] hover:shadow-[0_0_15px_rgba(255,148,4,0.5)] hover:scale-105 active:scale-95 transition-all duration-300"
          >
            {getDateLabel()}
          </button>
          <input
            type="date"
            ref={dateInputRef}
            value={date}
            onChange={handleDateChange}
            max={todayStr}
            className="absolute opacity-0 w-0 h-0 pointer-events-none"
          />
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 50 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 1.2, ease: "easeOut" }} 
        className="max-w-[700px] mx-auto bg-[#3B4252] rounded-lg p-5 relative z-10"
      >
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.4, duration: 0.8 }} 
          className="flex justify-between items-center mb-4"
        >
          <h2 className="text-sm font-semibold text-white">Resumen</h2>
          {totalCaloriesGoal ? (
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.6 }} 
              onClick={handleRemoveCalorieGoal} 
              className="text-sm text-white cursor-pointer hover:text-[#ff4444] transition-colors duration-300"
            >
              Eliminar límite
            </motion.p>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.6 }} 
              className="flex items-center gap-2"
            >
              <input 
                type="number" 
                id="customCalorieGoal" 
                value={customCalorieGoal} 
                onChange={(e) => setCustomCalorieGoal(e.target.value)} 
                className="w-[70px] p-1.5 text-sm border border-gray-500 rounded-md bg-[#2D3242] text-gray-200 text-center focus:outline-none focus:border-[#ff9404] focus:ring-2 focus:ring-[#ff9404]/20 focus:bg-[#2D3242] focus:scale-102 transition-all duration-300 placeholder:text-gray-500 [.error&]:border-[#ff4444] [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                placeholder="2000+"
              />
              <button 
                onClick={handleSetCustomCalorieGoal} 
                className="px-3 py-1.5 text-sm bg-gradient-to-br from-[#ff9404] to-[#e08503] text-white border-none rounded-md shadow-[0_0_10px_rgba(255,148,4,0.3)] hover:bg-gradient-to-br hover:from-[#e08503] hover:to-[#ff9404] hover:shadow-[0_0_15px_rgba(255,148,4,0.5)] hover:scale-110 active:scale-95 transition-all duration-300"
              >
                Agregar
              </button>
              <p className="text-sm text-gray-400">o</p>
              <p 
                onClick={() => navigate("/calorie-calculator")} 
                className="text-sm text-[#ff9404] cursor-pointer hover:text-[#e08503] hover:shadow-[0_0_10px_rgba(255,148,4,0.5)] transition-all duration-300"
              >
                Ir a la calculadora
              </p>
            </motion.div>
          )}
        </motion.div>
        
        {error && (
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.6 }} 
            className="text-red-400 mb-4 text-center"
          >
            {error}
          </motion.p>
        )}
        {calorieGoalError && (
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.6 }} 
            className="text-red-400 mb-4 text-center text-xs"
          >
            {calorieGoalError}
          </motion.p>
        )}

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.8 }} 
          className="relative flex justify-center mb-8"
        >
          <div className="relative w-48 h-48 sm:w-56 sm:h-56">
            <Doughnut 
              data={caloriesData} 
              options={{ cutout: "85%", plugins: { legend: { display: false } }, maintainAspectRatio: true }} 
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full flex items-center justify-center">
                <motion.div 
                  initial={{ opacity: 0, x: -30 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: 1.0, duration: 0.8 }} 
                  className="absolute -left-[135px] top-1/2 -translate-y-1/2 text-center flex flex-col items-center"
                >
                  <div className="text-lg font-bold sm:text-xl">{consumedCalories}</div>
                  <div className="text-xs text-gray-400">Consumido</div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  transition={{ delay: 1.2, duration: 0.8 }} 
                  className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 text-center flex flex-col items-center w-20"
                >
                  <div className="text-3xl font-bold leading-none min-w-[60px] text-center">{remainingCalories > 0 ? remainingCalories : 0}</div>
                  <div className="text-xs text-gray-500 leading-none">Restante</div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: 1.0, duration: 0.8 }} 
                  className="absolute -right-[135px] top-1/2 -translate-y-1/2 text-center flex flex-col items-center"
                >
                  <div className="text-lg font-bold sm:text-xl">{burnedCalories}</div>
                  <div className="text-xs text-gray-400">Quemado</div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {progressData.map((item, index) => {
            const progressValue = item.value > 0 && item.max > 0 ? Math.min((item.value / item.max) * 100, 100) : 0;
            return (
              <motion.div 
                key={item.name} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 1.0 + index * 0.3, duration: 1.0 }} 
                className="text-center"
              >
                <div className="text-xs text-gray-400 mb-1">{item.name}</div>
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: "100%" }} 
                  transition={{ delay: 1.2 + index * 0.3, duration: 1.5, ease: "easeOut" }}
                >
                  <Progress 
                    value={progressValue} 
                    className="w-full h-2 bg-gray-600 rounded-full [&>div]:bg-[#ff9404] [&>div]:rounded-full [&>div]:transition-all [&>div]:duration-[1500ms] [&>div]:ease-out data-[value='0']:[&>div]:w-0 data-[value='0']:[&>div]:hidden"
                    data-value={progressValue === 0 ? "0" : "non-zero"}
                  />
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ delay: 1.5 + index * 0.3, duration: 0.8 }} 
                  className="text-xs text-gray-400 mt-1"
                >
                  {item.value}/{item.max} g
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 50 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 1.2, ease: "easeOut", delay: 1.2 }} 
        className="max-w-[700px] mx-auto mt-6 relative z-10"
      >
        <motion.h2 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 1.4, duration: 0.8 }} 
          className="text-sm font-semibold mb-4 text-white"
        >
          Nutrición
        </motion.h2>
        <div className="space-y-2">
          {meals.map((meal, index) => {
            const progressPercentage = meal.maxCalories > 0 && meal.calories > 0 ? Math.min((meal.calories / meal.maxCalories) * 100, 100) : 0;
            const circumference = 2 * Math.PI * 15;
            const strokeDasharray = `${(progressPercentage / 100) * circumference} ${circumference}`;
            return (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.6 + index * 0.3, duration: 1.0 }}
                className="max-w-full bg-[#3B4252] rounded-lg p-2.5 flex items-center justify-between cursor-pointer hover:bg-[#4B5563] transition duration-200"
                onClick={() => handleMealClick(meal.type)}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="relative w-10 h-10 flex items-center justify-center">
                    <svg className="transform -rotate-90 w-10 h-10" width="40" height="40">
                      <circle className="fill-none stroke-[#4B5563] stroke-1" cx="20" cy="20" r="15" />
                      {progressPercentage > 0 && (
                        <motion.circle
                          className="fill-none stroke-[#ff9404] stroke-1 stroke-linecap-round"
                          cx="20"
                          cy="20"
                          r="15"
                          strokeDasharray={circumference}
                          initial={{ strokeDasharray: `0 ${circumference}` }}
                          animate={{ strokeDasharray }}
                          transition={{ delay: 2.0 + index * 0.3, duration: 1.5, ease: "easeOut" }}
                        />
                      )}
                    </svg>
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl leading-none">{meal.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{meal.type}</h3>
                    <p className="text-xs text-gray-400">{meal.calories}/{meal.maxCalories} kcal</p>
                  </div>
                </div>
                {foodsData.isToday && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2.0 + index * 0.3, duration: 0.8 }}
                    className="p-0.5 hover:scale-120 active:scale-90 transition-transform duration-200"
                    onClick={(e) => { e.stopPropagation(); handleAddFoodClick(meal.type); }}
                  >
                    <Plus className="h-4 w-4 text-white hover:text-[#ff9404] transition-colors duration-300" />
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default React.memo(Dashboard);