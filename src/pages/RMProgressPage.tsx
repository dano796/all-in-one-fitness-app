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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const RMProgressPage: React.FC = () => {
  const [selectedExercise, setSelectedExercise] = useState<string>(exercises[0]);
  const [unit, setUnit] = useState<"kg" | "lb">("kg");
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Función para convertir pesos entre kg y lb
  const convertWeight = (value: number, fromUnit: string, toUnit: "kg" | "lb"): number => {
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
        const { data: { user } } = await supabase.auth.getUser();
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

        console.log("Datos recibidos del backend:", response.data);
        const rmRecords = response.data.rmRecords || [];

        const convertedData = rmRecords.map((record: any) => {
          const convertedWeight = convertWeight(record.rm_maximo, record.unidad || "kg", unit);
          console.log(`Convirtiendo ${record.rm_maximo} de ${record.unidad || "kg"} a ${unit}: ${convertedWeight}`);
          return {
            ...record,
            rm_maximo: convertedWeight,
          };
        });

        const labels = convertedData.map((record: any) => record.fecha);
        const data = convertedData.map((record: any) => record.rm_maximo);
        console.log("Datos para la gráfica:", { labels, data });

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
          color: "#ffffff",
        },
      },
      title: {
        display: true,
        text: "Progreso del 1RM a lo largo del tiempo",
        color: "#ffffff",
        font: {
          size: 18,
        },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: "#2D3242",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Fecha",
          color: "#ffffff",
        },
        ticks: {
          color: "#ffffff",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      y: {
        title: {
          display: true,
          text: `1RM (${unit})`,
          color: "#ffffff",
        },
        ticks: {
          color: "#ffffff",
          beginAtZero: true,
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
  };

  return (
    <div className="relative z-0">
      <GalaxyBackground />
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="max-w-4xl mx-auto p-6 bg-[#3B4252] rounded-lg shadow-md relative z-10"
    >
      
      <h2 className="text-2xl font-bold mb-4 text-white">Progreso de 1RM</h2>
      
          <div className="mb-6">
              <label htmlFor="exercise-select" className="block text-sm font-medium text-white mb-1">
                  Selecciona un ejercicio:
              </label>
              <div className="flex items-center space-x-4">
                  <select
                      id="exercise-select"
                      value={selectedExercise}
                      onChange={(e) => setSelectedExercise(e.target.value)}
                      className="w-full px-3 py-2 bg-[#2D3242] text-white border border-gray-600 rounded-md focus:outline-none focus:border-[#ff9404] focus:ring-2 focus:ring-[#ff9404]/20 transition-all duration-300 sm:text-sm sm:px-2.5 sm:py-1.5"
                  >
                      {exercises.map((ex) => (
                          <option key={ex} value={ex} className="bg-[#2D3242] text-white">
                              {ex}
                          </option>
                      ))}
                  </select>
                  <button
                      type="button"
                      onClick={handleUnitChange}
                      className="bg-gradient-to-br from-[#ff9404] to-[#e08503] text-white border-none rounded-sm shadow-[0_0_5px_rgba(255,148,4,0.3)] hover:bg-gradient-to-br hover:from-[#e08503] hover:to-[#ff9404] hover:shadow-[0_0_10px_rgba(255,148,4,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 leading-none sm:text-[0.65rem] sm:px-1.5 sm:py-0.5 text-[0.6rem] px-1 py-0.5"
                  >
                      {unit}
                  </button>
              </div>
          </div>

      {error && <div className="text-red-400 text-center p-6">{error}</div>}

      <div className="h-96 w-full">
        {loading ? (
          <div className="text-white text-center p-6">Cargando gráfica...</div>
        ) : chartData && chartData.datasets[0].data.length > 0 ? (
          <Line data={chartData} options={options} />
        ) : (
          <p className="text-white text-center">No hay datos disponibles para este ejercicio.</p>
        )}
      </div>
    </motion.div>
    </div>
  );
};

export default RMProgressPage;