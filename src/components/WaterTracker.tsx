import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSpring, animated } from "react-spring";
import Botella25 from "../assets/botella25.png";
import Botella75 from "../assets/botella75.png";
import Botella100 from "../assets/botella100.png";
import BotellaVacia from "../assets/botellaagua.png";
import GalaxyBackground from "../components/GalaxyBackground";
import axios from "axios";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ButtonToolTip from "../components/ButtonToolTip";
import { useTheme } from "../pages/ThemeContext";

const preloadImages = [BotellaVacia, Botella25, Botella75, Botella100];
preloadImages.forEach((src) => {
  const img = new Image();
  img.src = src;
});

const TIMEZONE = "America/Bogota";
const DEFAULT_WATER_GOAL_ML = 2000; // Meta predeterminada en ml
const DEFAULT_UNITS_PER_BOTTLE = 250; // ml por botella
const DEFAULT_BOTTLE_SIZE = 500; // Tamaño predeterminado de botella en ml
const BOTTLE_SIZE_OPTIONS = [250, 350, 500, 750, 1000]; // Opciones de tamaño de botella en ml

const WaterUnit: React.FC<{ stage: number }> = ({ stage }) => {
  const fillSpring = useSpring({
    stage,
    from: { stage: 0 },
    config: { tension: 500, friction: 10 },
  });

  const opacity25 = useSpring({
    opacity: stage >= 1 ? 1 : 0,
    config: { tension: 500, friction: 10 },
    delay: 0,
  });

  const opacity75 = useSpring({
    opacity: stage >= 2 ? 1 : 0,
    config: { tension: 500, friction: 10 },
    delay: 0,
  });

  const opacity100 = useSpring({
    opacity: stage >= 3 ? 1 : 0,
    config: { tension: 500, friction: 10 },
    delay: 0,
  });

  return (
    <div className="relative w-10 h-24 sm:w-12 sm:h-28 mx-2">
      <img
        src={BotellaVacia}
        alt="Botella vacía"
        className="absolute w-full h-full object-contain"
      />
      <animated.img
        src={Botella25}
        alt="Botella 25% llena"
        className="absolute w-full h-full object-contain"
        style={{
          opacity: opacity25.opacity,
          display: fillSpring.stage.to((s) => (s >= 1 ? "block" : "none")),
        }}
      />
      <animated.img
        src={Botella75}
        alt="Botella 75% llena"
        className="absolute w-full h-full object-contain"
        style={{
          opacity: opacity75.opacity,
          display: fillSpring.stage.to((s) => (s >= 2 ? "block" : "none")),
        }}
      />
      <animated.img
        src={Botella100}
        alt="Botella 100% llena"
        className="absolute w-full h-full object-contain"
        style={{
          opacity: opacity100.opacity,
          display: fillSpring.stage.to((s) => (s >= 3 ? "block" : "none")),
        }}
      />
    </div>
  );
};

interface WaterGoal {
  goalMl: number;
  unitsPerBottle: number;
}

const WaterTracker: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const todayStr = new Date().toLocaleDateString("en-CA", {
    timeZone: TIMEZONE,
  });
  const [date, setDate] = useState<string>(todayStr);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [filledWaterUnits, setFilledWaterUnits] = useState<number>(0);
  const [waterGoal, setWaterGoal] = useState<WaterGoal>({
    goalMl: DEFAULT_WATER_GOAL_ML,
    unitsPerBottle: DEFAULT_UNITS_PER_BOTTLE,
  });
  const [showGoalSetting, setShowGoalSetting] = useState<boolean>(false);
  const [goalInput, setGoalInput] = useState<string>("");
  const [goalUnit, setGoalUnit] = useState<"ml" | "lt">("ml");
  const [waterUnitStages, setWaterUnitStages] = useState<number[]>([]);
  const [isToday, setIsToday] = useState<boolean>(true);

  // Nuevos estados para manejar el tamaño de la botella
  const [bottleSize, setBottleSize] = useState<number>(DEFAULT_BOTTLE_SIZE);
  const [showBottleSetting, setShowBottleSetting] = useState<boolean>(false);
  const [selectedBottleSize, setSelectedBottleSize] =
    useState<number>(DEFAULT_BOTTLE_SIZE);
  const [customBottleSize, setCustomBottleSize] = useState<string>("");
  const [useCustomSize, setUseCustomSize] = useState<boolean>(false);

  const totalWaterUnits =
    Math.ceil(waterGoal.goalMl / waterGoal.unitsPerBottle) || 1;

  const checkAuth = useCallback(async () => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      setError("Debes iniciar sesión para ver el tracker de agua.");
      navigate("/login");
    } else {
      const email = user.email || "";
      setUserEmail(email);
    }
  }, [navigate]);

  const fetchWaterData = useCallback(async () => {
    if (!userEmail || !date) return;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/water/user`,
        {
          params: { email: userEmail, date: date },
        }
      );
      const aguasllenadas = response.data.aguasllenadas || 0;
      setFilledWaterUnits(aguasllenadas);

      // También recuperamos el tamaño de botella si está disponible en la respuesta
      if (response.data.tamano_botella && response.data.tamano_botella > 0) {
        const bottleSizeFromData = response.data.tamano_botella;
        setBottleSize(bottleSizeFromData);
        setSelectedBottleSize(bottleSizeFromData);
        setWaterGoal((prev) => ({
          ...prev,
          unitsPerBottle: bottleSizeFromData,
        }));
      }

      const goalResponse = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/water/get-goal`,
        {
          params: { email: userEmail },
        }
      );

      if (goalResponse.data && goalResponse.data.waterGoal) {
        setWaterGoal((prev) => ({
          ...prev,
          goalMl: goalResponse.data.waterGoal,
        }));
      }

      setError(null);
    } catch (err) {
      console.log(err);
      setError("Error al consultar los datos de agua.");
    }
  }, [userEmail, date]);

  const saveWaterData = useCallback(
    async (aguasllenadas: number) => {
      try {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/water/update`,
          {
            email: userEmail,
            date: date,
            aguasllenadas,
          }
        );
      } catch (err) {
        console.log(err);
        setError("Error al guardar los datos de agua.");
      }
    },
    [userEmail, date]
  );

  const saveWaterGoal = useCallback(
    async (goalMl: number) => {
      try {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/water/set-goal`,
          {
            email: userEmail,
            waterGoal: goalMl,
          }
        );
        return true;
      } catch (err) {
        console.log(err);
        setError("Error al guardar el objetivo de agua.");
        return false;
      }
    },
    [userEmail]
  );

  const fetchBottleSize = useCallback(async () => {
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
        setSelectedBottleSize(size);
        setWaterGoal((prev) => ({
          ...prev,
          unitsPerBottle: size,
        }));
      }
    } catch (err) {
      console.log(err);
      setError("Error al consultar el tamaño de botella.");
    }
  }, [userEmail]);

  const saveBottleSize = useCallback(
    async (size: number) => {
      try {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/water/update`,
          {
            email: userEmail,
            date: date,
            aguasllenadas: filledWaterUnits,
            tamano_botella: size,
          }
        );
        return true;
      } catch (err) {
        console.log(err);
        setError("Error al guardar el tamaño de botella.");
        return false;
      }
    },
    [userEmail, date, filledWaterUnits]
  );

  const handleSetBottleSize = useCallback(async () => {
    let newSize: number;

    if (useCustomSize) {
      if (!customBottleSize) {
        setError("Por favor ingresa un tamaño de botella personalizado.");
        return;
      }

      const size = parseInt(customBottleSize);
      if (isNaN(size) || size <= 0) {
        setError("Por favor ingresa un valor numérico válido.");
        return;
      }

      if (size < 100 || size > 2000) {
        setError("El tamaño de botella debe estar entre 100 y 2000 ml.");
        return;
      }

      newSize = size;
    } else {
      newSize = selectedBottleSize;
    }

    const saveSuccess = await saveBottleSize(newSize);

    if (saveSuccess) {
      setBottleSize(newSize);
      setWaterGoal((prev) => ({
        ...prev,
        unitsPerBottle: newSize,
      }));
      setShowBottleSetting(false);
      setError(null);
    }
  }, [useCustomSize, customBottleSize, selectedBottleSize, saveBottleSize]);

  const handleCustomSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCustomBottleSize(e.target.value);
    },
    []
  );

  const handleBottleSizeSelect = useCallback((size: number) => {
    setSelectedBottleSize(size);
    setUseCustomSize(false);
  }, []);

  const handleAddWaterUnit = useCallback(async () => {
    if (filledWaterUnits < totalWaterUnits && isToday) {
      const newFilledWaterUnits = filledWaterUnits + 1;
      setFilledWaterUnits(newFilledWaterUnits);
      await saveWaterData(newFilledWaterUnits);
    }
  }, [filledWaterUnits, isToday, saveWaterData, totalWaterUnits]);

  const handleRemoveWaterUnit = useCallback(async () => {
    if (filledWaterUnits > 0 && isToday) {
      const newFilledWaterUnits = filledWaterUnits - 1;
      setFilledWaterUnits(newFilledWaterUnits);
      await saveWaterData(newFilledWaterUnits);
    }
  }, [filledWaterUnits, isToday, saveWaterData]);

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedDate = e.target.value;
      setDate(selectedDate);
      setIsToday(selectedDate === todayStr);
    },
    [todayStr]
  );

  const handleDatePicker = useCallback(() => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  }, []);

  const handleGoalChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setGoalInput(e.target.value);
    },
    []
  );

  const handleUnitChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setGoalUnit(e.target.value as "ml" | "lt");
    },
    []
  );

  const handleSetGoal = useCallback(async () => {
    if (!goalInput) {
      setError("Por favor ingresa un valor para tu objetivo de agua.");
      return;
    }

    const numValue = parseFloat(goalInput);
    if (isNaN(numValue) || numValue <= 0) {
      setError("Por favor ingresa un valor numérico válido.");
      return;
    }

    const goalInMl = goalUnit === "lt" ? numValue * 1000 : numValue;

    const saveSuccess = await saveWaterGoal(goalInMl);

    if (saveSuccess) {
      const newWaterGoal = {
        goalMl: goalInMl,
        unitsPerBottle: waterGoal.unitsPerBottle,
      };

      setWaterGoal(newWaterGoal);
      setShowGoalSetting(false);
      setError(null);
    }
  }, [goalInput, goalUnit, waterGoal.unitsPerBottle, saveWaterGoal]);

  const handleRemoveGoal = useCallback(async () => {
    const saveSuccess = await saveWaterGoal(0);

    if (saveSuccess) {
      const newWaterGoal = {
        goalMl: 0,
        unitsPerBottle: waterGoal.unitsPerBottle,
      };

      setWaterGoal(newWaterGoal);
      setFilledWaterUnits(0);
      await saveWaterData(0);
      setShowGoalSetting(false);
      setError(null);
    }
  }, [waterGoal.unitsPerBottle, saveWaterGoal, saveWaterData]);

  const getDateLabel = useCallback(() => {
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
  }, [date, todayStr]);

  const getWeekNumber = useCallback((dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    const oneJan = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor(
      (date.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000)
    );
    return Math.ceil((days + oneJan.getDay() + 1) / 7);
  }, []);

  const getWeek = useCallback(() => getWeekNumber(date), [date, getWeekNumber]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (userEmail) {
      fetchBottleSize();
    }
  }, [userEmail, fetchBottleSize]);

  useEffect(() => {
    if (userEmail && date) fetchWaterData();
  }, [userEmail, date, fetchWaterData]);

  useEffect(() => {
    setWaterUnitStages(
      Array(totalWaterUnits)
        .fill(0)
        .map((_, i) => (i < filledWaterUnits ? 3 : 0))
    );
  }, [filledWaterUnits, totalWaterUnits]);

  const waterUnits = waterUnitStages.map((stage, index) => (
    <WaterUnit key={index} stage={stage} />
  ));

  const waterConsumed = filledWaterUnits * waterGoal.unitsPerBottle;
  const waterGoalTotal = waterGoal.goalMl;
  const waterPercentage =
    waterGoalTotal > 0
      ? ((waterConsumed / waterGoalTotal) * 100).toFixed(0)
      : "0";

  const infoText = {
    waterTrackerInfo:
      "Seguimiento de tu consumo diario de agua. Establece tu meta personalizada para mantener una hidratación adecuada.",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={`relative p-4 space-y-6 min-h-screen overflow-auto -mt-12 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
        isDarkMode ? "bg-[#282c3c]" : "bg-[#F8F9FA]"
      }`}
    >
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
          className={`mb-2 text-xs ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Semana {getWeek()}
        </motion.div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <button
            onClick={handleDatePicker}
            className={`min-w-[120px] px-6 py-3 font-semibold rounded-lg border shadow-[0_0_10px_rgba(255,148,4,0.3)] hover:shadow-[0_0_15px_rgba(255,148,4,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 sm:text-base text-sm sm:px-6 sm:py-3 sm:min-w-[120px] ${
              isDarkMode
                ? "bg-gradient-to-br from-[#2D3242] to-[#3B4252] text-gray-200 border-[#ff9404] hover:bg-gradient-to-br hover:from-[#3B4252] hover:to-[#4B5563]"
                : "bg-gradient-to-br from-white to-gray-100 text-gray-900 border-gray-300 hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-200"
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
            className="absolute opacity-0 w-0 h-0"
          />
        </motion.div>
      </motion.div>

      <div
        className={`max-w-[800px] mx-auto rounded-xl sm:p-7 p-5 relative z-10 ${
          isDarkMode ? "bg-[#3B4252]" : "bg-white"
        }`}
      >
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <h2
              className={`text-xl font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              } mr-2`}
            >
              Control de Agua
            </h2>
            <ButtonToolTip content={infoText.waterTrackerInfo} />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setShowBottleSetting(!showBottleSetting);
                setShowGoalSetting(false);
              }}
              className={`text-sm ${
                isDarkMode
                  ? "text-[#ff9404] hover:text-[#e08503]"
                  : "text-orange-500 hover:text-orange-600"
              } transition-colors duration-300`}
            >
              {showBottleSetting ? "Cancelar" : "Tamaño Botella"}
            </button>
            <button
              onClick={() => {
                setShowGoalSetting(!showGoalSetting);
                setShowBottleSetting(false);
              }}
              className={`text-sm ${
                isDarkMode
                  ? "text-[#ff9404] hover:text-[#e08503]"
                  : "text-orange-500 hover:text-orange-600"
              } transition-colors duration-300`}
            >
              {showGoalSetting ? "Cancelar" : "Configurar Meta"}
            </button>
          </div>
        </div>

        {showBottleSetting && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`rounded-lg p-4 mb-6 ${
              isDarkMode ? "bg-[#4B5563]/50" : "bg-[#F8F9FA]"
            }`}
          >
            <h3
              className={`text-lg font-semibold mb-3 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Configurar Tamaño de Botella
            </h3>
            <p
              className={`text-sm mb-3 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Tamaño actual:{" "}
              <span className="font-medium">{bottleSize} ml</span>
            </p>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {BOTTLE_SIZE_OPTIONS.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleBottleSizeSelect(size)}
                    className={`px-3 py-2 rounded-lg border transition-all duration-300 ${
                      !useCustomSize && selectedBottleSize === size
                        ? isDarkMode
                          ? "bg-[#ff9404] text-white border-[#e08503]"
                          : "bg-orange-500 text-white border-orange-600"
                        : isDarkMode
                        ? "bg-[#2D3242] text-white border-[#4B5563] hover:bg-[#3B4252]"
                        : "bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {size} ml
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useCustomSize"
                  checked={useCustomSize}
                  onChange={() => setUseCustomSize(!useCustomSize)}
                  className="h-4 w-4 rounded border-gray-300 text-[#ff9404] focus:ring-[#ff9404]"
                />
                <label
                  htmlFor="useCustomSize"
                  className={`text-sm ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Usar tamaño personalizado
                </label>
              </div>

              {useCustomSize && (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="100"
                    max="2000"
                    placeholder="Tamaño en ml"
                    value={customBottleSize}
                    onChange={handleCustomSizeChange}
                    className={`px-3 py-2 rounded-lg border ${
                      isDarkMode
                        ? "bg-[#2D3242] text-white border-[#4B5563] focus:border-[#ff9404]"
                        : "bg-white text-gray-900 border-gray-300 focus:border-[#ff9404]"
                    } focus:outline-none`}
                  />
                  <span
                    className={`text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    ml
                  </span>
                </div>
              )}

              <div className="flex justify-end mt-4">
                <button
                  onClick={handleSetBottleSize}
                  className={`px-4 py-2 rounded-lg shadow ${
                    isDarkMode
                      ? "bg-gradient-to-br from-[#ff9404] to-[#e08503] text-white"
                      : "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-900"
                  } hover:shadow-lg transition-all duration-300`}
                >
                  Guardar
                </button>
              </div>

              <p
                className={`text-xs mt-1 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                * El tamaño de botella debe estar entre 100 y 2000 ml.
              </p>
            </div>
          </motion.div>
        )}

        {showGoalSetting && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`rounded-lg p-4 mb-6 ${
              isDarkMode ? "bg-[#4B5563]/50" : "bg-[#F8F9FA]"
            }`}
          >
            <h3
              className={`text-lg font-semibold mb-3 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Configurar Objetivo de Agua
            </h3>
            <div className="flex flex-wrap gap-3 items-center">
              <input
                type="number"
                min="1"
                placeholder="Cantidad"
                value={goalInput}
                onChange={handleGoalChange}
                className={`px-3 py-2 rounded-lg border ${
                  isDarkMode
                    ? "bg-[#2D3242] text-white border-[#4B5563] focus:border-[#ff9404]"
                    : "bg-white text-gray-900 border-gray-300 focus:border-[#ff9404]"
                } focus:outline-none`}
              />
              <select
                value={goalUnit}
                onChange={handleUnitChange}
                className={`px-3 py-2 rounded-lg border ${
                  isDarkMode
                    ? "bg-[#2D3242] text-white border-[#4B5563] focus:border-[#ff9404]"
                    : "bg-white text-gray-900 border-gray-300 focus:border-[#ff9404]"
                } focus:outline-none`}
              >
                <option value="ml">ml</option>
                <option value="lt">lt</option>
              </select>
              <button
                onClick={handleSetGoal}
                className={`px-4 py-2 rounded-lg shadow ${
                  isDarkMode
                    ? "bg-gradient-to-br from-[#ff9404] to-[#e08503] text-white"
                    : "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-900"
                } hover:shadow-lg transition-all duration-300`}
              >
                Guardar
              </button>
              <button
                onClick={handleRemoveGoal}
                className={`px-4 py-2 rounded-lg shadow ${
                  isDarkMode
                    ? "bg-red-600/80 text-white"
                    : "bg-red-500/80 text-white"
                } hover:shadow-lg transition-all duration-300`}
              >
                Eliminar Meta
              </button>
            </div>
            <p
              className={`text-xs mt-2 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              * Al eliminar la meta, se restablecerá a 0ml y se reiniciará tu
              progreso actual.
            </p>
          </motion.div>
        )}

        <div
          className={`rounded-lg p-6 mb-8 ${
            isDarkMode ? "bg-[#4B5563]/50" : "bg-[#F8F9FA]"
          }`}
        >
          <p
            className={`text-lg font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Consumido:{" "}
            <span className="text-[#ff9404]">{waterConsumed} ml</span>
          </p>
          <p
            className={`text-base ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Meta:{" "}
            <span className="font-medium">
              {waterGoalTotal > 0 ? `${waterGoalTotal} ml` : "No establecida"}
            </span>
            {waterGoalTotal > 0 ? ` (${waterPercentage}% completado)` : ""}
          </p>
        </div>

        {waterGoalTotal > 0 ? (
          <>
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {waterUnits}
            </div>

            <div className="flex justify-center space-x-6">
              <button
                onClick={handleRemoveWaterUnit}
                disabled={filledWaterUnits === 0 || !isToday}
                className={`px-4 py-2 text-base border-none rounded-lg shadow-[0_0_10px_rgba(255,148,4,0.3)] hover:shadow-[0_0_15px_rgba(255,148,4,0.5)] hover:scale-110 active:scale-95 transition-all duration-300 sm:text-base sm:px-4 sm:py-2 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none ${
                  isDarkMode
                    ? "bg-gradient-to-br from-[#ff9404] to-[#e08503] text-white disabled:bg-[#4B5563]"
                    : "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-900 disabled:bg-gray-400"
                }`}
              >
                -
              </button>
              <button
                onClick={handleAddWaterUnit}
                disabled={filledWaterUnits === totalWaterUnits || !isToday}
                className={`px-4 py-2 text-base border-none rounded-lg shadow-[0_0_10px_rgba(255,148,4,0.3)] hover:shadow-[0_0_15px_rgba(255,148,4,0.5)] hover:scale-110 active:scale-95 transition-all duration-300 sm:text-base sm:px-4 sm:py-2 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none ${
                  isDarkMode
                    ? "bg-gradient-to-br from-[#ff9404] to-[#e08503] text-white disabled:bg-[#4B5563]"
                    : "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-900 disabled:bg-gray-400"
                }`}
              >
                +
              </button>
            </div>

            <p
              className={`text-sm mt-8 text-center ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {filledWaterUnits === totalWaterUnits
                ? "¡Meta alcanzada! Eres un maestro del agua 💧"
                : "¡Sigue así, cada gota cuenta!"}
            </p>
          </>
        ) : (
          <div className="text-center py-10">
            <p
              className={`text-lg font-semibold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              No has establecido una meta de agua
            </p>
            <button
              onClick={() => setShowGoalSetting(true)}
              className={`px-4 py-2 rounded-lg shadow ${
                isDarkMode
                  ? "bg-gradient-to-br from-[#ff9404] to-[#e08503] text-white"
                  : "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-900"
              } hover:shadow-lg transition-all duration-300`}
            >
              Establecer Meta
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default React.memo(WaterTracker);
