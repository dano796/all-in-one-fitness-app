import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Plus, Trash2, CheckCircle, XCircle, X } from "lucide-react";
import axios from "axios";
import GalaxyBackground from "../components/GalaxyBackground";
import { Progress } from "@/components/ui/progress";

import timerEndSound from "../assets/sounds/timer-end.mp3.wav";

interface Routine {
  id: string;
  day: string;
  name: string;
  exercises: Exercise[];
}

interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  gifUrl: string;
  target: string;
  secondaryMuscles: string[];
  instructions: string[];
  sets: { kg: string; reps: string; completed?: boolean }[];
  restTimer?: string;
  note?: string;
}

const RoutineDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editedExercises, setEditedExercises] = useState<Exercise[]>([]);
  const [timer, setTimer] = useState<number>(0);
  const [initialTimer, setInitialTimer] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState<boolean>(false);
  const [timerCompleted, setTimerCompleted] = useState<boolean>(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);

  const timerSound = new Audio(timerEndSound);

  const queryParams = new URLSearchParams(location.search);
  const routineId = queryParams.get("id");

  const fetchRoutineDetails = useCallback(async () => {
    if (!routineId) {
      setError("ID de rutina no proporcionado.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get<{ routine: Routine }>(
        `${import.meta.env.VITE_BACKEND_URL}/api/routines/${routineId}`
      );
      const fetchedRoutine = response.data.routine;

      let exercises: Exercise[] = [];
      if (typeof fetchedRoutine.exercises === "string") {
        exercises = JSON.parse(fetchedRoutine.exercises);
      } else {
        exercises = fetchedRoutine.exercises || [];
      }

      if (!Array.isArray(exercises)) exercises = [];

      exercises = exercises.map((exercise) => ({
        ...exercise,
        sets: exercise.sets.map((set) => ({
          ...set,
          completed: set.completed ?? false,
        })),
      }));

      setRoutine(fetchedRoutine);
      setEditedExercises(exercises);
      setError(null);
    } catch (err) {
      console.error("Error al cargar los detalles de la rutina:", err);
      setError("Error al cargar los detalles de la rutina.");
    } finally {
      setLoading(false);
    }
  }, [routineId]);

  useEffect(() => {
    fetchRoutineDetails();
  }, [fetchRoutineDetails]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setIsTimerModalOpen(false);
      setTimerCompleted(true);
      timerSound.play().catch((err) => console.error("Error al reproducir el sonido:", err));
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timer]);

  const startRestTimer = (restTimer: string) => {
    const seconds = parseInt(restTimer) || 0;
    setTimer(seconds);
    setInitialTimer(seconds);
    setIsTimerRunning(true);
    setIsTimerModalOpen(true);
    setTimerCompleted(false);
  };

  const toggleTimer = () => setIsTimerRunning((prev) => !prev);

  const closeTimerModal = () => {
    setIsTimerModalOpen(false);
    setIsTimerRunning(false);
    setTimer(0);
    setTimerCompleted(false);
  };

  const handleBackClick = () => navigate("/routines");

  const handleAddSet = (exerciseIndex: number) => {
    const updatedExercises = [...editedExercises];
    updatedExercises[exerciseIndex].sets.push({ kg: "", reps: "", completed: false });
    setEditedExercises(updatedExercises);
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...editedExercises];
    updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
    setEditedExercises(updatedExercises);
  };

  const handleSetChange = (
    exerciseIndex: number,
    setIndex: number,
    field: "kg" | "reps",
    value: string
  ) => {
    const updatedExercises = [...editedExercises];
    updatedExercises[exerciseIndex].sets[setIndex][field] = value;
    setEditedExercises(updatedExercises);
  };

  const handleToggleSetCompleted = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...editedExercises];
    updatedExercises[exerciseIndex].sets[setIndex].completed =
      !updatedExercises[exerciseIndex].sets[setIndex].completed;
    setEditedExercises(updatedExercises);
  };

  const handleNoteChange = (exerciseIndex: number, value: string) => {
    const updatedExercises = [...editedExercises];
    updatedExercises[exerciseIndex].note = value;
    setEditedExercises(updatedExercises);
  };

  const handleSaveChanges = async () => {
    if (!routineId) return;
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/routines/${routineId}`, {
        exercises: editedExercises,
      });
      setRoutine({ ...routine!, exercises: editedExercises });
      navigate("/routines");
    } catch (err) {
      console.error("Error al guardar los cambios:", err);
      setError("Error al guardar los cambios.");
    }
  };

  const handleDiscardWorkout = () => navigate("/routines");

  const handleAddExercise = () => {
    navigate("/ejercicios", {
      state: { fromRoutineDetails: true, routineId, existingExercises: editedExercises },
    });
  };

  const calculateProgress = () => {
    const totalSets = editedExercises.reduce((total, exercise) => total + exercise.sets.length, 0);
    const completedSets = editedExercises.reduce(
      (total, exercise) => total + exercise.sets.filter((set) => set.completed).length,
      0
    );
    return totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  };

  const timerProgress = initialTimer > 0 ? ((initialTimer - timer) / initialTimer) * 100 : 0;

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-gray-400">Cargando...</div>;
  }

  if (error || !routine) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error || "Rutina no encontrada."}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white p-4 overflow-y-auto z-10">
      <GalaxyBackground />
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex items-center justify-between p-4 sticky top-0 bg-gray-0 z-20"
      >
        <button onClick={handleBackClick} className="text-white p-2 hover:text-[#ff9404] transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-center flex-1">Registro de Entrenamiento</h1>
        <button
          onClick={handleSaveChanges}
          className="bg-[#ff9404] text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#e08503] transition-colors"
        >
          Finalizar
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="my-4"
      >
        <Progress
          value={calculateProgress()}
          className="w-full h-2 bg-gray-600 rounded-full [&>div]:bg-[#ff9404] [&>div]:rounded-full [&>div]:transition-all [&>div]:duration-[1500ms] [&>div]:ease-out"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="flex justify-between my-4 md:flex-row flex-col gap-2"
      >
        <div className="text-center">
          <p className="text-sm text-gray-400">Duración</p>
          <p className="text-base font-semibold">0s</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-400">Volumen</p>
          <p className="text-base font-semibold">0 kg</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-400">Series</p>
          <p className="text-base font-semibold">
            {editedExercises.reduce((total, exercise) => total + exercise.sets.length, 0)}
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, ease: "easeOut" }}
        className="mt-4"
      >
        {editedExercises.length > 0 ? (
          editedExercises.map((exercise, exerciseIndex) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + exerciseIndex * 0.2, duration: 0.8 }}
              className="bg-gray-700 rounded-xl p-4 mb-4 shadow-lg hover:-translate-y-0.5 transition-transform"
            >
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-400 flex items-center justify-center">
                  <img src={exercise.gifUrl} alt={exercise.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold uppercase">{exercise.name}</h3>
                  <p className="text-sm text-gray-400 uppercase">({exercise.equipment})</p>
                </div>
              </div>

              <div className="my-3">
                <input
                  type="text"
                  placeholder="Añadir notas..."
                  value={exercise.note || ""}
                  onChange={(e) => handleNoteChange(exerciseIndex, e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:border-[#ff9404] outline-none transition-colors"
                />
              </div>

              {exercise.restTimer && (
                <div className="flex gap-4 my-4">
                  <button
                    onClick={() => startRestTimer(exercise.restTimer!)}
                    className="bg-[#ff9404] text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#e08503] transition-colors"
                  >
                    Iniciar Temporizador ({exercise.restTimer})
                  </button>
                </div>
              )}

              <div className="mt-4">
                <div className="flex justify-between py-2 border-b border-gray-600 mb-2">
                  <span className="text-sm font-semibold text-gray-400 flex-1 text-center">SET</span>
                  <span className="text-sm font-semibold text-gray-400 flex-1 text-center">PREVIO</span>
                  <span className="text-sm font-semibold text-gray-400 flex-1 text-center">KG</span>
                  <span className="text-sm font-semibold text-gray-400 flex-1 text-center">REPS</span>
                  <span className="text-sm font-semibold text-gray-400 flex-1 text-center"></span>
                </div>
                {exercise.sets.map((set, setIndex) => (
                  <div key={setIndex} className="flex items-center justify-between gap-2 mb-2">
                    <span className="w-8 text-center text-base">{setIndex + 1}</span>
                    <span className="w-16 text-center text-base">
                      {set.kg && set.reps ? `${set.kg} kg x ${set.reps}` : "-"}
                    </span>
                    <input
                      type="text"
                      placeholder="kg"
                      value={set.kg}
                      onChange={(e) => handleSetChange(exerciseIndex, setIndex, "kg", e.target.value)}
                      className="bg-gray-700 border border-gray-600 rounded-lg p-2 text-white w-16 text-center focus:border-[#ff9404] outline-none transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="reps"
                      value={set.reps}
                      onChange={(e) => handleSetChange(exerciseIndex, setIndex, "reps", e.target.value)}
                      className="bg-gray-700 border border-gray-600 rounded-lg p-2 text-white w-16 text-center focus:border-[#ff9404] outline-none transition-colors"
                    />
                    <button
                      onClick={() => handleToggleSetCompleted(exerciseIndex, setIndex)}
                      className="p-1"
                    >
                      {set.completed ? (
                        <CheckCircle className="w-5 h-5 text-[#ff9404]" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleAddSet(exerciseIndex)}
                  className="w-full bg-transparent border border-[#ff9404] text-[#ff9404] py-2 px-4 rounded-lg hover:bg-[#ff9404] hover:text-black transition-colors text-center"
                >
                  + Añadir Serie
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-gray-400 text-base mt-8">No hay ejercicios en esta rutina.</p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, ease: "easeOut", delay: 1.2 }}
        className="mt-8 flex flex-col gap-4"
      >
        <button
          onClick={handleAddExercise}
          className="bg-[#ff9404] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#e08503] transition-colors text-center"
        >
          + Añadir Ejercicio
        </button>
        <div className="flex gap-4">
          <button className="flex-1 bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-600 transition-colors text-center">
            Configuración
          </button>
          <button
            onClick={handleDiscardWorkout}
            className="flex-1 bg-gray-700 text-red-500 py-3 px-4 rounded-lg font-semibold hover:bg-red-500 hover:text-white transition-colors text-center"
          >
            Descartar Entrenamiento
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isTimerModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-30"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-6 w-11/12 max-w-md relative shadow-2xl border border-white/10 text-center"
            >
              <button
                onClick={closeTimerModal}
                className="absolute top-4 right-4 text-white hover:text-red-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-semibold mb-4">Tiempo de Descanso</h2>
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                  <circle className="fill-none stroke-gray-600 stroke-[10]" cx="100" cy="100" r="90" />
                  <circle
                    className="fill-none stroke-[#ff9404] stroke-[10] stroke-linecap-round transition-[stroke-dashoffset] duration-1000 [animation:pulse_2s_infinite_ease-in-out]"
                    cx="100"
                    cy="100"
                    r="90"
                    strokeDasharray="565.48"
                    strokeDashoffset={565.48 * (1 - timerProgress / 100)}
                  />
                </svg>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-bold text-white drop-shadow-md">
                  {timer}s
                </div>
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={toggleTimer}
                  className="bg-[#ff9404] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#e08503] transition-colors hover:scale-105"
                >
                  {isTimerRunning ? "Pausar" : "Reanudar"}
                </button>
                <button
                  onClick={() => startRestTimer(editedExercises[currentExerciseIndex]?.restTimer || "0")}
                  className="bg-[#ff9404] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#e08503] transition-colors hover:scale-105"
                >
                  Reiniciar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {timerCompleted && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-sm"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: -50,
                  rotate: Math.random() * 360,
                }}
                animate={{
                  y: window.innerHeight + 50,
                  rotate: Math.random() * 720,
                  transition: { duration: 2 + Math.random() * 2, ease: "linear" },
                }}
                style={{
                  backgroundColor: ["#ff9404", "#4CAF50", "#2196F3", "#F44336"][Math.floor(Math.random() * 4)],
                  width: Math.random() * 10 + 5,
                  height: Math.random() * 10 + 5,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(RoutineDetails);