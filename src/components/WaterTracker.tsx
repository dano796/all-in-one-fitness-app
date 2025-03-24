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
          display: fillSpring.stage.to((s) => (s >= 2 ? "block" : "none")), // Fixed typo "привлечениеnone" -> "block"
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
      console.log(err);
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
      console.log(err);
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
    <div className="relative p-4 space-y-6 bg-[#282c3c] min-h-screen overflow-auto -mt-12 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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
            className="min-w-[120px] px-6 py-3 bg-gradient-to-br from-[#2D3242] to-[#3B4252] text-gray-200 font-semibold rounded-lg border border-[#ff9404] shadow-[0_0_10px_rgba(255,148,4,0.3)] hover:bg-gradient-to-br hover:from-[#3B4252] hover:to-[#4B5563] hover:shadow-[0_0_15px_rgba(255,148,4,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 sm:text-base text-sm sm:px-6 sm:py-3 sm:min-w-[120px]"
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

      <div className="max-w-[800px] mx-auto bg-[#3B4252] rounded-xl sm:p-7 p-5 relative z-10">
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

        <div className="bg-[#4B5563]/50 rounded-lg p-6 mb-8">
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
            className="px-4 py-2 text-base bg-gradient-to-br from-[#ff9404] to-[#e08503] text-white border-none rounded-lg shadow-[0_0_10px_rgba(255,148,4,0.3)] hover:bg-gradient-to-br hover:from-[#e08503] hover:to-[#ff9404] hover:shadow-[0_0_15px_rgba(255,148,4,0.5)] hover:scale-110 active:scale-95 transition-all duration-300 disabled:bg-[#4B5563] disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none sm:text-base sm:px-4 sm:py-2 "
          >
            -
          </button>
          <button
            onClick={handleAddWaterUnit}
            disabled={filledWaterUnits === TOTAL_WATER_UNITS || !isToday}
            className="px-4 py-2 text-base bg-gradient-to-br from-[#ff9404] to-[#e08503] text-white border-none rounded-lg shadow-[0_0_10px_rgba(255,148,4,0.3)] hover:bg-gradient-to-br hover:from-[#e08503] hover:to-[#ff9404] hover:shadow-[0_0_15px_rgba(255,148,4,0.5)] hover:scale-110 active:scale-95 transition-all duration-300 disabled:bg-[#4B5563] disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none sm:text-base sm:px-4 sm:py-2"
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