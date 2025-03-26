import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import axios from "axios";
import GalaxyBackground from "../components/GalaxyBackground";

interface Routine {
  id: string;
  day: string;
  name: string;
  exercises: any[];
}

const Routines: React.FC = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>("");
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const deleteConfirmRef = useRef<HTMLDivElement>(null);

  const checkAuth = useCallback(async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
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
      setError("Error al consultar las rutinas.");
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  const handleAddRoutineClick = useCallback(() => {
    navigate("/ejercicios");
  }, [navigate]);

  const handleRoutineClick = useCallback((routineId: string) => {
    navigate(`/routine-details?id=${routineId}`);
  }, [navigate]);

  const handleDeleteRoutine = useCallback(async (routineId: string) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/routines/${routineId}`);
      setRoutines((prevRoutines) => prevRoutines.filter((routine) => routine.id !== routineId));
      setShowDeleteConfirm(null);
    } catch (err) {
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
    <div className="relative flex flex-col gap-8 p-8 pr-0 min-h-screen overflow-hidden mt-12 z-10">
      <GalaxyBackground />
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="flex justify-between items-center mb-8 pl-0"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex-1 text-left text-xl font-bold text-white drop-shadow-md"
        >
          <h1>All In One Fitness App</h1>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex-1 text-right text-sm font-semibold text-white uppercase tracking-wide drop-shadow-sm pr-8"
        >
          MIS RUTINAS
        </motion.div>
      </motion.div>

      <div className="flex items-start gap-4 max-w-full m-0">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex items-start w-auto ml-0 mr-4"
        >
          <button
            onClick={handleAddRoutineClick}
            className="py-3 px-6 bg-gradient-to-r from-[#ff9404] to-[#e08503] text-white font-semibold rounded-lg border border-[#ff9404] shadow-[0_0_10px_rgba(255,148,4,0.3)] transition-all duration-300 flex items-center gap-2 justify-center ml-8 hover:bg-gradient-to-r hover:from-[#e08503] hover:to-[#ff9404] hover:shadow-[0_0_15px_rgba(255,148,4,0.5)] hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Nueva rutina
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="flex-1 bg-gray-700 rounded-lg p-8 relative z-10 shadow-lg min-h-[500px] flex flex-col justify-start"
        >
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
          {loading ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-gray-400 text-center text-sm"
            >
              Cargando...
            </motion.p>
          ) : routines.length > 0 ? (
            <div className="flex flex-col gap-4">
              {routines.map((routine, index) => (
                <motion.div
                  key={routine.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.3, duration: 1.0 }}
                  className="max-w-full bg-gray-600 rounded-lg p-4 mb-2.5 flex items-center justify-between cursor-pointer transition-all duration-300 border border-gray-500 hover:bg-gray-500 hover:border-[#ff9404] hover:shadow-[0_0_10px_rgba(255,148,4,0.2)] relative"
                >
                  <div
                    className="flex items-center gap-3 flex-1"
                    onClick={() => handleRoutineClick(routine.id)}
                  >
                    <h3 className="text-base font-semibold text-white">
                      {routine.day}: {routine.name}
                    </h3>
                  </div>
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.0 + index * 0.3, duration: 0.8 }}
                    className="p-1 bg-transparent transition-transform duration-200 hover:scale-125 active:scale-90"
                    onClick={() => toggleDeleteConfirm(routine.id)}
                  >
                    <MoreHorizontal className="h-4 w-4 text-gray-400 transition-colors duration-300 hover:text-[#ff9404]" />
                  </motion.button>
                  {showDeleteConfirm === routine.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                      className="absolute -top-14 right-0 bg-gray-700/95 rounded-lg p-3 shadow-lg z-20 border border-gray-500 flex flex-col gap-2 w-44"
                      ref={deleteConfirmRef}
                    >
                      <p className="text-xs text-gray-300 text-center m-0 font-medium">
                        ¿Eliminar esta rutina?
                      </p>
                      <div className="flex justify-between gap-2">
                        <button
                          onClick={() => handleDeleteRoutine(routine.id)}
                          className="flex-1 py-2 bg-gradient-to-r from-[#ff9404] to-[#e08503] text-white font-semibold text-xs rounded-md border-none flex items-center justify-center gap-1 transition-all duration-300 hover:bg-gradient-to-r hover:from-[#e08503] hover:to-[#ff9404] hover:shadow-[0_0_8px_rgba(255,148,4,0.5)] hover:scale-103 active:scale-97"
                        >
                          <Trash2 className="w-4 h-4" />
                          Sí
                        </button>
                        <button
                          onClick={() => toggleDeleteConfirm(null)}
                          className="flex-1 py-2 bg-gradient-to-r from-[#ff9404] to-[#e08503] text-white font-semibold text-xs rounded-md border-none transition-all duration-300 hover:bg-gradient-to-r hover:from-[#e08503] hover:to-[#ff9404] hover:shadow-[0_0_8px_rgba(255,148,4,0.5)] hover:scale-103 active:scale-97"
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
            <p className="text-gray-400 text-center text-sm">
              No hay rutinas registradas.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default React.memo(Routines);