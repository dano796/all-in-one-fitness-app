// src/pages/FoodDashboard.tsx
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
import { Plus, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import axios, { AxiosError } from "axios";
import { supabase } from "../lib/supabaseClient";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import GalaxyBackground from "../components/GalaxyBackground";
import ButtonToolTip from "../components/ButtonToolTip";
import { useTheme } from "../pages/ThemeContext";
import { useOfflineRequest } from '../hooks/useOfflineRequest';
import { offlineSyncManager } from '../utils/offlineSync';
import { useNotificationStore } from '../store/notificationStore';

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

const FoodDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
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
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);
  const { request, isLoading: isRequestLoading } = useOfflineRequest();
  const { addNotification } = useNotificationStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

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
            {
              params: { email },
            }
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

  const handleSetCustomCalorieGoal = async () => {
    const goal = parseInt(customCalorieGoal, 10);
    const inputElement = document.getElementById("customCalorieGoal");
    if (isNaN(goal) || goal < 1000) {
      setCalorieGoalError(
        "El límite de calorías debe ser un número mayor o igual a 1000."
      );
      inputElement?.classList.add("error");
      return;
    }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/set-calorie-goal`,
        {
          email: userEmail,
          calorieGoal: goal,
        }
      );
      if (response.data.success) {
        setTotalCaloriesGoal(goal);
        setCustomCalorieGoal("");
        setCalorieGoalError(null);
        inputElement?.classList.remove("error");
        await Swal.fire({
          title: "¡Éxito!",
          text: "El límite de calorías ha sido agregado exitosamente.",
          icon: "success",
          iconColor: "#ff9400",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#ff9400",
          customClass: {
            popup: isDarkMode
              ? "custom-swal-background"
              : "custom-swal-background-light",
            icon: "custom-swal-icon",
            title: isDarkMode ? "custom-swal-title" : "custom-swal-title-light",
            htmlContainer: isDarkMode
              ? "custom-swal-text"
              : "custom-swal-text-light",
          },
        });
      } else {
        setCalorieGoalError(
          response.data.error || "Error al establecer el límite de calorías."
        );
        inputElement?.classList.add("error");
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setCalorieGoalError(
        axiosError.response?.data?.error ||
          "Error al conectar con el servidor. Intenta de nuevo."
      );
      inputElement?.classList.add("error");
    }
  };

  const handleRemoveCalorieGoal = async () => {
    const result = await Swal.fire({
      title: "Está seguro de que quiere eliminar su límite de calorías?",
      icon: "warning",
      iconColor: "#ff9400",
      showCancelButton: true,
      confirmButtonColor: "#ff9404",
      cancelButtonColor: "#d33",
      confirmButtonText: "Aceptar",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: isDarkMode
          ? "custom-swal-background"
          : "custom-swal-background-light",
        icon: "custom-swal-icon",
        title: isDarkMode ? "custom-swal-title" : "custom-swal-title-light",
        htmlContainer: isDarkMode
          ? "custom-swal-text"
          : "custom-swal-text-light",
      },
    });
    if (result.isConfirmed) {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/set-calorie-goal`,
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
            iconColor: "#ff9400",
            confirmButtonColor: "#ff9404",
            customClass: {
              popup: isDarkMode
                ? "custom-swal-background"
                : "custom-swal-background-light",
              icon: "custom-swal-icon",
              title: isDarkMode
                ? "custom-swal-title"
                : "custom-swal-title-light",
              htmlContainer: isDarkMode
                ? "custom-swal-text"
                : "custom-swal-text-light",
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

  const { totalCalories, totalCarbs, totalProtein, totalFat } =
    calculateTotalNutrition();
  const consumedCalories = totalCalories;
  const burnedCalories = 0;
  const remainingCalories = totalCaloriesGoal
    ? totalCaloriesGoal - consumedCalories
    : 0;

  const mealCalorieLimits = totalCaloriesGoal
    ? {
        Desayuno: Math.round(totalCaloriesGoal * 0.3),
        Almuerzo: Math.round(totalCaloriesGoal * 0.4),
        Merienda: Math.round(totalCaloriesGoal * 0.05),
        Cena: Math.round(totalCaloriesGoal * 0.25),
      }
    : { Desayuno: 0, Almuerzo: 0, Merienda: 0, Cena: 0 };

  const carbGoal = totalCaloriesGoal
    ? Math.round((totalCaloriesGoal * 0.4) / 4)
    : 0;
  const proteinGoal = totalCaloriesGoal
    ? Math.round((totalCaloriesGoal * 0.3) / 4)
    : 0;
  const fatGoal = totalCaloriesGoal
    ? Math.round((totalCaloriesGoal * 0.3) / 9)
    : 0;

  const caloriesData = {
    datasets: [
      {
        data: [
          Math.min(consumedCalories, totalCaloriesGoal || consumedCalories),
          remainingCalories > 0 ? remainingCalories : 0,
        ],
        backgroundColor: ["#ff9404", isDarkMode ? "#4B5563" : "#e5e7eb"],
        borderWidth: 5,
        borderColor: isDarkMode ? "#3B4252" : "#ffffff",
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
    {
      id: 1,
      type: "Desayuno",
      calories: calculateCaloriesByType("Desayuno"),
      maxCalories: mealCalorieLimits.Desayuno,
      iconUrl: "https://img.icons8.com/emoji/48/croissant-emoji.png",
    },
    {
      id: 2,
      type: "Almuerzo",
      calories: calculateCaloriesByType("Almuerzo"),
      maxCalories: mealCalorieLimits.Almuerzo,
      iconUrl: "https://img.icons8.com/emoji/48/cooking-pot-emoji.png",
    },
    {
      id: 3,
      type: "Cena",
      calories: calculateCaloriesByType("Cena"),
      maxCalories: mealCalorieLimits.Cena,
      iconUrl: "https://img.icons8.com/emoji/48/spaghetti-emoji.png",
    },
    {
      id: 4,
      type: "Merienda",
      calories: calculateCaloriesByType("Merienda"),
      maxCalories: mealCalorieLimits.Merienda,
      iconUrl: "https://img.icons8.com/emoji/48/red-apple.png",
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

  const handleCameraClick = (type: string) => {
    navigate(`/foodsearchia?type=${type.toLowerCase()}&date=${date}`);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
  };

  const handleDatePicker = () => {
    if (dateInputRef.current) {
      dateInputRef.current.focus();
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

  const infoText = {
    dashboardSummary:
      "Muestra tu resumen diario de calorías consumidas, restantes según tu límite diario establecido, y los macronutrientes (carbohidratos, proteínas y grasas) consumidos en relación con tus objetivos personalizados.",
    nutrition:
      "Muestra el desglose de tus comidas diarias. Puedes hacer clic en cada comida para ver detalles o agregar nuevos alimentos usando el botón '+' que aparece a la derecha.",
  };

  const fetchFoodData = async () => {
    try {
      const result = await request(`${import.meta.env.VITE_BACKEND_URL}/api/food/get-daily?email=${userEmail}&date=${selectedDate}`, {
        method: 'GET',
        offlineKey: `food-${selectedDate}-${userEmail}`
      });

      if (result.success) {
        setFoodsData(result.data);
        if (result.offline) {
          addNotification(
            "📱 Datos Offline",
            "Se están mostrando los últimos datos guardados localmente.",
            "warning"
          );
        }
      }
    } catch (error) {
      console.error("Error fetching food data:", error);
      // Intentar obtener datos offline
      const offlineData = await offlineSyncManager.getData(`food-${selectedDate}-${userEmail}`);
      if (offlineData) {
        setFoodsData(offlineData);
        addNotification(
          "📱 Datos Offline",
          "Se están mostrando los últimos datos guardados localmente.",
          "warning"
        );
      }
    }
  };

  const addFood = async (foodData: any) => {
    try {
      const result = await request(`${import.meta.env.VITE_BACKEND_URL}/api/food/add`, {
        method: 'POST',
        body: {
          ...foodData,
          email: userEmail,
          date: selectedDate
        },
        offlineKey: `food-${selectedDate}-${userEmail}`
      });

      if (result.success) {
        if (!result.offline) {
          addNotification(
            "✅ Comida Registrada",
            "Tu comida ha sido registrada correctamente.",
            "success"
          );
        }
        await fetchFoodData();
      }
    } catch (error) {
      console.error("Error adding food:", error);
      addNotification(
        "⚠️ Error al Registrar",
        "No se pudo registrar tu comida. Se guardará localmente.",
        "error"
      );
    }
  };

  const removeFood = async (foodId: string) => {
    try {
      const result = await request(`${import.meta.env.VITE_BACKEND_URL}/api/food/remove`, {
        method: 'DELETE',
        body: {
          foodId,
          email: userEmail,
          date: selectedDate
        },
        offlineKey: `food-${selectedDate}-${userEmail}`
      });

      if (result.success) {
        if (!result.offline) {
          addNotification(
            "✅ Comida Eliminada",
            "La comida ha sido eliminada correctamente.",
            "success"
          );
        }
        await fetchFoodData();
      }
    } catch (error) {
      console.error("Error removing food:", error);
      addNotification(
        "⚠️ Error al Eliminar",
        "No se pudo eliminar la comida. Se guardará localmente.",
        "error"
      );
    }
  };

  return (
    <div
      className={`relative p-4 space-y-6 ${
        isDarkMode ? "bg-[#282c3c]" : "bg-[#F8F9FA]"
      } min-h-screen overflow-hidden -mt-12 transition-colors duration-300`}
    >
      <GalaxyBackground />

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className={`mb-2 text-xs ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Semana {getWeek()}
        </motion.div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <button
            onClick={handleDatePicker}
            className={`min-w-[120px] px-6 py-3 font-semibold rounded-lg border hover:scale-105 active:scale-95 transition-all duration-300 ${
              isDarkMode
                ? "bg-gradient-to-br from-[#2D3242] to-[#3B4252] text-gray-200 border-[#ff9404] shadow-[0_0_10px_rgba(255,148,4,0.3)] hover:bg-gradient-to-br hover:from-[#3B4252] hover:to-[#4B5563] hover:shadow-[0_0_15px_rgba(255,148,4,0.5)]"
                : "bg-white text-gray-900 border-gray-300 shadow-md hover:bg-gray-100 hover:shadow-lg"
            }`}
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
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`max-w-[700px] mx-auto rounded-lg p-5 relative z-10 ${
          isDarkMode ? "bg-[#3B4252]" : "bg-white"
        } shadow-md`}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex justify-between items-center mb-4"
        >
          <div className="flex items-center">
            <h2
              className={`text-sm font-semibold mr-2 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Resumen
            </h2>
            <ButtonToolTip content={infoText.dashboardSummary} />
          </div>
          {totalCaloriesGoal ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={handleRemoveCalorieGoal}
              className={`text-sm cursor-pointer transition-colors duration-300 ${
                isDarkMode
                  ? "text-white hover:text-[#ff4444]"
                  : "text-gray-900 hover:text-red-600"
              }`}
            >
              Eliminar límite
            </motion.p>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-2 flex-wrap justify-end"
            >
              <input
                type="number"
                id="customCalorieGoal"
                value={customCalorieGoal}
                onChange={(e) => setCustomCalorieGoal(e.target.value)}
                className={`w-[70px] p-1.5 text-sm border rounded-md text-center focus:outline-none focus:ring-2 focus:ring-[#ff9404]/20 focus:scale-102 transition-all duration-300 placeholder:text-gray-500 [.error&]:border-[#ff4444] [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                  isDarkMode
                    ? "border-gray-500 bg-[#2D3242] text-gray-200 focus:border-[#ff9404]"
                    : "border-gray-300 bg-white text-gray-900 focus:border-[#ff9404]"
                }`}
                placeholder="1000+"
              />
              <button
                onClick={handleSetCustomCalorieGoal}
                className={`px-3 py-1.5 text-sm text-white border-none rounded-md transition-all duration-300 ${
                  isDarkMode
                    ? "bg-gradient-to-br from-[#ff9404] to-[#e08503] shadow-[0_0_10px_rgba(255,148,4,0.3)] hover:bg-gradient-to-br hover:from-[#e08503] hover:to-[#ff9404] hover:shadow-[0_0_15px_rgba(255,148,4,0.5)] hover:scale-110 active:scale-95"
                    : "bg-orange-500 hover:bg-orange-600 hover:scale-110 active:scale-95"
                }`}
              >
                Agregar
              </button>
              <div className="flex items-center">
                <p
                  className={`text-sm mx-1 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  o
                </p>
                <p
                  onClick={() => navigate("/calorie-calculator")}
                  className={`text-sm cursor-pointer transition-all duration-300 ${
                    isDarkMode
                      ? "text-[#ff9404] hover:text-[#e08503] hover:shadow-[0_0_10px_rgba(255,148,4,0.5)]"
                      : "text-orange-500 hover:text-orange-600"
                  }`}
                >
                  Ir a la calculadora
                </p>
              </div>
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
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.8 }}
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
              <div className="relative w-full h-full flex items-center justify-center">
                {!isSmallScreen && (
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                    className="absolute -left-[135px] top-1/2 -translate-y-1/2 text-center flex flex-col items-center"
                  >
                    <div
                      className={`text-lg font-bold sm:text-xl ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {consumedCalories}
                    </div>
                    <div
                      className={`text-xs ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Consumido
                    </div>
                  </motion.div>
                )}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.1, duration: 0.5 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center flex flex-col items-center w-0 sm:w-0"
                >
                  <div
                    className={`text-3xl font-bold leading-none min-w-[60px] text-center ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {remainingCalories > 0 ? remainingCalories : 0}
                  </div>
                  <div
                    className={`text-xs leading-none ${
                      isDarkMode ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    Restante
                  </div>
                </motion.div>
                {!isSmallScreen && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                    className="absolute -right-[135px] top-1/2 -translate-y-1/2 text-center flex flex-col items-center"
                  >
                    <div
                      className={`text-lg font-bold sm:text-xl ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {burnedCalories}
                    </div>
                    <div
                      className={`text-xs ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Quemado
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {isSmallScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="flex justify-between mb-6"
          >
            <div className="text-center flex-1">
              <div
                className={`text-lg font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {consumedCalories}
              </div>
              <div
                className={`text-xs ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Consumido
              </div>
            </div>
            <div className="text-center flex-1">
              <div
                className={`text-lg font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {burnedCalories}
              </div>
              <div
                className={`text-xs ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Quemado
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {progressData.map((item, index) => {
            const progressValue =
              item.value > 0 && item.max > 0
                ? Math.min((item.value / item.max) * 100, 100)
                : 0;
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                className="text-center"
              >
                <div
                  className={`text-xs mb-1 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {item.name}
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{
                    delay: 0.6 + index * 0.1,
                    duration: 0.4,
                    ease: "easeOut",
                  }}
                >
                  <Progress
                    value={progressValue}
                    className={`w-full h-2 rounded-full [&>div]:bg-[#ff9404] [&>div]:rounded-full [&>div]:transition-all [&>div]:duration-[1500ms] [&>div]:ease-out data-[value='0']:[&>div]:w-0 data-[value='0']:[&>div]:hidden ${
                      isDarkMode ? "bg-gray-600" : "bg-gray-200"
                    }`}
                    data-value={progressValue === 0 ? "0" : "non-zero"}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
                  className={`text-xs mt-1 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
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
        transition={{ duration: 0.4, ease: "easeOut", delay: 1.2 }}
        className="max-w-[700px] mx-auto mt-6 relative z-10"
      >
        <motion.div
          className="flex items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9, duration: 0.4 }}
        >
          <h2
            className={`text-sm font-semibold mr-2 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Nutrición
          </h2>
          <ButtonToolTip content={infoText.nutrition} />
        </motion.div>
        <div className="space-y-2 mt-2">
          {meals.map((meal, index) => {
            const progressPercentage =
              meal.maxCalories > 0 && meal.calories > 0
                ? Math.min((meal.calories / meal.maxCalories) * 100, 100)
                : 0;
            const circumference = 2 * Math.PI * 15;
            const strokeDasharray = `${
              (progressPercentage / 100) * circumference
            } ${circumference}`;
            return (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + index * 0.2, duration: 0.5 }}
                className={`max-w-full rounded-lg p-2.5 flex items-center justify-between cursor-pointer transition duration-200 ${
                  isDarkMode
                    ? "bg-[#3B4252] hover:bg-[#4B5563]"
                    : "bg-white hover:bg-gray-100 shadow-sm"
                }`}
                onClick={() => handleMealClick(meal.type)}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="relative w-10 h-10 flex items-center justify-center">
                    <svg
                      className="transform -rotate-90 w-10 h-10"
                      width="40"
                      height="40"
                    >
                      <circle
                        className={`fill-none stroke-1 ${
                          isDarkMode ? "stroke-[#4B5563]" : "stroke-gray-200"
                        }`}
                        cx="20"
                        cy="20"
                        r="15"
                      />
                      {progressPercentage > 0 && (
                        <motion.circle
                          className="fill-none stroke-[#ff9404] stroke-1 stroke-linecap-round"
                          cx="20"
                          cy="20"
                          r="15"
                          strokeDasharray={circumference}
                          initial={{ strokeDasharray: `0 ${circumference}` }}
                          animate={{ strokeDasharray }}
                          transition={{
                            delay: 1.2 + index * 0.2,
                            duration: 0.5,
                            ease: "easeOut",
                          }}
                        />
                      )}
                    </svg>
                    <img
                      src={meal.iconUrl}
                      alt={`${meal.type} icon`}
                      className="absolute w-6 h-6 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    />
                  </div>
                  <div>
                    <h3
                      className={`text-sm font-semibold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {meal.type}
                    </h3>
                    <p
                      className={`text-xs ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {meal.calories}/{meal.maxCalories} kcal
                    </p>
                  </div>
                </div>
                {foodsData.isToday && (
                  <div className="flex space-x-2">
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                      className="p-0.5 hover:scale-120 active:scale-90 transition-transform duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCameraClick(meal.type);
                      }}
                    >
                      <Camera
                        className={`h-4 w-4 transition-colors duration-300 ${
                          isDarkMode
                            ? "text-white hover:text-[#ff9404]"
                            : "text-gray-600 hover:text-orange-500"
                        }`}
                      />
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                      className="p-0.5 hover:scale-120 active:scale-90 transition-transform duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddFoodClick(meal.type);
                      }}
                    >
                      <Plus
                        className={`h-4 w-4 transition-colors duration-300 ${
                          isDarkMode
                            ? "text-white hover:text-[#ff9404]"
                            : "text-gray-600 hover:text-orange-500"
                        }`}
                      />
                    </motion.button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default React.memo(FoodDashboard);
