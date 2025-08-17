import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MoreHorizontal, Plus, Trash2, Clock, Dumbbell } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import axios from "axios";
import GalaxyBackground from "../components/GalaxyBackground";
import PersonalizedSuggestions from "../components/PersonalizedSuggestions";
import { useUserProfile } from "../hooks/useUserProfile";
import { useUserData } from "../hooks/useUserData";
import { useTheme } from "./ThemeContext";

interface Routine {
  id: string;
  day: string;
  name: string;
  exercises: any[] | string | null; 
  exerciseCount?: number;
}

const Routines: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { profile: userProfile } = useUserProfile();
  const { userData } = useUserData();
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

  // Button style from RoutineDetails.tsx
  const buttonStyle = `px-6 py-3 font-semibold rounded-lg border border-[#ff9404] shadow-[0_0_10px_rgba(255,148,4,0.3)] hover:shadow-[0_0_15px_rgba(255,148,4,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 ${
    isDarkMode
      ? "bg-gradient-to-br from-[#2D3242] to-[#3B4252] text-gray-200 hover:from-[#3B4252] hover:to-[#4B5563]"
      : "bg-gray-200 text-gray-900 hover:bg-gray-300"
  }`;

  // Función para contar ejercicios únicos por nombre (como respaldo si exerciseCount no está disponible)
  const getUniqueExerciseCount = (exercises: any[] | string | null): number => {
    // Validamos que exercises sea un arreglo
    if (!Array.isArray(exercises)) {
      console.warn("Exercises no es un arreglo:", exercises);
      // Si exercises es una cadena, intentamos parsearla como JSON
      if (typeof exercises === "string") {
        try {
          const parsedExercises = JSON.parse(exercises);
          if (Array.isArray(parsedExercises)) {
            const uniqueNames = new Set(parsedExercises.map((exercise: any) => exercise.name));
            return uniqueNames.size;
          }
        } catch (e) {
          console.error("Error al parsear exercises como JSON:", e);
        }
      }
      return 0; // Si no es un arreglo o no se puede parsear, devolvemos 0
    }

    const uniqueNames = new Set(exercises.map((exercise) => exercise.name));
    return uniqueNames.size;
  };

  return (
    <div
      className={`relative min-h-screen overflow-hidden transition-colors duration-300 ${
        isDarkMode ? "bg-[#282c3c]" : "bg-[#F8F9FA]"
      }`}
    >
      {/* Enhanced GalaxyBackground with fitness overlay */}
      <div className="absolute inset-0 z-0">
        <GalaxyBackground />
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <Dumbbell
              key={i}
              className="absolute text-[#ff9404] animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg)`,
                width: `${20 + Math.random() * 30}px`,
                height: `${20 + Math.random() * 30}px`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 p-4 sm:p-8 space-y-8 max-w-[1400px] mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.68, -0.55, 0.265, 1.55] }}
          className="text-center space-y-4"
        >
          <h1
            className={`text-3xl sm:text-4xl font-extrabold uppercase tracking-wider bg-clip-text text-transparent ${
              isDarkMode
                ? "bg-gradient-to-r from-white to-gray-300"
                : "bg-gradient-to-r from-gray-900 to-gray-600"
            } drop-shadow-lg`}
          >
            Mis Rutinas
          </h1>
          <p
            className={`text-sm sm:text-base font-medium ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            ¡Organiza tus entrenamientos y alcanza tus metas!
          </p>
        </motion.div>

        {/* New Routine Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6, ease: [0.68, -0.55, 0.265, 1.55] }}
          className="flex justify-center"
        >
          <button
            onClick={handleAddRoutineClick}
            className={`${buttonStyle} min-w-[200px] sm:min-w-[240px] text-lg flex items-center gap-3 justify-center py-4 rounded-xl`}
          >
            <Plus className="w-6 h-6" />
            Nueva Rutina
          </button>
        </motion.div>

        {/* Routines List */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.68, -0.55, 0.265, 1.55] }}
          className={`rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm ${
            isDarkMode
              ? "bg-[#3B4252]/80 border border-gray-600"
              : "bg-white/90 border border-gray-200"
          }`}
        >
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className={`text-center text-sm font-medium mb-6 ${
                isDarkMode ? "text-red-400" : "text-red-600"
              }`}
            >
              {error}
            </motion.p>
          )}
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center items-center h-48"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#ff9404]"></div>
            </motion.div>
          ) : routines.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {routines.map((routine, index) => (
                <motion.div
                  key={routine.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.2 + index * 0.2,
                    duration: 0.6,
                    ease: [0.68, -0.55, 0.265, 1.55],
                  }}
                  className={`relative rounded-xl p-5 flex flex-col gap-3 cursor-pointer transition-all duration-300 border hover:shadow-[0_0_20px_rgba(255,148,4,0.4)] hover:-translate-y-1 backdrop-blur-sm ${
                    isDarkMode
                      ? "bg-[#4B5563]/50 border-gray-500 hover:border-[#ff9404]"
                      : "bg-white/80 border-gray-200 hover:border-[#ff9404]"
                  }`}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => handleRoutineClick(routine.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div>
                        <h3
                          className={`text-lg font-extrabold truncate ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {routine.name}
                        </h3>
                        <p
                          className={`text-sm font-medium ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {routine.day}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: 0.4 + index * 0.2,
                        duration: 0.4,
                      }}
                      className="p-2 bg-transparent transition-transform duration-200 hover:scale-125 active:scale-90"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDeleteConfirm(routine.id);
                      }}
                    >
                      <MoreHorizontal
                        className={`h-5 w-5 transition-colors duration-300 ${
                          isDarkMode
                            ? "text-gray-400 hover:text-[#ff9404]"
                            : "text-gray-500 hover:text-[#ff9404]"
                        }`}
                      />
                    </motion.button>
                  </div>
                  {/* Exercise Count */}
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#ff9404]" />
                    <span
                      className={`text-xs font-medium ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {/* Usamos exerciseCount del backend si está disponible, de lo contrario calculamos en el frontend */}
                      {(routine.exerciseCount !== undefined
                        ? routine.exerciseCount
                        : getUniqueExerciseCount(routine.exercises)
                      )} ejercicios
                      {/* La cantidad se toma del backend (exerciseCount) o se calcula contando nombres únicos */}
                    </span>
                  </div>
                  {showDeleteConfirm === routine.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute top-0 right-0 mt-12 mr-2 rounded-lg p-4 shadow-2xl z-20 border flex flex-col gap-3 w-56 backdrop-blur-sm ${
                        isDarkMode
                          ? "bg-[#3B4252]/95 border-gray-600"
                          : "bg-white/90 border-gray-200"
                      }`}
                      ref={deleteConfirmRef}
                    >
                      <p
                        className={`text-sm text-center m-0 font-medium ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        ¿Eliminar esta rutina?
                      </p>
                      <div className="flex justify-between gap-2">
                        <button
                          onClick={() => handleDeleteRoutine(routine.id)}
                          className={`${buttonStyle} flex-1 flex items-center justify-center gap-1 text-sm py-2`}
                        >
                          <Trash2 className="w-4 h-4" />
                          Sí
                        </button>
                        <button
                          onClick={() => toggleDeleteConfirm(null)}
                          className={`${buttonStyle} flex-1 text-sm py-2`}
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col items-center gap-6 py-12"
            >
              <Dumbbell
                className={`w-16 h-16 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                } opacity-50 animate-pulse`}
              />
              <p
                className={`text-base font-medium text-center ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                No hay rutinas registradas. ¡Crea tu primera rutina ahora!
              </p>
              <button
                onClick={handleAddRoutineClick}
                className={`${buttonStyle} min-w-[200px] flex items-center gap-3 justify-center py-4 rounded-xl`}
              >
                <Plus className="w-6 h-6" />
                Crear Rutina
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Sugerencias Personalizadas */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.68, -0.55, 0.265, 1.55], delay: 0.8 }}
          className="max-w-[1000px] mx-auto"
        >
          <PersonalizedSuggestions 
            userProfile={userProfile}
            context="routines"
            maxSuggestions={3}
            showCategories={true}
            userData={userData}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default React.memo(Routines);