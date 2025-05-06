// src/pages/Dashboard.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Droplets } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import axios from "axios";
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import GalaxyBackground from "../components/GalaxyBackground";
import ReactApexChart from "react-apexcharts";
import ButtonToolTip from "../components/ButtonToolTip";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import { useTheme } from "../pages/ThemeContext";

interface DailyBreakdown {
  date: string;
  calories: number;
}

interface CalorieIntake {
  totalCalories: number;
  totalProteins: number;
  totalFats: number;
  totalCarbs: number;
  dailyBreakdown: DailyBreakdown[];
}

interface DashboardData {
  calorieIntake: CalorieIntake;
  calorieGoal: number;
  waterIntake: number;
  waterGoal?: number;
}

interface FoodsResponse {
  foods: {
    Desayuno: any[];
    Almuerzo: any[];
    Merienda: any[];
    Cena: any[];
  };
  currentFoodType: string | null;
  isToday: boolean;
}

interface DashboardProps {
  user: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const TIMEZONE = "America/Bogota";
  const today = new Date();
  const todayStr = today.toLocaleDateString("en-CA", { timeZone: TIMEZONE });
  const DEFAULT_WATER_GOAL_ML = 2000;
  const DEFAULT_UNITS_PER_BOTTLE = 250;
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [userEmail, setUserEmail] = useState<string>("");
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    calorieIntake: {
      totalCalories: 0,
      totalProteins: 0,
      totalFats: 0,
      totalCarbs: 0,
      dailyBreakdown: [],
    },
    calorieGoal: 2000,
    waterIntake: 0,
    waterGoal: DEFAULT_WATER_GOAL_ML,
  });
  const [foodData, setFoodData] = useState<FoodsResponse>({
    foods: { Desayuno: [], Almuerzo: [], Merienda: [], Cena: [] },
    currentFoodType: null,
    isToday: false,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<string>(todayStr);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [filledWaterUnits, setFilledWaterUnits] = useState<number>(0);
  const [bottleSize, setBottleSize] = useState<number>(
    DEFAULT_UNITS_PER_BOTTLE
  );

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
      }
    };
    checkAuth();
  }, [navigate]);

  // Recuperar el tamaño personalizado de la botella
  useEffect(() => {
    const fetchBottleSize = async () => {
      if (!userEmail) return;
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/water/bottle-size`,
          {
            params: { email: userEmail },
          }
        );

        if (response.data && response.data.tamano_botella) {
          const size = response.data.tamano_botella;
          setBottleSize(size);
        }
      } catch (err) {
        console.log(err);
        setError("Error al consultar el tamaño de botella.");
      }
    };

    if (userEmail) {
      fetchBottleSize();
    }
  }, [userEmail]);

  useEffect(() => {
    const calculateDateRange = () => {
      const selectedDate = new Date(date);
      const start = new Date(selectedDate);
      const dayOfWeek = start.getDay();
      start.setDate(start.getDate() - dayOfWeek);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      const startStr = start.toLocaleDateString("en-CA", {
        timeZone: TIMEZONE,
      });
      const endStr = end.toLocaleDateString("en-CA", { timeZone: TIMEZONE });
      setStartDate(startStr);
      setEndDate(endStr);
    };

    if (date) {
      calculateDateRange();
    }
  }, [date]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userEmail || !startDate || !endDate) return;
      setIsLoading(true);

      try {
        const [dashboardRes, foodsRes, goalRes, waterRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/dashboard`, {
            params: { email: userEmail, startDate, endDate },
          }),
          axios.get<FoodsResponse>(
            `${import.meta.env.VITE_BACKEND_URL}/api/foods/user`,
            {
              params: { email: userEmail, date: date },
            }
          ),
          axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/get-calorie-goal`,
            {
              params: { email: userEmail },
            }
          ),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/water/user`, {
            params: { email: userEmail, date: date },
          }),
        ]);

        const waterGoalResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/water/get-goal`,
          {
            params: { email: userEmail },
          }
        );

        const updatedDashboardData = { ...dashboardRes.data };
        if (goalRes.data.calorieGoal) {
          updatedDashboardData.calorieGoal = goalRes.data.calorieGoal;
        }

        // Update water data with the actual goal from the server
        if (waterRes.data) {
          setFilledWaterUnits(waterRes.data.aguasllenadas || 0);
          // Usar el tamaño personalizado de botella para calcular el agua consumida
          const consumedWater = (waterRes.data.aguasllenadas || 0) * bottleSize;
          updatedDashboardData.waterIntake = consumedWater;

          // También actualizar el tamaño de botella si viene en la respuesta
          if (
            waterRes.data.tamano_botella &&
            waterRes.data.tamano_botella > 0
          ) {
            setBottleSize(waterRes.data.tamano_botella);
          }
        }

        // Set custom water goal if available
        if (waterGoalResponse.data && waterGoalResponse.data.waterGoal) {
          updatedDashboardData.waterGoal = waterGoalResponse.data.waterGoal;
        } else {
          updatedDashboardData.waterGoal = DEFAULT_WATER_GOAL_ML;
        }

        setFoodData(foodsRes.data);
        setDashboardData(updatedDashboardData);
        setError(null);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Error al obtener los datos del dashboard.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [userEmail, startDate, endDate, date, bottleSize]);

  useEffect(() => {
    const calculateNutrition = () => {
      const allFoods = [
        ...foodData.foods.Desayuno,
        ...foodData.foods.Almuerzo,
        ...foodData.foods.Merienda,
        ...foodData.foods.Cena,
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

      setDashboardData((prev) => ({
        ...prev,
        calorieIntake: {
          ...prev.calorieIntake,
          totalCalories: totalCalories,
          totalCarbs: totalCarbs,
          totalProteins: totalProtein,
          totalFats: totalFat,
        },
      }));
    };

    calculateNutrition();
  }, [foodData]);

  const getWeek = () => {
    const d = new Date(date);
    const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
    const pastDaysOfYear = (d.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
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

  const formatValue = (value: number) => value.toFixed(2);

  const carbsGoal = Math.round((dashboardData.calorieGoal * 0.4) / 4);
  const proteinsGoal = Math.round((dashboardData.calorieGoal * 0.3) / 4);
  const fatsGoal = Math.round((dashboardData.calorieGoal * 0.3) / 9);

  const carbsCalories = dashboardData.calorieIntake.totalCarbs;
  const proteinCalories = dashboardData.calorieIntake.totalProteins;
  const fatCalories = dashboardData.calorieIntake.totalFats;

  const carbsPercentage = Math.round((carbsCalories / carbsGoal) * 100);
  const proteinsPercentage = Math.round((proteinCalories / proteinsGoal) * 100);
  const fatsPercentage = Math.round((fatCalories / fatsGoal) * 100);

  const prepareWeeklyData = () => {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      console.warn("Invalid or unset date, returning empty weekDays");
      return [];
    }

    const weekDays: {
      fullDate: string;
      date: string;
      calories: number;
      meta: number;
    }[] = [];
    const selectedDateObj = new Date(date + "T00:00:00");

    if (isNaN(selectedDateObj.getTime())) {
      console.warn("Invalid selectedDateObj, returning empty weekDays");
      return [];
    }

    const dayAbbreviations = ["DO", "LU", "MA", "MI", "JU", "VI", "SA"];
    for (let i = 6; i >= 0; i--) {
      const currentDate = new Date(selectedDateObj);
      currentDate.setDate(selectedDateObj.getDate() - i);
      const dateStr = currentDate.toISOString().split("T")[0];
      const dayIndex = currentDate.getDay();
      weekDays.push({
        fullDate: dateStr,
        date: dayAbbreviations[dayIndex],
        calories: 0,
        meta: dashboardData.calorieGoal,
      });
    }

    const dailyCaloriesMap = new Map<string, number>();
    dashboardData.calorieIntake.dailyBreakdown.forEach((day) => {
      dailyCaloriesMap.set(day.date, Number(formatValue(day.calories)));
    });

    weekDays.forEach((day) => {
      if (dailyCaloriesMap.has(day.fullDate)) {
        day.calories = dailyCaloriesMap.get(day.fullDate) || 0;
      } else if (day.fullDate === date && date === todayStr) {
        day.calories = Number(
          formatValue(dashboardData.calorieIntake.totalCalories)
        );
      }
    });

    console.log("Datos del gráfico:", {
      todayStr,
      selectedDate: date,
      weekDays,
      dailyBreakdown: dashboardData.calorieIntake.dailyBreakdown,
    });

    return weekDays;
  };

  const barData = date ? prepareWeeklyData() : [];

  const getWaterMessage = () => {
    const waterGoalUnits = Math.ceil(
      (dashboardData.waterGoal || DEFAULT_WATER_GOAL_ML) / bottleSize
    );
    if (filledWaterUnits >= waterGoalUnits) {
      return "¡Meta alcanzada! Eres un maestro del agua 💧";
    } else {
      return "¡Sigue así, cada gota cuenta!";
    }
  };

  const infoText = {
    calorieIntake:
      "Muestra la ingesta calórica diaria y los macronutrientes (carbohidratos, proteínas y grasas) consumidos en relación con tus objetivos personalizados.",
    waterIntake:
      "Rastrea tu consumo diario de agua. La meta es consumir agua suficiente para mantenerte bien hidratado durante todo el día.",
    weeklyCalories:
      "Visualiza tu patrón de consumo calórico a lo largo de la semana actual, comparándolo con tu objetivo diario establecido.",
    macronutrients:
      "Muestra la distribución de macronutrientes (carbohidratos, proteínas y grasas) en tu dieta del día actual, con porcentajes de cumplimiento respecto a tus objetivos.",
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
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className={`mb-2 text-xs ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Semana {getWeek()}
        </motion.div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <button
            onClick={handleDatePicker}
            className={`min-w-[120px] px-6 py-3 ${
              isDarkMode
                ? "bg-gradient-to-br from-[#2D3242] to-[#3B4252] text-gray-200 border-[#ff9404] shadow-[0_0_10px_rgba(255,148,4,0.3)] hover:bg-gradient-to-br hover:from-[#3B4252] hover:to-[#4B5563] hover:shadow-[0_0_15px_rgba(255,148,4,0.5)]"
                : "bg-white text-gray-900 border-gray-300 shadow-md hover:bg-gray-50 hover:shadow-lg"
            } font-semibold rounded-lg border hover:scale-105 active:scale-95 transition-all duration-300`}
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

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`rounded-lg p-5 ${
                isDarkMode ? "bg-[#3B4252]" : "bg-white"
              } shadow-md`}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex justify-between items-center mb-4"
              >
                <div className="flex items-center space-x-2">
                  <h2
                    className={`text-sm font-semibold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Ingesta Calórica
                  </h2>
                  <ButtonToolTip content={infoText.calorieIntake} />
                </div>
                <button
                  onClick={() => navigate("/foodDashboard")}
                  className={`text-sm ${
                    isDarkMode
                      ? "text-[#ff9404] hover:text-[#e08503]"
                      : "text-orange-500 hover:text-orange-600"
                  } transition-colors duration-300`}
                >
                  Ver detalles
                </button>
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

              <div className="flex justify-center">
                <div className="w-full max-w-md">
                  <ReactApexChart
                    options={{
                      chart: {
                        height: 350,
                        type: "radialBar",
                        background: isDarkMode ? "#3B4252" : "#ffffff",
                        fontFamily: "Inter, sans-serif",
                      },
                      colors: ["#FF0000", "#8884d8", "#1E90FF", "#ff9404"],
                      labels: [
                        "Calorías",
                        "Carbohidratos",
                        "Proteínas",
                        "Grasas",
                      ],
                      plotOptions: {
                        radialBar: {
                          dataLabels: {
                            name: {
                              fontSize: "14px",
                              color: isDarkMode ? "#fff" : "#1f2937",
                            },
                            value: {
                              fontSize: "16px",
                              color: isDarkMode ? "#fff" : "#1f2937",
                            },
                            total: {
                              show: true,
                              label: "Total Calorías",
                              color: isDarkMode ? "#fff" : "#1f2937",
                              formatter: function () {
                                const totalCaloriesConsumed =
                                  dashboardData.calorieIntake.totalCalories;
                                const totalCaloriesGoal =
                                  dashboardData.calorieGoal;
                                const percentageCalories =
                                  (totalCaloriesConsumed / totalCaloriesGoal) *
                                  100;
                                return `${Math.round(percentageCalories)}%`;
                              },
                            },
                          },
                        },
                      },
                      theme: { mode: isDarkMode ? "dark" : "light" },
                    }}
                    series={[
                      Math.round(
                        (dashboardData.calorieIntake.totalCalories /
                          dashboardData.calorieGoal) *
                          100
                      ),
                      carbsPercentage,
                      proteinsPercentage,
                      fatsPercentage,
                    ]}
                    type="radialBar"
                    height={350}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center mb-4">
                <div>
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Grasas
                  </p>
                  <p className="text-sm text-[#ff9404] font-semibold">
                    {formatValue(dashboardData.calorieIntake.totalFats)}/
                    {fatsGoal}g
                  </p>
                </div>
                <div>
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Carbohidratos
                  </p>
                  <p className="text-sm text-[#8884d8] font-semibold">
                    {formatValue(dashboardData.calorieIntake.totalCarbs)}/
                    {carbsGoal}g
                  </p>
                </div>
                <div>
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Proteína
                  </p>
                  <p className="text-sm text-[#1E90FF] font-semibold">
                    {formatValue(dashboardData.calorieIntake.totalProteins)}/
                    {proteinsGoal}g
                  </p>
                </div>
                <div>
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Calorías
                  </p>
                  <p className="text-sm text-[#FF0000] font-semibold">
                    {formatValue(dashboardData.calorieIntake.totalCalories)}/
                    {dashboardData.calorieGoal} kcal
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
              className={`rounded-lg p-5 ${
                isDarkMode ? "bg-[#3B4252]" : "bg-white"
              } shadow-md`}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex justify-between items-center mb-4"
              >
                <div className="flex items-center space-x-2">
                  <h2
                    className={`text-sm font-semibold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Ingesta de Agua
                  </h2>
                  <ButtonToolTip content={infoText.waterIntake} />
                </div>
                <button
                  onClick={() => navigate("/water")}
                  className={`text-sm ${
                    isDarkMode
                      ? "text-[#ff9404] hover:text-[#e08503]"
                      : "text-orange-500 hover:text-orange-600"
                  } transition-colors duration-300`}
                >
                  Registrar
                </button>
              </motion.div>

              <div
                className={`rounded-lg p-4 mb-4 ${
                  isDarkMode ? "bg-[#4B5563]/50" : "bg-gray-50"
                }`}
              >
                <p
                  className={`text-base font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Consumido:{" "}
                  <span className="text-[#ff9404]">
                    {Math.round(dashboardData.waterIntake)} ml
                  </span>
                </p>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Meta:{" "}
                  <span className="font-medium">
                    {dashboardData.waterGoal
                      ? `${dashboardData.waterGoal} ml`
                      : "No establecida"}
                  </span>
                  {dashboardData.waterGoal
                    ? ` (${Math.min(
                        Math.round(
                          (dashboardData.waterIntake /
                            dashboardData.waterGoal) *
                            100
                        ),
                        100
                      )}% completado)`
                    : ""}
                </p>
              </div>

              <div className="flex items-center justify-center mb-4">
                <Droplets className="text-[#1E90FF] mr-2" size={24} />
                <div className="text-center">
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {Math.round(dashboardData.waterIntake)} ml /{" "}
                    {dashboardData.waterGoal || DEFAULT_WATER_GOAL_ML} ml
                  </p>
                </div>
              </div>

              <div
                className={`mt-4 rounded-full h-4 ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
              >
                <div
                  className="bg-[#1E90FF] h-4 rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.min(
                      (dashboardData.waterIntake /
                        (dashboardData.waterGoal || DEFAULT_WATER_GOAL_ML)) *
                        100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>

              <p
                className={`text-sm mt-4 text-center ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {getWaterMessage()}
              </p>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
              className={`rounded-lg p-5 ${
                isDarkMode ? "bg-[#3B4252]" : "bg-white"
              } shadow-md`}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex items-center space-x-2 mb-4"
              >
                <h2
                  className={`text-sm font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Ingesta Calórica - Resumen Semanal
                </h2>
                <ButtonToolTip content={infoText.weeklyCalories} />
              </motion.div>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={barData}
                  style={{
                    backgroundColor: isDarkMode ? "#3B4252" : "#ffffff",
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3"
                    stroke={isDarkMode ? "#4B5563" : "#e5e7eb"}
                  />
                  <XAxis
                    dataKey="date"
                    stroke={isDarkMode ? "#fff" : "#1f2937"}
                  />
                  <YAxis
                    stroke={isDarkMode ? "#fff" : "#1f2937"}
                    domain={[0, Math.ceil(dashboardData.calorieGoal * 1.1)]}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const dayNames = {
                          DO: "Domingo",
                          LU: "Lunes",
                          MA: "Martes",
                          MI: "Miércoles",
                          JU: "Jueves",
                          VI: "Viernes",
                          SA: "Sábado",
                        };
                        const dayName =
                          dayNames[label as keyof typeof dayNames] || label;
                        const fullDate = new Date(
                          data.fullDate + "T12:00:00"
                        ).toLocaleDateString("es-CO", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        });

                        const caloriesValue = payload[0].value as number;
                        const percentage = Math.round(
                          (caloriesValue / data.meta) * 100
                        );
                        const isOverGoal = caloriesValue > data.meta;

                        return (
                          <div
                            className={`custom-tooltip p-3 border border-[#ff9404] rounded-lg shadow-lg ${
                              isDarkMode ? "bg-[#282c3c]" : "bg-white"
                            }`}
                          >
                            <p
                              className={`font-bold ${
                                isDarkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {dayName}
                            </p>
                            <p
                              className={`text-xs mb-2 ${
                                isDarkMode ? "text-gray-300" : "text-gray-600"
                              }`}
                            >
                              {fullDate}
                            </p>
                            <p className="text-sm">
                              <span
                                className={
                                  isDarkMode ? "text-white" : "text-gray-900"
                                }
                              >
                                Calorías:
                              </span>{" "}
                              <span
                                className={`font-bold ${
                                  isOverGoal
                                    ? "text-orange-400"
                                    : "text-blue-400"
                                }`}
                              >
                                {caloriesValue.toFixed(0)}
                              </span>
                              <span
                                className={
                                  isDarkMode ? "text-white" : "text-gray-900"
                                }
                              >
                                {" "}
                                de{" "}
                              </span>
                              <span
                                className={
                                  isDarkMode ? "text-gray-300" : "text-gray-600"
                                }
                              >
                                {data.meta}
                              </span>
                            </p>
                            <p
                              className={`text-xs ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              {isOverGoal
                                ? `${percentage}% (exceso de ${(
                                    caloriesValue - data.meta
                                  ).toFixed(0)} cal)`
                                : `${percentage}% (${(
                                    data.meta - caloriesValue
                                  ).toFixed(0)} cal restantes)`}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                    cursor={{
                      fill: isDarkMode
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.05)",
                    }}
                  />
                  <Bar
                    dataKey="calories"
                    radius={[10, 10, 0, 0]}
                    isAnimationActive={true}
                    fill="#8884d8"
                  >
                    {barData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.calories >= dashboardData.calorieGoal
                            ? "#ff9404"
                            : "#8884d8"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div
                className={`flex justify-between items-center mt-4 text-xs ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded bg-[#ff9404] mr-2 mb-[0.5px]"></div>
                  <span>Por encima del objetivo</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded bg-[#8884d8] mr-2 mb-[0.5px]"></div>
                  <span>Por debajo del objetivo</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
              className={`rounded-lg p-5 ${
                isDarkMode ? "bg-[#3B4252]" : "bg-white"
              } shadow-md`}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="flex items-center space-x-2 mb-4"
              >
                <h2
                  className={`text-sm font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Distribución de Macronutrientes
                </h2>
                <ButtonToolTip content={infoText.macronutrients} />
              </motion.div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="mx-auto w-20 h-20 rounded-full border-4 border-[#8884d8] flex items-center justify-center mb-2">
                    <span className="text-lg font-bold text-[#8884d8]">
                      {carbsPercentage}%
                    </span>
                  </div>
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Carbohidratos
                  </p>
                  <p className="text-sm text-[#8884d8] font-semibold">
                    {formatValue(dashboardData.calorieIntake.totalCarbs)} g
                  </p>
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    {Math.round(dashboardData.calorieIntake.totalCarbs * 4)}{" "}
                    kcal
                  </p>
                </div>

                <div className="text-center">
                  <div className="mx-auto w-20 h-20 rounded-full border-4 border-[#1E90FF] flex items-center justify-center mb-2">
                    <span className="text-lg font-bold text-[#1E90FF]">
                      {proteinsPercentage}%
                    </span>
                  </div>
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Proteínas
                  </p>
                  <p className="text-sm text-[#1E90FF] font-semibold">
                    {formatValue(dashboardData.calorieIntake.totalProteins)} g
                  </p>
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    {Math.round(dashboardData.calorieIntake.totalProteins * 4)}{" "}
                    kcal
                  </p>
                </div>

                <div className="text-center">
                  <div className="mx-auto w-20 h-20 rounded-full border-4 border-[#ff9404] flex items-center justify-center mb-2">
                    <span className="text-lg font-bold text-[#ff9404]">
                      {fatsPercentage}%
                    </span>
                  </div>
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Grasas
                  </p>
                  <p className="text-sm text-[#ff9404] font-semibold">
                    {formatValue(dashboardData.calorieIntake.totalFats)} g
                  </p>
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    {Math.round(dashboardData.calorieIntake.totalFats * 9)} kcal
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Dashboard);
