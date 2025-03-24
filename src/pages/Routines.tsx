import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import axios, { AxiosError } from "axios";
import GalaxyBackground from "../components/GalaxyBackground";

interface Routine {
  day: string;
  name: string;
}

const Routines: React.FC = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userEmail, setUserEmail] = useState<string>("");
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        setError("Debes iniciar sesión para ver tus rutinas.");
        navigate("/login");
      } else {
        const email = user.email || "";
        setUserEmail(email);
        fetchRoutines(email);
      }
    };
    checkAuth();
  }, [navigate]);

  const fetchRoutines = useCallback(async (email: string) => {
    try {
      const response = await axios.get<{ routines: Routine[] }>(
        `${import.meta.env.VITE_BACKEND_URL}/api/routines/user`,
        { params: { email } }
      );
      setRoutines(response.data.routines);
      setError(null);
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setError(
        axiosError.response?.data?.error || "Error al consultar las rutinas."
      );
    }
  }, []);

  const handleAddRoutineClick = useCallback(() => {
    navigate("/ejercicios");
  }, [navigate]);

  const handleRoutineClick = useCallback((routineName: string) => {
    navigate(`/routine-details?name=${routineName}`);
  }, [navigate]);

  return (
    <div className="relative p-4 space-y-6 bg-[#282c3c] min-h-screen overflow-hidden -mt-12">
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
        >
          <h1 className="text-xl font-bold text-white">All In One Fitness App</h1>
        </motion.div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <button
            onClick={handleAddRoutineClick}
            className="mt-4 py-3 px-6 bg-gradient-to-r from-[#ff9404] to-[#e08503] text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-[#e08503] hover:to-[#ff9404] transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Nueva rutina
          </button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="max-w-[700px] mx-auto bg-[#3B4252] rounded-lg p-5 relative z-10 sm:p-4"
      >
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-sm font-semibold text-white mb-4"
        >
          Mis rutinas
        </motion.h2>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-red-400 mb-4 text-center text-sm"
          >
            {error}
          </motion.p>
        )}
        <div className="space-y-2">
          {routines.length > 0 ? (
            routines.map((routine, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.3, duration: 1.0 }}
                className="max-w-full bg-white rounded-lg p-2.5 mb-2.5 flex items-center justify-between cursor-pointer hover:bg-gray-200 transition-colors duration-200 sm:p-2"
                onClick={() => handleRoutineClick(routine.name)}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div>
                    <h3 className="text-sm font-semibold text-black">{routine.day}: {routine.name}</h3>
                  </div>
                </div>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.0 + index * 0.3, duration: 0.8 }}
                  className="p-0.5 transition-transform duration-200 hover:scale-120 active:scale-90 bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddRoutineClick();
                  }}
                >
                  <Plus className="h-4 w-4 text-black transition-colors duration-300 hover:text-[#ff9404]" />
                </motion.button>
              </motion.div>
            ))
          ) : (
            <p className="text-gray-400 text-center text-sm">No hay rutinas registradas.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default React.memo(Routines);