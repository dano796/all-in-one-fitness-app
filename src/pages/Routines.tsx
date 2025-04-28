// src/pages/Routines.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import axios from "axios";
import GalaxyBackground from "../components/GalaxyBackground";
import { useTheme } from "./ThemeContext";

interface Routine {
  id: string;
  day: string;
  name: string;
  exercises: any[];
}

const Routines: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>("");
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const deleteConfirmRef = useRef<HTMLDivElement>(null);

  const checkAuth = useCallback(async () => {
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
    }
  }, [navigate]);

  const fetchRoutines = useCallback(async () => {
    if (!userEmail) return;
    setLoading(true);
    try {
      const response = await axios.get<{ routines: Routine[] }>(
        `${import.meta.env.VITE_BACKEND_URL}/api/routines/user`,
        { params: { email: userEmail } }
      );
      setRoutines(response.data.routines);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Error al consultar las rutinas.");
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  const handleAddRoutineClick = useCallback(() => {
    navigate("/ejercicios");
  }, [navigate]);

  const handleRoutineClick = useCallback(
    (routineId: string) => {
      navigate(`/routine-details?id=${routineId}`);
    },
    [navigate]
  );

  const handleDeleteRoutine = useCallback(async (routineId: string) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/routines/${routineId}`
      );
      setRoutines((prevRoutines) =>
        prevRoutines.filter((routine) => routine.id !== routineId)
      );
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      setError("Error al eliminar la rutina.");
    }
  }, []);

  const toggleDeleteConfirm = useCallback((routineId: string | null) => {
    setShowDeleteConfirm(routineId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        deleteConfirmRef.current &&
        !deleteConfirmRef.current.contains(event.target as Node) &&
        showDeleteConfirm
      ) {
        setShowDeleteConfirm(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDeleteConfirm]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (userEmail) fetchRoutines();
  }, [userEmail, fetchRoutines]);

  return (
    <div className={`relative min-h-screen overflow-hidden transition-colors duration-300 ${isDarkMode ? "bg-[#282c3c]" : "bg-white-100"}`}>
      <div className="absolute inset-0 z-0">
        <GalaxyBackground />
      </div>

      <div className="relative z-10 p-4 sm:p-6 space-y-4 sm:space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col sm:flex-row justify-between items-center mb-3 sm:mb-6 px-4 sm:px-6"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className={`w-full sm:flex-1 text-center sm:text-right text-sm font-semibold uppercase tracking-wide drop-shadow-sm ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            MIS RUTINAS
          </motion.div>
        </motion.div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 max-w-full px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex items-center justify-center w-full sm:w-auto mb-3 sm:mb-0"
          >
            <button
              onClick={handleAddRoutineClick}
              className={`w-full sm:w-auto py-2 sm:py-3 px-4 sm:px-6 font-semibold rounded-lg border border-[#ff9404] shadow-[0_0_10px_rgba(255,148,4,0.3)] transition-all duration-300 flex items-center gap-2 justify-center hover:shadow-[0_0_15px_rgba(255,148,4,0.5)] hover:scale-105 active:scale-95 ${
                isDarkMode
                  ? "bg-gradient-to-r from-[#ff9404] to-[#e08503] text-white hover:from-[#e08503] hover:to-[#ff9404]"
                  : "bg-orange-500 text-white hover:bg-orange-600"
              }`}
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Nueva rutina
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`w-full flex-1 rounded-lg p-4 sm:p-6 relative z-10 shadow-lg min-h-[200px] sm:min-h-[400px] flex flex-col justify-start ${
              isDarkMode ? "bg-gray-700" : "bg-white"
            }`}
          >
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className={`mb-3 sm:mb-4 text-center text-xs sm:text-sm ${
                  isDarkMode ? "text-red-400" : "text-red-600"
                }`}
              >
                {error}
              </motion.p>
            )}
            {loading ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className={`text-center text-xs sm:text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                Cargando...
              </motion.p>
            ) : routines.length > 0 ? (
              <div className="flex flex-col gap-3 sm:gap-4">
                {routines.map((routine, index) => (
                  <motion.div
                    key={routine.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.3, duration: 0.6 }}
                    className={`max-w-full rounded-lg p-3 sm:p-4 flex items-center justify-between cursor-pointer transition-all duration-300 border hover:border-[#ff9404] hover:shadow-[0_0_10px_rgba(255,148,4,0.2)] relative ${
                      isDarkMode ? "bg-gray-600 border-gray-500 hover:bg-gray-500" : "bg-white border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className="flex items-center gap-2 sm:gap-3 flex-1 overflow-hidden"
                      onClick={() => handleRoutineClick(routine.id)}
                    >
                      <h3 className={`text-xs sm:text-base font-semibold truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {routine.day}: {routine.name}
                      </h3>
                    </div>
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.0 + index * 0.3, duration: 0.6 }}
                      className="p-1 sm:p-2 bg-transparent transition-transform duration-200 hover:scale-125 active:scale-90 ml-2"
                      onClick={() => toggleDeleteConfirm(routine.id)}
                    >
                      <MoreHorizontal className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-300 ${isDarkMode ? "text-gray-400 hover:text-[#ff9404]" : "text-gray-500 hover:text-[#ff9404]"}`} />
                    </motion.button>
                    {showDeleteConfirm === routine.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute -top-16 right-0 rounded-lg p-4 shadow-lg z-20 border flex flex-col gap-2 w-44 sm:w-48 ${
                          isDarkMode ? "bg-gray-700/95 border-gray-500" : "bg-white-100 border-gray-300"
                        }`}
                        ref={deleteConfirmRef}
                      >
                        <p className={`text-xs sm:text-sm text-center m-0 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          ¿Eliminar esta rutina?
                        </p>
                        <div className="flex justify-between gap-2">
                          <button
                            onClick={() => handleDeleteRoutine(routine.id)}
                            className={`flex-1 py-2 font-semibold text-sm rounded-md border-none flex items-center justify-center gap-1 transition-all duration-300 hover:shadow-[0_0_8px_rgba(255,148,4,0.5)] hover:scale-103 active:scale-97 ${
                              isDarkMode
                                ? "bg-gradient-to-r from-[#ff9404] to-[#e08503] text-white hover:from-[#e08503] hover:to-[#ff9404]"
                                : "bg-orange-500 text-white hover:bg-orange-600"
                            }`}
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            Sí
                          </button>
                          <button
                            onClick={() => toggleDeleteConfirm(null)}
                            className={`flex-1 py-2 font-semibold text-sm rounded-md border-none transition-all duration-300 hover:shadow-[0_0_8px_rgba(255,148,4,0.5)] hover:scale-103 active:scale-97 ${
                              isDarkMode
                                ? "bg-gradient-to-r from-[#ff9404] to-[#e08503] text-white hover:from-[#e08503] hover:to-[#ff9404]"
                                : "bg-orange-500 text-white hover:bg-orange-600"
                            }`}
                          >
                            No
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className={`text-center text-xs sm:text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                No hay rutinas registradas.
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Routines);