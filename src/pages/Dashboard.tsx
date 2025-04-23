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

// Define interfaces for the data structure
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

<DashboardSkeleton />;

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const TIMEZONE = "America/Bogota";
  const today = new Date();
  const todayStr = today.toLocaleDateString("en-CA", { timeZone: TIMEZONE });
  const TOTAL_WATER_UNITS = 8;
  const WATER_PER_UNIT = 250;
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
  });
  const [foodData, setFoodData] = useState<FoodsResponse>({
    foods: { Desayuno: [], Almuerzo: [], Merienda: [], Cena: [] },
    currentFoodType: null,
    isToday: false,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for date selection
  const [date, setDate] = useState<string>(todayStr);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [filledWaterUnits, setFilledWaterUnits] = useState<number>(0);

  // Verificar autenticación al montar el componente
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

  // Calculate date range based on selected date
  useEffect(() => {
    const calculateDateRange = () => {
      const selectedDate = new Date(date);

      // Find the start of the week (Sunday)
      const start = new Date(selectedDate);
      const dayOfWeek = start.getDay();
      start.setDate(start.getDate() - dayOfWeek);

      // End of the week (Saturday)
      const end = new Date(start);
      end.setDate(end.getDate() + 6);

      // Set start and end dates
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

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userEmail || !startDate || !endDate) return;
      setIsLoading(true);

      try {
        // Usar Promise.all para realizar todas las peticiones en paralelo
        const [dashboardRes, foodsRes, goalRes, waterRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/dashboard`, {
            params: { email: userEmail, startDate, endDate },
          }),
          axios.get<FoodsResponse>(
            `${import.meta.env.VITE_BACKEND_URL}/api/foods/user`,
            { params: { email: userEmail, date: date } }
          ),
          axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/get-calorie-goal`,
            { params: { email: userEmail } }
          ),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/water/user`, {
            params: { email: userEmail, date: date },
          }),
        ]);

        const updatedDashboardData = { ...dashboardRes.data };

        // Update calorie goal if available
        if (goalRes.data.calorieGoal) {
          updatedDashboardData.calorieGoal = goalRes.data.calorieGoal;
        }

        // Update water intake data
        if (waterRes.data) {
          updatedDashboardData.waterIntake =
            (waterRes.data.aguasllenadas || 0) * WATER_PER_UNIT;
          setFilledWaterUnits(waterRes.data.aguasllenadas || 0);
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
  }, [userEmail, startDate, endDate, date]);

  // Calculate nutritional totals from food data
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

      // Update nutrition data based on the selected date's food
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

  // Helper functions for date handling
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

  // Format values to 2 decimal places for display
  const formatValue = (value: number) => value.toFixed(2);

  // Calculate macronutrient goals based on calorie goal
  const carbsGoal = Math.round((dashboardData.calorieGoal * 0.4) / 4); // 40% from carbs, 4 calories per gram
  const proteinsGoal = Math.round((dashboardData.calorieGoal * 0.3) / 4); // 30% from protein, 4 calories per gram
  const fatsGoal = Math.round((dashboardData.calorieGoal * 0.3) / 9); // 30% from fat, 9 calories per gram

  const carbsCalories = dashboardData.calorieIntake.totalCarbs;
  const proteinCalories = dashboardData.calorieIntake.totalProteins;
  const fatCalories = dashboardData.calorieIntake.totalFats;

  const carbsPercentage = Math.round((carbsCalories / carbsGoal) * 100);
  const proteinsPercentage = Math.round((proteinCalories / proteinsGoal) * 100);
  const fatsPercentage = Math.round((fatCalories / fatsGoal) * 100);

  // Prepare data for the BarChart (ensure all days of the week are displayed)
  const prepareWeeklyData = () => {
    const weekDays: {
      fullDate: string;
      date: string;
      calories: number;
      meta: number;
    }[] = [];
    const startDateObj = new Date(startDate);

    // Create array with all days of the week
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDateObj);
      currentDate.setDate(startDateObj.getDate() + i);
      const dateStr = currentDate.toLocaleDateString("en-CA", {
        timeZone: TIMEZONE,
      });

      weekDays.push({
        fullDate: dateStr,
        date: currentDate.toLocaleDateString("es-CO", { weekday: "short" }),
        calories: 0,
        meta: dashboardData.calorieGoal,
      });
    }

    // Fill in actual calorie data where available
    dashboardData.calorieIntake.dailyBreakdown.forEach((day) => {
      const index = weekDays.findIndex((d) => d.fullDate === day.date);
      if (index !== -1) {
        weekDays[index].calories = Number(formatValue(day.calories));
      }
    });

    return weekDays;
  };

  const barData = prepareWeeklyData();

  // Calculate water intake percentage
  const waterGoal = TOTAL_WATER_UNITS * WATER_PER_UNIT;
  const waterPercentage = Math.min(
    (dashboardData.waterIntake / waterGoal) * 100,
    100
  );

  // Get message based on water completion
  const getWaterMessage = () => {
    if (filledWaterUnits === TOTAL_WATER_UNITS) {
      return "¡Meta alcanzada! Eres un maestro del agua 💧";
    } else {
      return "¡Sigue así, cada gota cuenta!";
    }
  };

  // Information text for tooltips
  const infoText = {
    calorieIntake:
      "Muestra la ingesta calórica diaria y los macronutrientes (carbohidratos, proteínas y grasas) consumidos en relación con tus objetivos personalizados.",
    waterIntake:
      "Rastrea tu consumo diario de agua. La meta es consumir 8 vasos de agua de 250 ml cada uno (2000 ml en total) para mantenerte bien hidratado.",
    weeklyCalories:
      "Visualiza tu patrón de consumo calórico a lo largo de la semana actual, comparándolo con tu objetivo diario establecido.",
    macronutrients:
      "Muestra la distribución de macronutrientes (carbohidratos, proteínas y grasas) en tu dieta del día actual, con porcentajes de cumplimiento respecto a tus objetivos.",
  };

  return (
    <div className="relative p-4 space-y-6 bg-[#282c3c] min-h-screen overflow-hidden -mt-12">
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
          className="mb-2 text-xs text-gray-400"
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

      {/* Contenedor Principal con Grid */}
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
          {/* Columna Izquierda: Ingesta Calórica y Agua */}
          <div className="space-y-6">
            {/* Ingesta Calórica */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="bg-[#3B4252] rounded-lg p-5"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex justify-between items-center mb-4"
              >
                <div className="flex items-center space-x-2">
                  <h2 className="text-sm font-semibold text-white">
                    Ingesta Calórica
                  </h2>
                  <ButtonToolTip content={infoText.calorieIntake} />
                </div>
                <button
                  onClick={() => navigate("/foodDashboard")}
                  className="text-sm text-[#ff9404] hover:text-[#e08503] transition-colors duration-300"
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
                        background: "#3B4252",
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
                              color: "#fff",
                            },
                            value: {
                              fontSize: "16px",
                              color: "#fff",
                            },
                            total: {
                              show: true,
                              label: "Total Calorías",
                              color: "#fff",
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
                      theme: {
                        mode: "dark",
                      },
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
                  <p className="text-xs text-gray-400">Grasas</p>
                  <p className="text-sm text-[#ff9404] font-semibold">
                    {formatValue(dashboardData.calorieIntake.totalFats)}/
                    {fatsGoal}g
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Carbohidratos</p>
                  <p className="text-sm text-[#8884d8] font-semibold">
                    {formatValue(dashboardData.calorieIntake.totalCarbs)}/
                    {carbsGoal}g
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Proteína</p>
                  <p className="text-sm text-[#1E90FF] font-semibold">
                    {formatValue(dashboardData.calorieIntake.totalProteins)}/
                    {proteinsGoal}g
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Calorías</p>
                  <p className="text-sm text-[#FF0000] font-semibold">
                    {formatValue(dashboardData.calorieIntake.totalCalories)}/
                    {dashboardData.calorieGoal} kcal
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Water Intake */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
              className="bg-[#3B4252] rounded-lg p-5"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex justify-between items-center mb-4"
              >
                <div className="flex items-center space-x-2">
                  <h2 className="text-sm font-semibold text-white">
                    Ingesta de Agua
                  </h2>
                  <ButtonToolTip content={infoText.waterIntake} />
                </div>
                <button
                  onClick={() => navigate("/water")}
                  className="text-sm text-[#ff9404] hover:text-[#e08503] transition-colors duration-300"
                >
                  Registrar
                </button>
              </motion.div>

              <div className="bg-[#4B5563]/50 rounded-lg p-4 mb-4">
                <p className="text-base font-semibold text-white">
                  Consumido:{" "}
                  <span className="text-[#ff9404]">
                    {Math.round(dashboardData.waterIntake)} ml
                  </span>
                </p>
                <p className="text-sm text-gray-400">
                  {waterPercentage.toFixed(0)}% de tu meta
                </p>
              </div>

              <div className="flex items-center justify-center mb-4">
                <Droplets className="text-[#1E90FF] mr-2" size={24} />
                <div className="text-center">
                  <p className="text-sm text-white">
                    {Math.round(dashboardData.waterIntake)} ml / {waterGoal} ml
                  </p>
                </div>
              </div>

              <div className="mt-4 bg-gray-700 rounded-full h-4">
                <div
                  className="bg-[#1E90FF] h-4 rounded-full transition-all duration-1000"
                  style={{
                    width: `${waterPercentage}%`,
                  }}
                ></div>
              </div>

              <p className="text-sm text-gray-400 mt-4 text-center">
                {getWaterMessage()}
              </p>
            </motion.div>
          </div>

          {/* Columna Derecha: Gráficos */}
          <div className="space-y-6">
            {/* Ingesta Calórica - Resumen Semanal */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
              className="bg-[#3B4252] rounded-lg p-5"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex items-center space-x-2 mb-4"
              >
                <h2 className="text-sm font-semibold text-white">
                  Ingesta Calórica - Resumen Semanal
                </h2>
                <ButtonToolTip content={infoText.weeklyCalories} />
              </motion.div>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} style={{ backgroundColor: "#3B4252" }}>
                  <CartesianGrid strokeDasharray="3" stroke="#4B5563" />
                  <XAxis dataKey="date" stroke="#fff" />
                  <YAxis
                    stroke="#fff"
                    domain={[0, Math.ceil(dashboardData.calorieGoal * 1.1)]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#3B4252",
                      border: "1px solid #ff9404",
                      borderRadius: "4px",
                      color: "#fff",
                    }}
                    cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
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

              <div className="flex justify-between items-center mt-4 text-xs text-gray-400">
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

            {/* Distribución de Macronutrientes */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
              className="bg-[#3B4252] rounded-lg p-5"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="flex items-center space-x-2 mb-4"
              >
                <h2 className="text-sm font-semibold text-white">
                  Distribución de Macronutrientes
                </h2>
                <ButtonToolTip content={infoText.macronutrients} />
              </motion.div>

              <div className="grid grid-cols-3 gap-4">
                {/* Carbohidratos */}
                <div className="text-center">
                  <div className="mx-auto w-20 h-20 rounded-full border-4 border-[#8884d8] flex items-center justify-center mb-2">
                    <span className="text-lg font-bold text-[#8884d8]">
                      {carbsPercentage}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">Carbohidratos</p>
                  <p className="text-sm text-[#8884d8] font-semibold">
                    {formatValue(dashboardData.calorieIntake.totalCarbs)} g
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.round(dashboardData.calorieIntake.totalCarbs * 4)}{" "}
                    kcal
                  </p>
                </div>

                {/* Proteínas */}
                <div className="text-center">
                  <div className="mx-auto w-20 h-20 rounded-full border-4 border-[#1E90FF] flex items-center justify-center mb-2">
                    <span className="text-lg font-bold text-[#1E90FF]">
                      {proteinsPercentage}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">Proteínas</p>
                  <p className="text-sm text-[#1E90FF] font-semibold">
                    {formatValue(dashboardData.calorieIntake.totalProteins)} g
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.round(dashboardData.calorieIntake.totalProteins * 4)}{" "}
                    kcal
                  </p>
                </div>

                {/* Grasas */}
                <div className="text-center">
                  <div className="mx-auto w-20 h-20 rounded-full border-4 border-[#ff9404] flex items-center justify-center mb-2">
                    <span className="text-lg font-bold text-[#ff9404]">
                      {fatsPercentage}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">Grasas</p>
                  <p className="text-sm text-[#ff9404] font-semibold">
                    {formatValue(dashboardData.calorieIntake.totalFats)} g
                  </p>
                  <p className="text-xs text-gray-500">
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
