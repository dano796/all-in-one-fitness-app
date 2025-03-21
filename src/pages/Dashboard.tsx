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

// Function to get the week number
const getWeekNumber = (dateStr: string) => {
  const date = new Date(dateStr + "T00:00:00");
  const oneJan = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor(
    (date.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000)
  );
  const weekNumber = Math.ceil((days + oneJan.getDay() + 1) / 7);
  return weekNumber;
};

// Interfaces for food data
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
  const [totalCaloriesGoal, setTotalCaloriesGoal] = useState<number | null>(
    null
  );
  const [customCalorieGoal, setCustomCalorieGoal] = useState<string>("");
  const [calorieGoalError, setCalorieGoalError] = useState<string | null>(null);

  // Check authentication and fetch user email
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

        // Fetch user's calorie goal
        try {
          const response = await axios.get(
            "http://localhost:5000/api/get-calorie-goal",
            {
              params: { email },
            }
          );
          if (response.data.calorieGoal) {
            setTotalCaloriesGoal(response.data.calorieGoal);
          }
        } catch (err) {
          setError("Error al obtener el límite de calorías.");
        }
      }
    };
    checkAuth();
  }, [navigate]);

  // Fetch registered foods
  const fetchFoods = async () => {
    if (!userEmail || !date) return;
    try {
      const response = await axios.get<FoodsResponse>(
        "http://localhost:5000/api/foods/user",
        {
          params: { email: userEmail, date: date },
        }
      );
      setFoodsData(response.data);
      setError(null);
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setError(
        axiosError.response?.data?.error ||
          "Error al consultar las comidas registradas"
      );
    }
  };

  useEffect(() => {
    if (userEmail && date) fetchFoods();
  }, [userEmail, date]);

  // Handle setting custom calorie goal
  const handleSetCustomCalorieGoal = async () => {
    const goal = parseInt(customCalorieGoal, 10);
    if (isNaN(goal) || goal < 2000) {
      setCalorieGoalError(
        "El límite de calorías debe ser un número mayor o igual a 2000."
      );
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/set-calorie-goal",
        {
          email: userEmail,
          calorieGoal: goal,
        }
      );

      if (response.data.success) {
        setTotalCaloriesGoal(goal);
        setCustomCalorieGoal("");
        setCalorieGoalError(null);
      } else {
        setCalorieGoalError(
          response.data.error || "Error al establecer el límite de calorías."
        );
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setCalorieGoalError(
        axiosError.response?.data?.error ||
          "Error al conectar con el servidor. Intenta de nuevo."
      );
    }
  };

  // Handle removing calorie goal with scoped Swal styles
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
          "http://localhost:5000/api/set-calorie-goal",
          {
            email: userEmail,
            calorieGoal: 0,
          }
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
          setCalorieGoalError(
            response.data.error || "Error al eliminar el límite de calorías."
          );
        }
      } catch (err) {
        const axiosError = err as AxiosError<{ error?: string }>;
        setCalorieGoalError(
          axiosError.response?.data?.error ||
            "Error al conectar con el servidor. Intenta de nuevo."
        );
      }
    }
  };

  // Calculate calories by meal type
  const calculateCaloriesByType = (type: keyof OrganizedFoods) => {
    const foods = foodsData.foods[type] || [];
    return foods.reduce((total, food) => {
      const calories = parseFloat(food.calorias || "0");
      return total + (isNaN(calories) ? 0 : calories);
    }, 0);
  };

  // Calculate total nutrition values
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

  // Calculated values
  const { totalCalories, totalCarbs, totalProtein, totalFat } =
    calculateTotalNutrition();
  const consumedCalories = totalCalories;
  const burnedCalories = 0;
  const remainingCalories = totalCaloriesGoal
    ? totalCaloriesGoal - consumedCalories
    : 0;

  // Calculate meal calorie limits based on totalCaloriesGoal
  const mealCalorieLimits = totalCaloriesGoal
    ? {
        Desayuno: Math.round(totalCaloriesGoal * 0.3),
        Almuerzo: Math.round(totalCaloriesGoal * 0.4),
        Merienda: Math.round(totalCaloriesGoal * 0.05),
        Cena: Math.round(totalCaloriesGoal * 0.25),
      }
    : {
        Desayuno: 0,
        Almuerzo: 0,
        Merienda: 0,
        Cena: 0,
      };

  // Calculate macronutrient goals based on totalCaloriesGoal
  const carbGoal = totalCaloriesGoal
    ? Math.round((totalCaloriesGoal * 0.4) / 4)
    : 0;
  const proteinGoal = totalCaloriesGoal
    ? Math.round((totalCaloriesGoal * 0.3) / 4)
    : 0;
  const fatGoal = totalCaloriesGoal
    ? Math.round((totalCaloriesGoal * 0.3) / 9)
    : 0;

  // Data for calories chart (visually limited to 100%)
  const caloriesData = {
    datasets: [
      {
        data: [
          Math.min(consumedCalories, totalCaloriesGoal || consumedCalories),
          remainingCalories > 0 ? remainingCalories : 0,
        ],
        backgroundColor: ["#ff9404", "#4B5563"],
        borderWidth: 5,
        borderColor: "#3B4252",
        circumference: 240,
        rotation: 240,
      },
    ],
  };

  // Data for progress bars (visually limited to 100%)
  const progressData = [
    { name: "Carbs", value: totalCarbs, max: carbGoal },
    { name: "Protein", value: totalProtein, max: proteinGoal },
    { name: "Fat", value: totalFat, max: fatGoal },
  ];

  const meals = [
    {
      id: 1,
      type: "Desayuno",
      calories: calculateCaloriesByType("Desayuno"),
      maxCalories: mealCalorieLimits.Desayuno,
      icon: "🍞",
    },
    {
      id: 2,
      type: "Almuerzo",
      calories: calculateCaloriesByType("Almuerzo"),
      maxCalories: mealCalorieLimits.Almuerzo,
      icon: "🍽️",
    },
    {
      id: 3,
      type: "Cena",
      calories: calculateCaloriesByType("Cena"),
      maxCalories: mealCalorieLimits.Cena,
      icon: "🍳",
    },
    {
      id: 4,
      type: "Merienda",
      calories: calculateCaloriesByType("Merienda"),
      maxCalories: mealCalorieLimits.Merienda,
      icon: "🍎",
    },
  ];

  const handleMealClick = (type: string) => {
    navigate(`/comidas?type=${type.toLowerCase()}&date=${date}`);
  };

  const handleAddFoodClick = (type: string) => {
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
    const selectedDate = new Date(date + "T00:00:00");
    const today = new Date(todayStr + "T00:00:00");
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (selectedDate.getTime() === today.getTime()) return "Hoy";
    if (selectedDate.getTime() === yesterday.getTime()) return "Ayer";
    return selectedDate.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getWeek = () => {
    return getWeekNumber(date);
  };

  return (
    <div className="relative p-4 space-y-6 bg-[#282c3c] min-h-screen overflow-auto -mt-12">
      {/* Partículas en el fondo */}
      <GalaxyBackground />

      <style>
        {`
          /* General styles remain unchanged */
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
          .progress-bar {
            background-color: #4B5563 !important;
            border-radius: 9999px;
          }
          .progress-bar .bg-primary {
            background-color: #ff9404 !important;
            border-radius: 9999px;
            transition: width 1.5s ease-out;
          }
          /* Ensure no orange fill when value is 0 */
          .progress-bar[data-value="0"] .bg-primary {
            width: 0 !important;
            display: none !important;
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
            left: 35%;
            transform: translate(-50%, -50%);
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .calorie-goal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          }
          .calorie-goal-input {
            width: 60px;
            padding: 4px 8px;
            font-size: 0.875rem;
            border: 1px solid #6B7280;
            border-radius: 4px;
            background: #282c3c;
            color: white;
            text-align: center;
          }
          .calorie-goal-button {
            padding: 4px 8px;
            font-size: 0.75rem;
            background-color: #ff9404;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: color 0.3s ease;
          }
          .calorie-goal-button:hover {
            color: #1C1C1E;
          }
          .calorie-goal-text {
            color: #ff9404;
            cursor: pointer;
            transition: text-decoration 0.3s ease;
            font-size: 0.875rem;
            margin-left: 8px;
          }
          .calorie-goal-text:hover {
            text-decoration: underline;
          }
          .calorie-goal-actions {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .remove-goal-text {
            color: white;
            cursor: pointer;
            font-size: 0.875rem;
            transition: color 0.3s ease;
          }
          .remove-goal-text:hover {
            color: #ff4444;
          }
          /* Circular Progress Ring Styles */
          .circular-progress-container {
            position: relative;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .circular-progress {
            transform: rotate(-90deg);
          }
          .circular-progress-bg {
            fill: none;
            stroke: #4B5563;
            stroke-width: 4;
          }
          .circular-progress-fill {
            fill: none;
            stroke: #ff9404;
            stroke-width: 4;
            stroke-linecap: round;
            transition: stroke-dasharray 1.5s ease-out;
          }
          .circular-progress-icon {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 20px;
            line-height: 1;
          }

          /* Scoped SweetAlert2 styles for Dashboard */
          .dashboard-swal-container .dashboard-swal-popup {
            background-color: #3B4252 !important;
            color: #fff !important;
          }
          .dashboard-swal-container .dashboard-swal-icon {
            color: #ff9404 !important;
          }
          .dashboard-swal-container .swal2-warning {
            border-color: #ff9404 !important;
            color: #ff9404 !important;
          }
          .dashboard-swal-container .swal2-success {
            border-color: #ff9404 !important;
          }
          .dashboard-swal-container .swal2-success .swal2-success-ring {
            border-color: #ff9404 !important;
          }
          .dashboard-swal-container .dashboard-swal-title {
            color: #fff !important;
            font-size: 1.5rem !important;
          }
          .dashboard-swal-container .dashboard-swal-text {
            color: #fff !important;
            font-size: 1rem !important;
          }
          .dashboard-swal-container .dashboard-swal-confirm-button {
            background-color: #ff9404 !important;
            color: white !important;
            border: none !important;
            padding: 10px 20px !important;
            border-radius: 4px !important;
            font-size: 0.875rem !important;
          }
          .dashboard-swal-container .dashboard-swal-cancel-button {
            background-color: #d33 !important;
            color: white !important;
            border: none !important;
            padding: 10px 20px !important;
            border-radius: 4px !important;
            font-size: 0.875rem !important;
          }

          /* Responsive adjustments */
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
              left: -150px;
              font-size: 0.875rem;
            }
            .burned-label {
              right: -150px;
              font-size: 0.875rem;
            }
            .remaining-label {
              font-size: 1.25rem;
            }
            .progress-bar {
              height: 6px;
            }
            .circular-progress-container {
              width: 36px;
              height: 36px;
            }
            .circular-progress-icon {
              font-size: 18px;
            }
            .calorie-goal-input {
              width: 50px;
              font-size: 0.75rem;
              padding: 3px 6px;
            }
            .calorie-goal-button {
              padding: 3px 6px;
              font-size: 0.625rem;
            }
            .calorie-goal-text {
              font-size: 0.75rem;
              margin-left: 4px;
            }
            .calorie-goal-actions {
              gap: 4px;
            }
            .remove-goal-text {
              font-size: 0.75rem;
            }
            .dashboard-swal-container .dashboard-swal-title {
              font-size: 1.25rem !important;
            }
            .dashboard-swal-container .dashboard-swal-text {
              font-size: 0.875rem !important;
            }
            .dashboard-swal-container .dashboard-swal-confirm-button,
            .dashboard-swal-container .dashboard-swal-cancel-button {
              padding: 8px 16px !important;
              font-size: 0.75rem !important;
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
            className="px-6 py-2 bg-[#3B4252] text-white font-semibold rounded-lg date-button hover:bg-[#4B5563] transition duration-300"
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
        </motion.div>
      </motion.div>

      {/* Summary Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="summary-section relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="calorie-goal-header"
        >
          <h2 className="text-sm font-semibold text-white">Resumen</h2>
          {totalCaloriesGoal ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={handleRemoveCalorieGoal}
              className="remove-goal-text"
            >
              Eliminar límite
            </motion.p>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="calorie-goal-actions"
            >
              <input
                type="number"
                id="customCalorieGoal"
                value={customCalorieGoal}
                onChange={(e) => setCustomCalorieGoal(e.target.value)}
                className="calorie-goal-input"
                placeholder="2000+"
              />
              <button
                onClick={handleSetCustomCalorieGoal}
                className="calorie-goal-button"
              >
                Agregar
              </button>
              <p className="text-sm text-gray-400">o</p>
              <p
                onClick={() => navigate("/calorie-calculator")}
                className="calorie-goal-text"
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

        {/* Calories chart with animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.8 }}
          className="relative flex justify-center mb-8"
        >
          <div className="relative w-48 h-48 sm:w-56 sm:h-56">
            <Doughnut
              data={caloriesData}
              options={{
                cutout: "85%",
                plugins: { legend: { display: false } },
                maintainAspectRatio: true,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="circle-container">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0, duration: 0.8 }}
                  className="eaten-label"
                >
                  <div className="text-lg font-bold sm:text-xl">
                    {consumedCalories}
                  </div>
                  <div className="text-xs text-gray-400">Consumido</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                  className="remaining-label"
                >
                  <div className="text-2xl font-bold sm:text-3xl">
                    {remainingCalories > 0 ? remainingCalories : 0}
                  </div>
                  <div className="text-xs text-gray-400">Restante</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0, duration: 0.8 }}
                  className="burned-label"
                >
                  <div className="text-lg font-bold sm:text-xl">
                    {burnedCalories}
                  </div>
                  <div className="text-xs text-gray-400">Quemado</div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress bars with animation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {progressData.map((item, index) => {
            // Explicitly set progress to 0 if value is 0
            const progressValue =
              item.value > 0 && item.max > 0
                ? Math.min((item.value / item.max) * 100, 100)
                : 0;

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
                  transition={{
                    delay: 1.2 + index * 0.3,
                    duration: 1.5,
                    ease: "easeOut",
                  }}
                >
                  <Progress
                    value={progressValue}
                    className="w-full h-2 progress-bar"
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

      {/* Nutrition Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 1.2 }}
        className="nutrition-section mt-6 relative z-10"
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
            const progressPercentage =
              meal.maxCalories > 0 && meal.calories > 0
                ? Math.min((meal.calories / meal.maxCalories) * 100, 100)
                : 0;
            const circumference = 2 * Math.PI * 15; // Radius of the circle is 15
            const strokeDasharray = `${
              (progressPercentage / 100) * circumference
            } ${circumference}`;

            return (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.6 + index * 0.3, duration: 1.0 }}
                className="meal-item flex items-center justify-between cursor-pointer hover:bg-[#4B5563] transition duration-200"
                onClick={() => handleMealClick(meal.type)}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="circular-progress-container">
                    <svg className="circular-progress" width="40" height="40">
                      <circle
                        className="circular-progress-bg"
                        cx="20"
                        cy="20"
                        r="15"
                      />
                      {progressPercentage > 0 && (
                        <motion.circle
                          className="circular-progress-fill"
                          cx="20"
                          cy="20"
                          r="15"
                          strokeDasharray={circumference}
                          initial={{ strokeDasharray: `0 ${circumference}` }}
                          animate={{ strokeDasharray }}
                          transition={{
                            delay: 2.0 + index * 0.3,
                            duration: 1.5,
                            ease: "easeOut",
                          }}
                        />
                      )}
                    </svg>
                    <span className="circular-progress-icon">{meal.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {meal.type}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {meal.calories}/{meal.maxCalories} kcal
                    </p>
                  </div>
                </div>
                {/* Show "+" button only for today */}
                {foodsData.isToday && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2.0 + index * 0.3, duration: 0.8 }}
                    className="add-food-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddFoodClick(meal.type);
                    }}
                  >
                    <Plus className="h-4 w-4 text-white" />
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

export default Dashboard;
