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

const preloadImages = [BotellaVacia, Botella25, Botella75, Botella100];
preloadImages.forEach((src) => {
  const img = new Image();
  img.src = src;
});

const TIMEZONE = "America/Bogota";
const TOTAL_WATER_UNITS = 8;

const customStyles = `
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
  .water-tracker-section {
    max-width: 800px;
    margin: 0 auto;
    background: #3B4252;
    border-radius: 12px;
    padding: 30px;
  }
  .action-button {
    padding: 8px 16px;
    font-size: 1rem;
    background: linear-gradient(45deg, #ff9404, #e08503);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 0 10px rgba(255, 148, 4, 0.3);
    transition: all 0.3s ease;
  }
  .action-button:hover {
    background: linear-gradient(45deg, #e08503, #ff9404);
    box-shadow: 0 0 15px rgba(255, 148, 4, 0.5);
    transform: scale(1.1);
  }
  .action-button:active {
    transform: scale(0.95);
  }
  .action-button:disabled {
    background: #4B5563;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
  .date-button {
    min-width: 120px;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(45deg, #2D3242, #3B4252);
    color: #E5E7EB;
    font-weight: 600;
    border-radius: 8px;
    border: 1px solid #ff9404;
    box-shadow: 0 0 10px rgba(255, 148, 4, 0.3);
    transition: all 0.3s ease;
  }
  .date-button:hover {
    background: linear-gradient(45deg, #3B4252, #4B5563);
    box-shadow: 0 0 15px rgba(255, 148, 4, 0.5);
    transform: scale(1.05);
  }
  .date-button:active {
    transform: scale(0.95);
  }
  .hidden-date-input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
  @media (max-width: 640px) {
    .water-tracker-section {
      max-width: 100%;
      padding: 20px;
    }
    .action-button {
      padding: 6px 12px;
      font-size: 0.875rem;
    }
    .date-button {
      font-size: 0.875rem;
      padding: 0.5rem 1rem;
      min-width: 100px;
    }
  }
`;

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
          display: fillSpring.stage.to((s) => (s >= 2 ? " привлечениеnone" : "block")),
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

const WaterTracker: React.FC = () => {
  const navigate = useNavigate();
  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: TIMEZONE });
  const [date, setDate] = useState<string>(todayStr);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [filledWaterUnits, setFilledWaterUnits] = useState<number>(0);
  const [waterUnitStages, setWaterUnitStages] = useState<number[]>(Array(TOTAL_WATER_UNITS).fill(0));
  const [isToday, setIsToday] = useState<boolean>(true);

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
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/water/user`, {
        params: { email: userEmail, date: date },
      });
      const aguasllenadas = response.data.aguasllenadas || 0;
      setFilledWaterUnits(aguasllenadas);
      setError(null);
    } catch (err) {
      setError("Error al consultar los datos de agua.");
    }
  }, [userEmail, date]);

  const saveWaterData = useCallback(async (aguasllenadas: number) => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/water/update`, {
        email: userEmail,
        date: date,
        aguasllenadas,
      });
    } catch (err) {
      setError("Error al guardar los datos de agua.");
    }
  }, [userEmail, date]);

  const handleAddWaterUnit = useCallback(async () => {
    if (filledWaterUnits < TOTAL_WATER_UNITS && isToday) {
      const newFilledWaterUnits = filledWaterUnits + 1;
      setFilledWaterUnits(newFilledWaterUnits);
      await saveWaterData(newFilledWaterUnits);
    }
  }, [filledWaterUnits, isToday, saveWaterData]);

  const handleRemoveWaterUnit = useCallback(async () => {
    if (filledWaterUnits > 0 && isToday) {
      const newFilledWaterUnits = filledWaterUnits - 1;
      setFilledWaterUnits(newFilledWaterUnits);
      await saveWaterData(newFilledWaterUnits);
    }
  }, [filledWaterUnits, isToday, saveWaterData]);

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
    setIsToday(selectedDate === todayStr);
  }, [todayStr]);

  const handleDatePicker = useCallback(() => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  }, []);

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
    if (userEmail && date) fetchWaterData();
  }, [userEmail, date, fetchWaterData]);

  useEffect(() => {
    setWaterUnitStages((prevStages) =>
      prevStages.map((stage, i) => (i < filledWaterUnits ? 3 : 0))
    );
  }, [filledWaterUnits]);

  const waterConsumed = filledWaterUnits * 250;
  const waterGoal = TOTAL_WATER_UNITS * 250;
  const waterUnits = waterUnitStages.map((stage, index) => (
    <WaterUnit key={index} stage={stage} />
  ));

  return (
    <div className="relative p-4 space-y-6 bg-[#282c3c] min-h-screen overflow-auto -mt-12">
      <GalaxyBackground />
      <style>{customStyles}</style>

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
          <button onClick={handleDatePicker} className="date-button">
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

      <div className="water-tracker-section relative z-10">
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
        <h2 className="text-lg font-semibold text-white mb-6">
          Control de Agua
        </h2>

        <div className="bg-[#4B5563] bg-opacity-50 rounded-lg p-6 mb-8">
          <p className="text-xl font-semibold text-white">
            Consumido: <span className="text-[#ff9404]">{waterConsumed} ml</span>
          </p>
          <p className="text-base text-gray-400">
            {((waterConsumed / waterGoal) * 100).toFixed(0)}% de tu meta
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {waterUnits}
        </div>

        <div className="flex justify-center space-x-6">
          <button
            onClick={handleRemoveWaterUnit}
            disabled={filledWaterUnits === 0 || !isToday}
            className="action-button"
          >
            -
          </button>
          <button
            onClick={handleAddWaterUnit}
            disabled={filledWaterUnits === TOTAL_WATER_UNITS || !isToday}
            className="action-button"
          >
            +
          </button>
        </div>

        <p className="text-sm text-gray-400 mt-8 text-center italic">
          {filledWaterUnits === TOTAL_WATER_UNITS
            ? "¡Meta alcanzada! Eres un maestro del agua 💧"
            : "¡Sigue así, cada gota cuenta!"}
        </p>
      </div>
    </div>
  );
};

export default React.memo(WaterTracker);