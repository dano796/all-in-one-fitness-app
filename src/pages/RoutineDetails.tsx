import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Plus, Trash2, CheckCircle, XCircle, X, ChevronDown, ChevronUp, Clock } from "lucide-react";
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
  series: { sets: { kg: string; reps: string; completed?: boolean }[] }[];
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
  const [expandedExercises, setExpandedExercises] = useState<{ [key: string]: boolean }>({});
  const [customTimer, setCustomTimer] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toLocaleDateString("en-CA") // Formato YYYY-MM-DD
  );
  const dateInputRef = useRef<HTMLInputElement>(null);

  const timerSound = new Audio(timerEndSound);

  const queryParams = new URLSearchParams(location.search);
  const routineId = queryParams.get("id");
  const userEmail = queryParams.get("email") || "";

  const isToday = selectedDate === new Date().toLocaleDateString("en-CA");

  const fetchRoutineDetails = useCallback(async () => {
    if (!routineId) {
      setError("ID de rutina no proporcionado.");
      setLoading(false);
      return;
    }

    try {
      // Limpiar editedExercises antes de cargar nuevos datos
      setEditedExercises([]);

      const response = await axios.get<{ routine: Routine }>(
        `${import.meta.env.VITE_BACKEND_URL}/api/routines/${routineId}`,
        {
          params: { date: selectedDate }, // Filtrar por fecha para cargar historial
        }
      );
      const fetchedRoutine = response.data.routine;

      let exercises: Exercise[] = [];
      if (typeof fetchedRoutine.exercises === "string") {
        exercises = JSON.parse(fetchedRoutine.exercises);
      } else {
        exercises = fetchedRoutine.exercises || [];
      }

      if (!Array.isArray(exercises)) exercises = [];

      exercises = exercises.map((exercise) => {
        return {
          ...exercise,
          series: exercise.series?.length
            ? exercise.series.map((serie) => ({
                sets: serie.sets?.length
                  ? serie.sets.map((set) => ({
                      ...set,
                      kg: set.kg || "0",
                      reps: set.reps || "0",
                      completed: set.completed ?? false,
                    }))
                  : [],
              }))
            : [{ sets: [] }],
          note: exercise.note || '',
        };
      });

      setRoutine(fetchedRoutine);
      setEditedExercises(exercises);
      setError(null);
    } catch (err) {
      console.error("Error al cargar los detalles de la rutina:", err);
      setError("Error al cargar los detalles de la rutina.");
    } finally {
      setLoading(false);
    }
  }, [routineId, selectedDate]);

  useEffect(() => {
    fetchRoutineDetails();
  }, [fetchRoutineDetails]);

  // Advertencia al salir si hay cambios sin guardar
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isToday && JSON.stringify(editedExercises) !== JSON.stringify(routine?.exercises)) {
        e.preventDefault();
        e.returnValue = "Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [editedExercises, routine, isToday]);

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
      setTimeout(() => {
        timerSound.pause();
        timerSound.currentTime = 0;
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timer]);

  const startRestTimer = (restTimer: string) => {
    const seconds = restTimer === "Otro" ? parseInt(customTimer) || 0 : parseInt(restTimer) || 0;
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

  const handleBackClick = () => navigate(`/dashboard?email=${encodeURIComponent(userEmail)}`);

  const saveRoutine = async (updatedExercises: Exercise[], includeFecha: boolean = false) => {
    if (!routineId) return;
    try {
      const payload: { exercises: Exercise[]; fecha?: string } = {
        exercises: updatedExercises,
      };
      if (includeFecha) {
        payload.fecha = new Date().toISOString().split("T")[0]; // Enviar la fecha actual solo al "Finalizar"
      }
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/routines/${routineId}`, payload);
      setRoutine((prev) => (prev ? { ...prev, exercises: updatedExercises } : prev));
    } catch (err) {
      console.error("Error al guardar los cambios automáticamente:", err);
      if (err.response?.status === 403) {
        setError("No se pueden modificar sets de días anteriores.");
      } else {
        setError("Error al guardar los cambios.");
      }
    }
  };

  const handleAddSerie = (exerciseIndex: number) => {
    const updatedExercises = [...editedExercises];
    updatedExercises[exerciseIndex].series.push({ sets: [] });
    setEditedExercises(updatedExercises);
    saveRoutine(updatedExercises); // Guardar cambios estructurales
  };

  const handleRemoveSerie = (exerciseIndex: number, serieIndex: number) => {
    const updatedExercises = [...editedExercises];
    updatedExercises[exerciseIndex].series.splice(serieIndex, 1);
    setEditedExercises(updatedExercises);
    saveRoutine(updatedExercises); // Guardar cambios estructurales
  };

  const handleAddSet = (exerciseIndex: number, serieIndex: number) => {
    const updatedExercises = [...editedExercises];
    updatedExercises[exerciseIndex].series[serieIndex].sets.push({ kg: "", reps: "", completed: false });
    setEditedExercises(updatedExercises);
    saveRoutine(updatedExercises); // Guardar cambios estructurales
  };

  const handleRemoveSet = (exerciseIndex: number, serieIndex: number, setIndex: number) => {
    const updatedExercises = [...editedExercises];
    updatedExercises[exerciseIndex].series[serieIndex].sets.splice(setIndex, 1);
    setEditedExercises(updatedExercises);
    saveRoutine(updatedExercises); // Guardar cambios estructurales
  };

  const handleSetChange = (
    exerciseIndex: number,
    serieIndex: number,
    setIndex: number,
    field: "kg" | "reps",
    value: string
  ) => {
    const updatedExercises = [...editedExercises];
    const updatedSeries = [...updatedExercises[exerciseIndex].series];
    const updatedSets = [...updatedSeries[serieIndex].sets];
    updatedSets[setIndex] = { ...updatedSets[setIndex], [field]: value };
    updatedSeries[serieIndex] = { sets: updatedSets };
    updatedExercises[exerciseIndex] = {
      ...updatedExercises[exerciseIndex],
      series: updatedSeries,
    };
    setEditedExercises(updatedExercises);
    // No guardar automáticamente, se guardará al "Finalizar"
  };

  const handleSetBlur = (exerciseIndex: number, serieIndex: number, setIndex: number) => {
    const updatedExercises = [...editedExercises];
    const updatedSeries = [...updatedExercises[exerciseIndex].series];
    const updatedSets = [...updatedSeries[serieIndex].sets];
    updatedSets[setIndex] = {
      ...updatedSets[setIndex],
      kg: updatedSets[setIndex].kg || "0",
      reps: updatedSets[setIndex].reps || "0",
      completed: updatedSets[setIndex].completed ?? false,
    };
    updatedSeries[serieIndex] = { sets: updatedSets };
    updatedExercises[exerciseIndex] = {
      ...updatedExercises[exerciseIndex],
      series: updatedSeries,
    };
    setEditedExercises(updatedExercises);
    // No guardar automáticamente, se guardará al "Finalizar"
  };

  const handleToggleSetCompleted = (exerciseIndex: number, serieIndex: number, setIndex: number) => {
    const updatedExercises = [...editedExercises];
    const updatedSeries = [...updatedExercises[exerciseIndex].series];
    const updatedSets = [...updatedSeries[serieIndex].sets];
    updatedSets[setIndex] = {
      ...updatedSets[setIndex],
      completed: !updatedSets[setIndex].completed,
    };
    updatedSeries[serieIndex] = { sets: updatedSets };
    updatedExercises[exerciseIndex] = {
      ...updatedExercises[exerciseIndex],
      series: updatedSeries,
    };
    setEditedExercises(updatedExercises);
    // No guardar automáticamente, se guardará al "Finalizar"
  };

  const handleNoteChange = (exerciseIndex: number, value: string) => {
    const updatedExercises = [...editedExercises];
    updatedExercises[exerciseIndex].note = value;
    setEditedExercises(updatedExercises);
    // No guardar automáticamente, se guardará al "Finalizar"
  };

  const handleNoteBlur = (exerciseIndex: number) => {
    // No guardar automáticamente, se guardará al "Finalizar"
  };

  const handleRestTimerChange = (exerciseIndex: number, value: string) => {
    const updatedExercises = [...editedExercises];
    updatedExercises[exerciseIndex].restTimer = value;
    setEditedExercises(updatedExercises);
    saveRoutine(updatedExercises); // Guardar cambios estructurales
  };

  const handleToggleExercise = (exerciseId: string) => {
    setExpandedExercises((prev) => ({
      ...prev,
      [exerciseId]: !prev[exerciseId],
    }));
  };

  const handleFinish = async () => {
    await saveRoutine(editedExercises, true); // Incluir fecha para guardar en HistorialSets
    navigate(`/dashboard?email=${encodeURIComponent(userEmail)}`);
  };

  const handleDiscardWorkout = () => navigate(`/dashboard?email=${encodeURIComponent(userEmail)}`);

  const handleAddExercise = () => {
    navigate("/ejercicios", {
      state: { fromRoutineDetails: true, routineId, existingExercises: editedExercises },
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setSelectedDate(selectedDate);
  };

  const handleDatePicker = () => {
    if (dateInputRef.current) {
      dateInputRef.current.focus();
      dateInputRef.current.showPicker();
    }
  };

  const getDateLabel = () => {
    const selectedDateObj = new Date(selectedDate + "T00:00:00");
    const today = new Date(new Date().toLocaleDateString("en-CA") + "T00:00:00");
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (selectedDateObj.getTime() === today.getTime()) return "Hoy";
    if (selectedDateObj.getTime() === yesterday.getTime()) return "Ayer";
    return selectedDateObj.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const calculateProgress = () => {
    const totalSets = editedExercises.reduce(
      (total, exercise) =>
        total + exercise.series.reduce((serieTotal, serie) => serieTotal + serie.sets.length, 0),
      0
    );
    const completedSets = editedExercises.reduce(
      (total, exercise) =>
        total +
        exercise.series.reduce(
          (serieTotal, serie) =>
            serieTotal + serie.sets.filter((set) => set.completed).length,
          0
        ),
      0
    );
    return totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  };

  const hasSetsForDate = () => {
    return editedExercises.some((exercise) =>
      exercise.series.some((serie) => serie.sets.length > 0)
    );
  };

  const timerProgress = initialTimer > 0 ? ((initialTimer - timer) / initialTimer) * 100 : 0;

  // Clase común para los botones con el estilo del botón de fecha
  const dateButtonStyle = "px-6 py-3 bg-gradient-to-br from-[#2D3242] to-[#3B4252] text-gray-200 font-semibold rounded-lg border border-[#ff9404] shadow-[0_0_10px_rgba(255,148,4,0.3)] hover:bg-gradient-to-br hover:from-[#3B4252] hover:to-[#4B5563] hover:shadow-[0_0_15px_rgba(255,148,4,0.5)] hover:scale-105 active:scale-95 transition-all duration-300";

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
        <div className="flex-1 text-center">
          <button
            onClick={handleDatePicker}
            className={dateButtonStyle}
          >
            {getDateLabel()}
          </button>
          <input
            type="date"
            ref={dateInputRef}
            value={selectedDate}
            onChange={handleDateChange}
            max={new Date().toLocaleDateString("en-CA")}
            className="absolute opacity-0 w-0 h-0 pointer-events-none"
          />
        </div>
        {isToday && (
          <button
            onClick={handleFinish}
            className={dateButtonStyle}
          >
            Finalizar
          </button>
        )}
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
            {editedExercises.reduce(
              (total, exercise) => total + exercise.series.length,
              0
            )}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-400">Sets</p>
          <p className="text-base font-semibold">
            {editedExercises.reduce(
              (total, exercise) =>
                total + exercise.series.reduce((serieTotal, serie) => serieTotal + serie.sets.length, 0),
              0
            )}
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
              className="bg-[#3B4252] rounded-xl p-4 mb-4 shadow-lg hover:-translate-y-0.5 transition-transform"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-400 flex items-center justify-center">
                    <img src={exercise.gifUrl} alt={exercise.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold uppercase">{exercise.name}</h3>
                    <p className="text-sm text-gray-400 uppercase">({exercise.equipment})</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleExercise(exercise.id)}
                  className="bg-transparent border-none cursor-pointer p-1 transition-transform duration-200 hover:scale-125 active:scale-90"
                >
                  {expandedExercises[exercise.id] ? (
                    <ChevronUp className="w-5 h-5 text-[#ff9404] hover:text-[#e08503] transition-colors duration-300" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#ff9404] hover:text-[#e08503] transition-colors duration-300" />
                  )}
                </button>
              </div>

              {expandedExercises[exercise.id] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  {isToday && (
                    <>
                      <div className="my-3">
                        <input
                          type="text"
                          placeholder="Añadir notas..."
                          value={exercise.note || ""}
                          onChange={(e) => handleNoteChange(exerciseIndex, e.target.value)}
                          onBlur={() => handleNoteBlur(exerciseIndex)}
                          className="w-full bg-[#4B5563] border border-gray-600 rounded-lg p-2 text-white focus:border-[#ff9404] outline-none transition-colors"
                        />
                      </div>

                      <div className="flex flex-col gap-2 mb-4">
                        <label className="text-base font-medium text-white">
                          Temporizador de descanso:
                        </label>
                        <select
                          value={exercise.restTimer || "Apagado"}
                          onChange={(e) => handleRestTimerChange(exerciseIndex, e.target.value)}
                          className="w-full max-w-[200px] p-3 rounded-lg border border-gray-600 bg-[#4B5563] text-base text-white transition-all duration-300 placeholder-gray-400 focus:outline-none focus:border-[#ff9404] focus:shadow-[0_0_8px_rgba(255,148,4,0.2)] focus:bg-[#4B5563] focus:scale-102"
                        >
                          <option value="Apagado">Apagado</option>
                          <option value="30">30 segundos</option>
                          <option value="60">60 segundos</option>
                          <option value="90">90 segundos</option>
                          <option value="Otro">Otro</option>
                        </select>
                        {exercise.restTimer === "Otro" && (
                          <input
                            type="number"
                            placeholder="Segundos"
                            value={customTimer}
                            onChange={(e) => setCustomTimer(e.target.value)}
                            className="mt-2 w-full max-w-[200px] p-3 rounded-lg border border-gray-600 bg-[#4B5563] text-base text-white transition-all duration-300 placeholder-gray-400 focus:outline-none focus:border-[#ff9404] focus:shadow-[0_0_8px_rgba(255,148,4,0.2)] focus:bg-[#4B5563] focus:scale-102"
                          />
                        )}
                      </div>

                      {exercise.restTimer && exercise.restTimer !== "Apagado" && (
                        <div className="flex gap-4 my-4">
                          <button
                            onClick={() => startRestTimer(exercise.restTimer!)}
                            className="text-[#ff9404] hover:text-[#e08503] transition-colors"
                          >
                            <Clock className="w-6 h-6" />
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {(isToday || hasSetsForDate()) && (
                    <div className="mt-4">
                      {exercise.series.map((serie, serieIndex) => (
                        <div key={serieIndex} className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-base font-semibold text-white">Serie {serieIndex + 1}</h4>
                            {isToday && exercise.series.length > 1 && (
                              <button
                                onClick={() => handleRemoveSerie(exerciseIndex, serieIndex)}
                                className="text-red-500 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                          {serie.sets.length > 0 && (
                            <div className="flex justify-between py-2 border-b border-gray-600 mb-2">
                              <span className="text-sm font-semibold text-gray-400 flex-1 text-center">SET</span>
                              <span className="text-sm font-semibold text-gray-400 flex-1 text-center">PREVIO</span>
                              <span className="text-sm font-semibold text-gray-400 flex-1 text-center">KG</span>
                              <span className="text-sm font-semibold text-gray-400 flex-1 text-center">REPS</span>
                              <span className="text-sm font-semibold text-gray-400 flex-1 text-center"></span>
                              {isToday && <span className="text-sm font-semibold text-gray-400 flex-1 text-center"></span>}
                            </div>
                          )}
                          {serie.sets.map((set, setIndex) => (
                            <div key={setIndex} className="flex items-center justify-between gap-2 mb-2">
                              <span className="w-8 text-center text-base">{setIndex + 1}</span>
                              <span className="w-16 text-center text-base">
                                {set.kg && set.reps ? `${set.kg} kg x ${set.reps}` : "-"}
                              </span>
                              <input
                                type="text"
                                placeholder="kg"
                                value={set.kg}
                                onChange={(e) =>
                                  handleSetChange(exerciseIndex, serieIndex, setIndex, "kg", e.target.value)
                                }
                                onBlur={() => handleSetBlur(exerciseIndex, serieIndex, setIndex)}
                                className="bg-[#4B5563] border border-gray-600 rounded-lg p-2 text-white w-16 text-center focus:border-[#ff9404] outline-none transition-colors"
                                disabled={!isToday}
                              />
                              <input
                                type="text"
                                placeholder="reps"
                                value={set.reps}
                                onChange={(e) =>
                                  handleSetChange(exerciseIndex, serieIndex, setIndex, "reps", e.target.value)
                                }
                                onBlur={() => handleSetBlur(exerciseIndex, serieIndex, setIndex)}
                                className="bg-[#4B5563] border border-gray-600 rounded-lg p-2 text-white w-16 text-center focus:border-[#ff9404] outline-none transition-colors"
                                disabled={!isToday}
                              />
                              <button
                                onClick={() => handleToggleSetCompleted(exerciseIndex, serieIndex, setIndex)}
                                className="p-1"
                                disabled={!isToday}
                              >
                                {set.completed ? (
                                  <CheckCircle className="w-5 h-5 text-[#ff9404]" />
                                ) : (
                                  <CheckCircle className="w-5 h-5 text-gray-500" />
                                )}
                              </button>
                              {isToday && (
                                <button
                                  onClick={() => handleRemoveSet(exerciseIndex, serieIndex, setIndex)}
                                  className="text-red-500 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          ))}
                          {isToday && (
                            <button
                              onClick={() => handleAddSet(exerciseIndex, serieIndex)}
                              className={`w-full ${dateButtonStyle} mt-2`}
                            >
                              + Añadir Set
                            </button>
                          )}
                        </div>
                      ))}
                      {isToday && (
                        <button
                          onClick={() => handleAddSerie(exerciseIndex)}
                          className={`w-full ${dateButtonStyle} mt-2`}
                        >
                          + Añadir Serie
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))
        ) : (
          <p className="text-center text-gray-400 text-base mt-8">No hay ejercicios en esta rutina.</p>
        )}
        {editedExercises.length > 0 && !hasSetsForDate() && (
          <p className="text-center text-gray-400 text-base mt-4">
            No hay sets registrados para esta fecha.
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, ease: "easeOut", delay: 1.2 }}
        className="mt-8 flex flex-col gap-4"
      >
        {isToday && (
          <button
            onClick={handleAddExercise}
            className={`w-full ${dateButtonStyle}`}
          >
            + Añadir Ejercicio
          </button>
        )}
        <div className="flex gap-4">
          {isToday && (
            <button
              className={`flex-1 ${dateButtonStyle}`}
            >
              Configuración
            </button>
          )}
          <button
            onClick={handleDiscardWorkout}
            className={`flex-1 ${dateButtonStyle}`}
          >
            Descartar Entrenamiento
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isTimerModalOpen && isToday && (
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
                  className={dateButtonStyle}
                >
                  {isTimerRunning ? "Pausar" : "Reanudar"}
                </button>
                <button
                  onClick={() => startRestTimer(editedExercises[currentExerciseIndex]?.restTimer || "0")}
                  className={dateButtonStyle}
                >
                  Reiniciar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {timerCompleted && isToday && (
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