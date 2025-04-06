import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Droplets, Activity, Utensils } from "lucide-react";
import GalaxyBackground from "../components/GalaxyBackground";
import { Doughnut } from "react-chartjs-2";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState<string>(todayStr);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [caloriesData, setCaloriesData] = useState({
    consumed: 0,
    goal: 2000,
  });
  const [hydrationData, setHydrationData] = useState({
    consumed: 0,
    goal: 2000,
  });
  const [activityData, setActivityData] = useState({
    steps: 0,
    goal: 10000,
  });

  useEffect(() => {
    const fetchData = async () => {
      setCaloriesData({ consumed: 1500, goal: 2000 });
      setHydrationData({ consumed: 1200, goal: 2000 });
      setActivityData({ steps: 8000, goal: 10000 });
    };
    fetchData();
  }, [date]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };

  const handleDatePicker = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };

  return (
    <div className="relative p-4 left-8 space-y-6 bg-[#282c3c] min-h-screen overflow-hidden">
      <GalaxyBackground />

      {/* Selector de Fecha */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center"
      >
        <button
          onClick={handleDatePicker}
          className="min-w-[120px] px-4 py-3 bg-gradient-to-br from-[#2D3242] to-[#3B4252] text-gray-200 font-semibold rounded-lg border border-[#ff9404] shadow-md hover:scale-105 transition-all"
        >
          {new Date(date).toLocaleDateString("es-CO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </button>
        <input
          type="date"
          ref={dateInputRef}
          value={date}
          onChange={handleDateChange}
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
        />
      </motion.div>

      {/* Resumen General */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-4" 
      >
        {/* Calorías */}
        <div className="bg-[#3B4252] rounded-lg p-2 text-center scale-75">
          <Plus className="h-7 w-7 text-[#ff9404] mx-auto" /> 
          <h3 className="text-sm font-semibold text-white">Calorías</h3>
          <Doughnut
            data={{
              datasets: [
                {
                  data: [caloriesData.consumed, caloriesData.goal - caloriesData.consumed],
                  backgroundColor: ["#ff9404", "#4B5563"],
                },
              ],
            }}
            options={{ cutout: "80%", plugins: { legend: { display: false } } }}
          />
          <p className="text-xs text-gray-400 mt-1"> 
            {caloriesData.consumed}/{caloriesData.goal} kcal
          </p>
        </div>

        {/* Hidratación */}
        <div className="bg-[#3B4252] rounded-lg p-3 text-center scale-75">
          <h3 className="text-sm font-semibold text-white">Hidratación</h3>
          <Droplets className="h-7 w-7 text-[#ff9404] mx-auto" />
          <p className="text-xs text-gray-400 mt-1"> 
            {hydrationData.consumed}/{hydrationData.goal} ml
          </p>
        </div>

        {/* Actividad */}
        <div className="bg-[#3B4252] rounded-lg p-3 text-center scale-75">
          <h3 className="text-sm font-semibold text-white">Actividad</h3>
          <Activity className="h-7 w-7 text-[#ff9404] mx-auto" />
          <p className="text-xs text-gray-400 mt-1">
            {activityData.steps}/{activityData.goal} pasos
          </p>
        </div>
      </motion.div>

      {/* Detalles por Módulo */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
        className="space-y-3" // Reduce el espacio entre los módulos
      >
        {/* Calorías */}
        <div className="bg-[#3B4252] rounded-lg p-3 scale-90"> {/* Reduce padding y escala */}
          <h3 className="text-sm font-semibold text-white">Detalles de Calorías</h3>
          <p className="text-xs text-gray-400 mt-1"> {/* Reduce el margen inferior */}
            Consumido: {caloriesData.consumed} kcal
          </p>
        </div>

        {/* Hidratación */}
        <div className="bg-[#3B4252] rounded-lg p-3 scale-90"> {/* Reduce padding y escala */}
          <h3 className="text-sm font-semibold text-white">Detalles de Hidratación</h3>
          <p className="text-xs text-gray-400 mt-1"> {/* Reduce el margen inferior */}
            Consumido: {hydrationData.consumed} ml
          </p>
        </div>

        {/* Actividad */}
        <div className="bg-[#3B4252] rounded-lg p-3 scale-90"> {/* Reduce padding y escala */}
          <h3 className="text-sm font-semibold text-white">Detalles de Actividad</h3>
          <p className="text-xs text-gray-400 mt-1"> {/* Reduce el margen inferior */}
            Pasos: {activityData.steps}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default React.memo(Dashboard);