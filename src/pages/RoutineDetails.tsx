import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Plus, Trash2, CheckCircle, XCircle, X } from "lucide-react";
import axios from "axios";
import GalaxyBackground from "../components/GalaxyBackground";
import { Progress } from "@/components/ui/progress";
import styles from "../components/RoutineDetails.module.css";

// Importar el sonido (asegúrate de tener un archivo de audio en tu proyecto)
import timerEndSound from "../assets/sounds/timer-end.mp3.wav"; // Asegúrate de agregar este archivo

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
  const [initialTimer, setInitialTimer] = useState<number>(0); // Para calcular el progreso
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState<boolean>(false);
  const [timerCompleted, setTimerCompleted] = useState<boolean>(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);

  // Crear una instancia del objeto Audio para el sonido
  const timerSound = new Audio(timerEndSound);

  // Obtener el ID de la rutina desde los parámetros de la URL
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
        try {
          exercises = JSON.parse(fetchedRoutine.exercises);
        } catch (parseError) {
          console.error("Error parsing exercises:", parseError);
          exercises = [];
        }
      } else {
        exercises = fetchedRoutine.exercises || [];
      }

      if (!Array.isArray(exercises)) {
        console.error("Exercises is not an array:", exercises);
        exercises = [];
      }

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
      setError("Error al cargar los detalles de la rutina.");
    } finally {
      setLoading(false);
    }
  }, [routineId]);

  useEffect(() => {
    fetchRoutineDetails();
  }, [fetchRoutineDetails]);

  // Temporizador de descanso
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
      // Reproducir el sonido al finalizar
      timerSound.play().catch((err) => console.error("Error al reproducir el sonido:", err));
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timer, timerSound]);

  const startRestTimer = (restTimer: string) => {
    const seconds = parseInt(restTimer) || 0;
    setTimer(seconds);
    setInitialTimer(seconds); // Guardar el tiempo inicial para el círculo de progreso
    setIsTimerRunning(true);
    setIsTimerModalOpen(true);
    setTimerCompleted(false);
  };

  const toggleTimer = () => {
    setIsTimerRunning((prev) => !prev);
  };

  const closeTimerModal = () => {
    setIsTimerModalOpen(false);
    setIsTimerRunning(false);
    setTimer(0);
    setTimerCompleted(false);
  };

  const handleBackClick = () => {
    navigate("/routines");
  };

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
      setError("Error al guardar los cambios.");
    }
  };

  const handleDiscardWorkout = () => {
    navigate("/routines");
  };

  const handleAddExercise = () => {
    navigate("/ejercicios", {
      state: {
        fromRoutineDetails: true,
        routineId: routineId,
        existingExercises: editedExercises,
      },
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

  // Calcular el progreso del temporizador para el círculo
  const timerProgress = initialTimer > 0 ? ((initialTimer - timer) / initialTimer) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        Cargando...
      </div>
    );
  }

  if (error || !routine) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error || "Rutina no encontrada."}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <GalaxyBackground />
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={styles.header}
      >
        <button onClick={handleBackClick} className={styles.backButton}>
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className={styles.title}>Log Workout</h1>
        <button onClick={handleSaveChanges} className={styles.finishButton}>
          Finalizar
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className={styles.progressContainer}
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
        className={styles.statsContainer}
      >
        <div className={styles.stat}>
          <p className={styles.statLabel}>Duración</p>
          <p className={styles.statValue}>0s</p>
        </div>
        <div className={styles.stat}>
          <p className={styles.statLabel}>Volumen</p>
          <p className={styles.statValue}>0 kg</p>
        </div>
        <div className={styles.stat}>
          <p className={styles.statLabel}>Series</p>
          <p className={styles.statValue}>
            {editedExercises.reduce((total, exercise) => total + exercise.sets.length, 0)}
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, ease: "easeOut" }}
        className={styles.exerciseList}
      >
        {editedExercises.length > 0 ? (
          editedExercises.map((exercise, exerciseIndex) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + exerciseIndex * 0.2, duration: 0.8 }}
              className={styles.exerciseCard}
            >
              <div className={styles.exerciseHeader}>
                <div className={styles.exerciseIcon}>
                  <img src={exercise.gifUrl} alt={exercise.name} className={styles.exerciseGif} />
                </div>
                <div>
                  <h3 className={styles.exerciseName}>{exercise.name}</h3>
                  <p className={styles.exerciseEquipment}>({exercise.equipment})</p>
                </div>
              </div>

              <div className={styles.noteContainer}>
                <input
                  type="text"
                  placeholder="Añadir notas..."
                  value={exercise.note || ""}
                  onChange={(e) => handleNoteChange(exerciseIndex, e.target.value)}
                  className={styles.noteInput}
                />
              </div>

              {exercise.restTimer && (
                <div className={styles.timerContainer}>
                  <button
                    onClick={() => startRestTimer(exercise.restTimer!)}
                    className={styles.timerButton}
                  >
                    Iniciar Temporizador ({exercise.restTimer})
                  </button>
                </div>
              )}

              <div className={styles.setsContainer}>
                <div className={styles.setsHeader}>
                  <span className={styles.setHeader}>SET</span>
                  <span className={styles.setHeader}>PREVIO</span>
                  <span className={styles.setHeader}>KG</span>
                  <span className={styles.setHeader}>REPS</span>
                  <span className={styles.setHeader}></span>
                </div>
                {exercise.sets.map((set, setIndex) => (
                  <div key={setIndex} className={styles.setRow}>
                    <span className={styles.setNumber}>{setIndex + 1}</span>
                    <span className={styles.setPrevious}>
                      {set.kg && set.reps ? `${set.kg} kg x ${set.reps}` : "-"}
                    </span>
                    <input
                      type="text"
                      placeholder="kg"
                      value={set.kg}
                      onChange={(e) =>
                        handleSetChange(exerciseIndex, setIndex, "kg", e.target.value)
                      }
                      className={styles.setInput}
                    />
                    <input
                      type="text"
                      placeholder="reps"
                      value={set.reps}
                      onChange={(e) =>
                        handleSetChange(exerciseIndex, setIndex, "reps", e.target.value)
                      }
                      className={styles.setInput}
                    />
                    <button
                      onClick={() => handleToggleSetCompleted(exerciseIndex, setIndex)}
                      className={styles.checkButton}
                    >
                      {set.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleAddSet(exerciseIndex)}
                  className={styles.addSetButton}
                >
                  + Añadir Serie
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <p className={styles.empty}>No hay ejercicios en esta rutina.</p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, ease: "easeOut", delay: 1.2 }}
        className={styles.actionButtons}
      >
        <button onClick={handleAddExercise} className={styles.addExerciseButton}>
          + Añadir Ejercicio
        </button>
        <div className={styles.secondaryActions}>
          <button className={styles.settingsButton}>Configuración</button>
          <button onClick={handleDiscardWorkout} className={styles.discardButton}>
            Descartar Entrenamiento
          </button>
        </div>
      </motion.div>

      {/* Modal del temporizador */}
      <AnimatePresence>
        {isTimerModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={styles.timerModalOverlay}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={styles.timerModal}
            >
              <button onClick={closeTimerModal} className={styles.closeModalButton}>
                <X className="w-6 h-6" />
              </button>
              <h2 className={styles.timerModalTitle}>Tiempo de Descanso</h2>
              <div className={styles.timerCircleContainer}>
                <svg className={styles.timerCircleSvg} viewBox="0 0 200 200">
                  <circle
                    className={styles.timerCircleBackground}
                    cx="100"
                    cy="100"
                    r="90"
                    strokeWidth="10"
                  />
                  <circle
                    className={styles.timerCircleProgress}
                    cx="100"
                    cy="100"
                    r="90"
                    strokeWidth="10"
                    strokeDasharray="565.48"
                    strokeDashoffset={565.48 * (1 - timerProgress / 100)}
                  />
                </svg>
                <div className={styles.timerDisplay}>{timer}s</div>
              </div>
              <div className={styles.timerModalActions}>
                <button onClick={toggleTimer} className={styles.timerModalButton}>
                  {isTimerRunning ? "Pausar" : "Reanudar"}
                </button>
                <button
                  onClick={() => startRestTimer(editedExercises[currentExerciseIndex]?.restTimer || "0")}
                  className={styles.timerModalButton}
                >
                  Reiniciar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animación de confeti al finalizar el temporizador */}
      <AnimatePresence>
        {timerCompleted && (
          <motion.div
            className={styles.confettiContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className={styles.confettiPiece}
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: -50,
                  rotate: Math.random() * 360,
                }}
                animate={{
                  y: window.innerHeight + 50,
                  rotate: Math.random() * 720,
                  transition: {
                    duration: 2 + Math.random() * 2,
                    ease: "linear",
                  },
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