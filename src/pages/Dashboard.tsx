import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Droplets } from "lucide-react";
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import axios from 'axios';
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import GalaxyBackground from "../components/GalaxyBackground";

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

interface DashboardProps {
  user: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const TIMEZONE = "America/Bogota";
  const today = new Date();
  const todayStr = today.toLocaleDateString("en-CA", { timeZone: TIMEZONE });

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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for date selection
  const [dateOption, setDateOption] = useState<string>("Hoy");
  const [nValue, setNValue] = useState<number>(1);
  const [tempNValue, setTempNValue] = useState<string>("1");
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(todayStr);

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

  // Calculate date range based on selected option
  useEffect(() => {
    const calculateDateRange = () => {
      const end = new Date(today);
      const start = new Date(today);

      switch (dateOption) {
        case "Hoy":
          setStartDate(start.toLocaleDateString("en-CA", { timeZone: TIMEZONE }));
          setEndDate(end.toLocaleDateString("en-CA", { timeZone: TIMEZONE }));
          break;
        case "Última semana":
          start.setDate(start.getDate() - 7);
          setStartDate(start.toLocaleDateString("en-CA", { timeZone: TIMEZONE }));
          setEndDate(end.toLocaleDateString("en-CA", { timeZone: TIMEZONE }));
          break;
        case "Último mes":
          start.setMonth(start.getMonth() - 1);
          setStartDate(start.toLocaleDateString("en-CA", { timeZone: TIMEZONE }));
          setEndDate(end.toLocaleDateString("en-CA", { timeZone: TIMEZONE }));
          break;
        case "Últimos N meses":
          start.setMonth(start.getMonth() - nValue);
          setStartDate(start.toLocaleDateString("en-CA", { timeZone: TIMEZONE }));
          setEndDate(end.toLocaleDateString("en-CA", { timeZone: TIMEZONE }));
          break;
        case "Último año":
          start.setFullYear(start.getFullYear() - 1);
          setStartDate(start.toLocaleDateString("en-CA", { timeZone: TIMEZONE }));
          setEndDate(end.toLocaleDateString("en-CA", { timeZone: TIMEZONE }));
          break;
        case "Últimos N años":
          start.setFullYear(start.getFullYear() - nValue);
          setStartDate(start.toLocaleDateString("en-CA", { timeZone: TIMEZONE }));
          setEndDate(end.toLocaleDateString("en-CA", { timeZone: TIMEZONE }));
          break;
        default:
          setStartDate(start.toLocaleDateString("en-CA", { timeZone: TIMEZONE }));
          setEndDate(end.toLocaleDateString("en-CA", { timeZone: TIMEZONE }));
      }
    };

    calculateDateRange();
  }, [dateOption, nValue]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userEmail || !startDate || !endDate) return;
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/dashboard', {
          params: { email: userEmail, startDate, endDate },
        });
        setDashboardData(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError("Error al obtener los datos del dashboard.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [userEmail, startDate, endDate]);

  // Format values to 2 decimal places for display
  const formatValue = (value: number) => value.toFixed(2);

  // Log totalCarbs to debug
  console.log("totalCarbs:", dashboardData.calorieIntake.totalCarbs);

  // Normalize the data for the RadialBarChart (convert to percentage)
  const carbsUv = (dashboardData.calorieIntake.totalCarbs / 232) * 100;
  console.log("Carbs UV (should be ~23.1 for 53.62/232g):", carbsUv);

  const radialData = [
    { name: 'Grasas', uv: (dashboardData.calorieIntake.totalFats / 77) * 100, pv: 100, fill: '#ff9404', rawValue: dashboardData.calorieIntake.totalFats, maxValue: 77 }, // Innermost (orange)
    { name: 'Carbohidratos', uv: carbsUv, pv: 100, fill: '#8884d8', rawValue: dashboardData.calorieIntake.totalCarbs, maxValue: 232 }, // Second (purple)
    { name: 'Proteína', uv: (dashboardData.calorieIntake.totalProteins / 174) * 100, pv: 100, fill: '#1E90FF', rawValue: dashboardData.calorieIntake.totalProteins, maxValue: 174 }, // Third (blue)
    { name: 'Calorías', uv: (dashboardData.calorieIntake.totalCalories / dashboardData.calorieGoal) * 100, pv: 100, fill: '#FF0000', rawValue: dashboardData.calorieIntake.totalCalories, maxValue: dashboardData.calorieGoal }, // Outermost (red)
  ];

  // Log the radialData to debug
  //console.log("radialData:", radialData);

  // Data for the BarChart (daily calorie intake)
  const barData = dashboardData.calorieIntake.dailyBreakdown.map((day) => ({
    date: new Date(day.date).toLocaleDateString("es-CO", { weekday: "short" }),
    calories: Number(formatValue(day.calories)),
  }));

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const newValue = Number(tempNValue);
      if (newValue >= 1) {
        setNValue(newValue);
      } else {
        setTempNValue("1");
        setNValue(1);
      }
    }
  };

  // Handle "Enviar" button click to update nValue
  const handleSubmit = () => {
    const newValue = Number(tempNValue);
    if (newValue >= 1) {
      setNValue(newValue);
    } else {
      setTempNValue("1"); // Reset to 1 if invalid
      setNValue(1);
    }
  };

  if (isLoading) {
    return <div className="relative min-h-screen flex items-center justify-center bg-[#282c3c]"><GalaxyBackground /><span className="text-white">Cargando...</span></div>;
  }

  return (
    <div className="relative p-4 space-y-6 bg-[#282c3c] min-h-screen overflow-hidden -mt-12">
      <GalaxyBackground />

      {/* Selector de Período */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex justify-center space-x-4 mb-6"
      >
        <select
          value={dateOption}
          onChange={(e) => setDateOption(e.target.value)}
          className="px-6 py-3 bg-gradient-to-br from-[#2D3242] to-[#3B4252] text-gray-200 font-semibold rounded-lg border border-[#ff9404] shadow-[0_0_10px_rgba(255,148,4,0.3)] hover:bg-gradient-to-br hover:from-[#3B4252] hover:to-[#4B5563] hover:shadow-[0_0_15px_rgba(255,148,4,0.5)] transition-all duration-300"
        >
          <style>
            {`
              select option {
                background-color: #4B5563;
                color: #fff;
              }
            `}
          </style>
          <option value="Hoy">Hoy</option>
          <option value="Última semana">Última semana</option>
          <option value="Último mes">Último mes</option>
          <option value="Últimos N meses">Últimos N meses</option>
          <option value="Último año">Último año</option>
          <option value="Últimos N años">Últimos N años</option>
        </select>

        {(dateOption === "Últimos N meses" || dateOption === "Últimos N años") && (
          <div className="flex space-x-2">
            <input
              type="number"
              value={tempNValue}
              onChange={(e) => setTempNValue(e.target.value)}
              onKeyPress={handleKeyPress}
              min="1"
              className="px-6 py-3 bg-gradient-to-br from-[#2D3242] to-[#3B4252] text-gray-200 font-semibold rounded-lg border border-[#ff9404] shadow-[0_0_10px_rgba(255,148,4,0.3)] hover:bg-gradient-to-br hover:from-[#3B4252] hover:to-[#4B5563] hover:shadow-[0_0_15px_rgba(255,148,4,0.5)] transition-all duration-300 w-24"
              placeholder="N"
            />
            <button
              onClick={handleSubmit}
              className="px-4 py-3 bg-gradient-to-br from-[#2D3242] to-[#3B4252] text-gray-200 font-semibold rounded-lg border border-[#ff9404] shadow-[0_0_10px_rgba(255,148,4,0.3)] hover:bg-gradient-to-br hover:from-[#3B4252] hover:to-[#4B5563] hover:shadow-[0_0_15px_rgba(255,148,4,0.5)] transition-all duration-300"
            >
              Enviar
            </button>
          </div>
        )}
      </motion.div>

      {/* Contenedor Principal con Grid */}
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
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex justify-between items-center mb-4"
            >
              <h2 className="text-sm font-semibold text-white">Ingesta Calórica</h2>
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

            <div className="flex justify-center mb-4">
              <ResponsiveContainer width="100%" height={300}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="20%"
                  outerRadius="90%"
                  barSize={15}
                  data={radialData}
                  style={{ backgroundColor: '#3B4252' }}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar
                    background={{ fill: '#4B5563' }}
                    dataKey="uv"
                    cornerRadius={20}
                  />
                  <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" align="center" />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-400">Grasas</p>
                <p className="text-sm text-[#ff9404] font-semibold">{formatValue(dashboardData.calorieIntake.totalFats)}/{77}g</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Carbohidratos</p>
                <p className="text-sm text-[#8884d8] font-semibold">{formatValue(dashboardData.calorieIntake.totalCarbs)}/{232}g</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Proteína</p>
                <p className="text-sm text-[#1E90FF] font-semibold">{formatValue(dashboardData.calorieIntake.totalProteins)}/{174}g</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Calorías</p>
                <p className="text-sm text-[#FF0000] font-semibold">{formatValue(dashboardData.calorieIntake.totalCalories)}/{dashboardData.calorieGoal} kcal</p>
              </div>
            </div>
          </motion.div>

          {/* Display Water Intake */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 1.0 }}
            className="bg-[#3B4252] rounded-lg p-5"
          >
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="text-sm font-semibold text-white mb-4"
            >
              Ingesta de Agua
            </motion.h2>
            <div className="flex items-center justify-center space-x-3">
              <Droplets className="text-[#ff9404]" />
              <p className="text-sm text-white">{formatValue(dashboardData.waterIntake)} ml</p>
            </div>
          </motion.div>
        </div>

        {/* Columna Derecha: Gráficos */}
        <div className="space-y-6">
          {/* Ingesta Calórica - Rango Seleccionado */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 1.2 }}
            className="bg-[#3B4252] rounded-lg p-5"
          >
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4, duration: 0.5 }}
              className="text-sm font-semibold text-white mb-4"
            >
              Ingesta Calórica - Rango Seleccionado
            </motion.h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={barData}
                style={{ backgroundColor: '#3B4252' }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis dataKey="date" stroke="#fff" />
                <YAxis stroke="#fff" domain={[0, dashboardData.calorieGoal * 1.1]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#3B4252", border: "none", color: "#fff" }}
                  cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
                />
                <Bar
                  dataKey="calories"
                  fill="#ff9404"
                  radius={[10, 10, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Display Calorie Goal */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 1.4 }}
            className="bg-[#3B4252] rounded-lg p-5"
          >
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.6, duration: 0.5 }}
              className="text-sm font-semibold text-white mb-4"
            >
              Meta de Calorías
            </motion.h2>
            <div className="text-center">
              <p className="text-sm text-[#FF0000] font-semibold">{formatValue(dashboardData.calorieGoal)} kcal</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Dashboard);