// src/pages/RMProgressPage.tsx
import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import { supabase } from "../lib/supabaseClient";
import { exercises } from "../components/OneRepMaxCalculator";
import { motion } from "framer-motion";
import GalaxyBackground from "../components/GalaxyBackground";
import ButtonToolTip from "../components/ButtonToolTip";
import PersonalizedSuggestions from "../components/PersonalizedSuggestions";
import { useUserProfile } from "../hooks/useUserProfile";
import { useUserData } from "../hooks/useUserData";
import { useTheme } from "./ThemeContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const RMProgressPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { profile: userProfile } = useUserProfile();
  const { userData } = useUserData();
  const [selectedExercise, setSelectedExercise] = useState<string>(
    exercises[0]
  );
  const [unit, setUnit] = useState<"kg" | "lb">("kg");
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Función para convertir pesos entre kg y lb
  const convertWeight = (
    value: number,
    fromUnit: string,
    toUnit: "kg" | "lb"
  ): number => {
    const normalizedFromUnit = fromUnit?.toLowerCase().trim();

    if (normalizedFromUnit !== "kg" && normalizedFromUnit !== "lb") {
      console.warn(`Unidad inválida encontrada: ${fromUnit}. Asumiendo kg.`);
      return toUnit === "kg" ? value : Math.round(value / 0.453592);
    }

    if (normalizedFromUnit === toUnit) return value;

    return toUnit === "kg"
      ? Math.round(value * 0.453592)
      : Math.round(value / 0.453592);
  };

  // Función para alternar entre kg y lb
  const handleUnitChange = () => {
    setUnit((prevUnit) => (prevUnit === "kg" ? "lb" : "kg"));
  };

  useEffect(() => {
    const fetchRMProgress = async () => {
      setLoading(true);
      setError(null);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setError("Debes iniciar sesión para ver el progreso.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/1rm/progress`,
          {
            params: { email: user.email, exercise: selectedExercise },
          }
        );

        //console.log("Datos recibidos del backend:", response.data);
        const rmRecords = response.data.rmRecords || [];

        const convertedData = rmRecords.map((record: any) => {
          const convertedWeight = convertWeight(
            record.rm_maximo,
            record.unidad || "kg",
            unit
          );
          //console.log(
          //  `Convirtiendo ${record.rm_maximo} de ${
          //    record.unidad || "kg"
          //  } a ${unit}: ${convertedWeight}`
          //);
          return {
            ...record,
            rm_maximo: convertedWeight,
          };
        });

        const labels = convertedData.map((record: any) => record.fecha);
        const data = convertedData.map((record: any) => record.rm_maximo);
        //console.log("Datos para la gráfica:", { labels, data });

        setChartData({
          labels,
          datasets: [
            {
              label: `Progreso de 1RM - ${selectedExercise} (${unit})`,
              data,
              fill: false,
              borderColor: "#ff9404",
              backgroundColor: "rgba(255, 148, 4, 0.2)",
              borderWidth: 2,
              tension: 0.1,
              pointRadius: 5,
              pointHoverRadius: 7,
              pointBackgroundColor: "#ff9404",
            },
          ],
        });
      } catch (err) {
        setError("Error al cargar el progreso: " + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchRMProgress();
  }, [selectedExercise, unit]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          color: isDarkMode ? "#ffffff" : "#1f2937",
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
        },
      },
      title: {
        display: true,
        text: "Progreso del 1RM a lo largo del tiempo",
        color: isDarkMode ? "#ffffff" : "#1f2937",
        font: {
          size: window.innerWidth < 768 ? 14 : 18,
        },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: isDarkMode ? "#2D3242" : "#ffffff",
        titleColor: isDarkMode ? "#ffffff" : "#1f2937",
        bodyColor: isDarkMode ? "#ffffff" : "#1f2937",
        titleFont: {
          size: window.innerWidth < 768 ? 10 : 12,
        },
        bodyFont: {
          size: window.innerWidth < 768 ? 10 : 12,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Fecha",
          color: isDarkMode ? "#ffffff" : "#1f2937",
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
        },
        ticks: {
          color: isDarkMode ? "#ffffff" : "#1f2937",
          maxRotation: 0,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: window.innerWidth < 768 ? 5 : 10,
          font: {
            size: window.innerWidth < 768 ? 8 : 10,
          },
        },
        grid: {
          color: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
      },
      y: {
        title: {
          display: true,
          text: `1RM (${unit})`,
          color: isDarkMode ? "#ffffff" : "#1f2937",
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
        },
        ticks: {
          color: isDarkMode ? "#ffffff" : "#1f2937",
          beginAtZero: true,
          font: {
            size: window.innerWidth < 768 ? 8 : 10,
          },
        },
        grid: {
          color: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
      },
    },
  };

  const infoText = {
    progressRM:
      "Visualiza el progreso de tu repetición máxima para diferentes ejercicios a lo largo del tiempo. Esta gráfica te permite identificar tendencias y mejoras en tu fuerza.",
  };

  return (
    <div
      className={`relative z-0 min-h-screen w-full mt-4 sm:mt-0 transition-colors duration-300 ${
        isDarkMode ? "bg-[#282c3c]" : "bg-[#F8F9FA]"
      }`}
    >
      <GalaxyBackground />
      <div className="w-full px-4 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`max-w-4xl mx-auto p-5 sm:p-4 md:p-6 rounded-lg shadow-md relative z-10 ${
            isDarkMode ? "bg-[#3B4252]" : "bg-white"
          }`}
        >
          <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
            <h2
              className={`text-xl sm:text-2xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Progreso de 1RM
            </h2>
            <ButtonToolTip content={infoText.progressRM} />
          </div>

          <div className="mb-4 md:mb-6">
            <label
              htmlFor="exercise-select"
              className={`block text-sm sm:text-sm font-medium ${
                isDarkMode ? "text-white" : "text-gray-700"
              } mb-1`}
            >
              Selecciona un ejercicio:
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
              <select
                id="exercise-select"
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm border rounded-md focus:outline-none focus:border-[#ff9404] focus:ring-2 focus:ring-[#ff9404]/20 transition-all duration-300 ${
                  isDarkMode
                    ? "bg-[#2D3242] text-white border-gray-600"
                    : "bg-white text-gray-900 border-gray-300"
                }`}
              >
                {exercises.map((ex) => (
                  <option
                    key={ex}
                    value={ex}
                    className={`${
                      isDarkMode
                        ? "bg-[#2D3242] text-white"
                        : "bg-white text-gray-900"
                    }`}
                  >
                    {ex}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleUnitChange}
                className={`w-full sm:w-auto px-3 py-1.5 sm:py-2 text-sm font-medium rounded-md shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 ${
                  isDarkMode
                    ? "bg-gradient-to-br from-[#ff9404] to-[#e08503] text-white hover:from-[#e08503] hover:to-[#ff9404]"
                    : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
              >
                Cambiar a {unit === "kg" ? "lb" : "kg"}
              </button>
            </div>
          </div>

          {error && (
            <div
              className={`text-center p-3 sm:p-4 md:p-6 text-sm sm:text-base rounded-md mb-4 ${
                isDarkMode
                  ? "text-red-400 bg-red-400/10"
                  : "text-red-600 bg-red-100"
              }`}
            >
              {error}
            </div>
          )}

          <div className="h-64 sm:h-72 md:h-96 w-full">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div
                  className={`text-sm sm:text-base text-center ${
                    isDarkMode ? "text-white" : "text-gray-600"
                  }`}
                >
                  <svg
                    className="animate-spin h-8 w-8 text-[#ff9404] mx-auto mb-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Cargando gráfica...
                </div>
              </div>
            ) : chartData && chartData.datasets[0].data.length > 0 ? (
              <Line data={chartData} options={options} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p
                  className={`text-sm sm:text-base text-center ${
                    isDarkMode ? "text-white" : "text-gray-600"
                  } px-4`}
                >
                  No hay datos disponibles para este ejercicio.
                </p>
              </div>
            )}
          </div>

          <div
            className={`mt-4 text-center text-xs ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <p>
              Visualiza tu progreso a lo largo del tiempo para optimizar tus
              entrenamientos.
            </p>
          </div>
        </motion.div>

        {/* Sugerencias Personalizadas para Progreso */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="max-w-4xl mx-auto px-4 mt-6 relative z-10"
        >
          <PersonalizedSuggestions 
            userProfile={userProfile}
            context="rm_progress"
            maxSuggestions={3}
            showCategories={true}
            userData={userData}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default RMProgressPage;
