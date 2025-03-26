import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaChevronDown, FaChevronUp, FaMinus } from 'react-icons/fa';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import GalaxyBackground from '../components/GalaxyBackground';

interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  gifUrl: string;
  target: string;
  secondaryMuscles: string[];
  instructions: string[];
  sets?: { kg: string; reps: string }[];
  restTimer?: string;
  note?: string;
}

interface Routine {
  id: string;
  day: string;
  name: string;
  exercises: Exercise[];
}

const ExerciseList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const fromRoutineDetails = location.state?.fromRoutineDetails || false;
  const routineId = location.state?.routineId || null;
  const existingExercises = location.state?.existingExercises || [];

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [newRoutine, setNewRoutine] = useState<{
    day: string;
    name: string;
    exercises: Exercise[];
  }>({
    day: '',
    name: '',
    exercises: existingExercises,
  });
  const [userEmail, setUserEmail] = useState<string>('');
  const [expandedExercises, setExpandedExercises] = useState<{ [key: string]: boolean }>({});

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  const bodyParts = [
    { value: 'back', label: 'Espalda' },
    { value: 'cardio', label: 'Cardio' },
    { value: 'chest', label: 'Pecho' },
    { value: 'lower arms', label: 'Brazos inferiores' },
    { value: 'lower legs', label: 'Piernas inferiores' },
    { value: 'neck', label: 'Cuello' },
    { value: 'shoulders', label: 'Hombros' },
    { value: 'upper arms', label: 'Brazos superiores' },
    { value: 'upper legs', label: 'Piernas superiores' },
    { value: 'waist', label: 'Cintura' },
  ];

  const days = [
    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setError("Debes iniciar sesión para crear una rutina.");
        navigate("/login");
      } else {
        setUserEmail(user.email || "");
      }
    };
    checkAuth();
  }, [navigate]);

  const fetchExercises = useCallback(async () => {
    if (!selectedBodyPart) {
      setExercises([]);
      setSelectedExercise(null);
      return;
    }

    setLoading(true);
    setError(null);
    setExercises([]);
    setSelectedExercise(null);

    try {
      const response = await axios.get<Exercise[]>(`${backendUrl}/api/exercises`, {
        params: { bodyPart: selectedBodyPart, t: Date.now() },
        headers: { 'Content-Type': 'application/json' },
      });
      setExercises(response.data);
      if (response.data.length > 0) {
        setSelectedExercise(response.data[0]);
      }
    } catch (err) {
      setError('Error al consultar los ejercicios');
    } finally {
      setLoading(false);
    }
  }, [backendUrl, selectedBodyPart]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const handleBodyPartChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBodyPart(e.target.value);
  };

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
  };

  const handleAddExerciseToRoutine = (exercise: Exercise) => {
    setNewRoutine((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          ...exercise,
          sets: [{ kg: '', reps: '' }],
          restTimer: 'Apagado',
          note: '',
        },
      ],
    }));
    setExpandedExercises((prev) => ({
      ...prev,
      [exercise.id]: true,
    }));
  };

  const handleRemoveExerciseFromRoutine = (exerciseId: string) => {
    setNewRoutine((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((ex) => ex.id !== exerciseId),
    }));
    setExpandedExercises((prev) => {
      const newExpanded = { ...prev };
      delete newExpanded[exerciseId];
      return newExpanded;
    });
  };

  const handleAddSet = (exerciseId: string) => {
    setNewRoutine((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, sets: [...(ex.sets || []), { kg: '', reps: '' }] }
          : ex
      ),
    }));
  };

  const handleRemoveSet = (exerciseId: string, setIndex: number) => {
    setNewRoutine((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, sets: (ex.sets || []).filter((_, idx) => idx !== setIndex) }
          : ex
      ),
    }));
  };

  const handleUpdateSet = (exerciseId: string, setIndex: number, field: 'kg' | 'reps', value: string) => {
    setNewRoutine((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) =>
        ex.id === exerciseId
          ? {
            ...ex,
            sets: (ex.sets || []).map((set, idx) =>
              idx === setIndex ? { ...set, [field]: value } : set
            ),
          }
          : ex
      ),
    }));
  };

  const handleUpdateRestTimer = (exerciseId: string, value: string) => {
    setNewRoutine((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, restTimer: value } : ex
      ),
    }));
  };

  const handleUpdateNote = (exerciseId: string, value: string) => {
    setNewRoutine((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, note: value } : ex
      ),
    }));
  };

  const handleToggleExercise = (exerciseId: string) => {
    setExpandedExercises((prev) => ({
      ...prev,
      [exerciseId]: !prev[exerciseId],
    }));
  };

  const handleSaveRoutine = async () => {
    if (fromRoutineDetails) {
      if (newRoutine.exercises.length === 0) {
        setError('Por favor, agrega al menos un ejercicio.');
        return;
      }

      try {
        await axios.put(`${backendUrl}/api/routines/${routineId}`, {
          exercises: newRoutine.exercises,
        });
        navigate(`/routine-details?id=${routineId}`);
      } catch (err) {
        setError('Error al actualizar la rutina');
      }
    } else {
      if (!newRoutine.day || !newRoutine.name || newRoutine.exercises.length === 0) {
        setError('Por favor, completa todos los campos y agrega al menos un ejercicio.');
        return;
      }

      try {
        await axios.post(`${backendUrl}/api/routines`, {
          user_email: userEmail,
          day: newRoutine.day,
          name: newRoutine.name,
          exercises: newRoutine.exercises,
        });
        navigate('/routines');
      } catch (err) {
        setError('Error al guardar la rutina');
      }
    }
  };

  const handleBackClick = () => {
    if (fromRoutineDetails) {
      navigate(`/routine-details?id=${routineId}`);
    } else {
      navigate('/routines');
    }
  };

  return (
    <>
      <style>
        {`
          .custom-scroll::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scroll::-webkit-scrollbar-track {
            background: #3b4252;
            border-radius: 4px;
          }
          .custom-scroll::-webkit-scrollbar-thumb {
            background: #9ca3af;
            border-radius: 4px;
          }
          .custom-scroll::-webkit-scrollbar-thumb:hover {
            background: #b0b7c3;
          }
          .custom-scroll {
            scrollbar-width: thin;
            scrollbar-color: #9ca3af #3b4252;
          }

          /* Opción para ocultar el scrollbar pero mantener la funcionalidad de desplazamiento */
          .hide-scroll::-webkit-scrollbar {
            display: none;
          }
          .hide-scroll {
            -ms-overflow-style: none;  /* IE y Edge */
            scrollbar-width: none;  /* Firefox */
          }
        `}
      </style>

      <div className="relative flex flex-col gap-4 p-4 min-h-screen overflow-hidden z-10">
        <GalaxyBackground />

        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="flex justify-start mb-4"
        >
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ff9404] to-[#e08503] text-white font-semibold text-base rounded-lg shadow-[0_0_10px_rgba(255,148,4,0.3)] transition-all duration-300 hover:bg-gradient-to-r hover:from-[#e08503] hover:to-[#ff9404] hover:shadow-[0_0_15px_rgba(255,148,4,0.5)] hover:scale-105 active:scale-95"
          >
            <FaArrowLeft className="w-4 h-4" />
            Volver
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="max-w-[1200px] w-full mx-auto relative z-10"
        >
          {!fromRoutineDetails && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="flex flex-col gap-4 mb-8 bg-gray-700 p-6 rounded-xl min-h-[120px]"
            >
              <div className="flex flex-col gap-2">
                <label className="text-base font-medium text-white text-left">Día de la semana:</label>
                <select
                  value={newRoutine.day}
                  onChange={(e) => setNewRoutine({ ...newRoutine, day: e.target.value })}
                  className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-base text-white transition-all duration-300 placeholder-gray-400 focus:outline-none focus:border-[#ff9404] focus:shadow-[0_0_8px_rgba(255,148,4,0.2)] focus:bg-gray-800 focus:scale-102"
                >
                  <option value="">Selecciona un día</option>
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-base font-medium text-white text-left">Nombre de la rutina:</label>
                <input
                  type="text"
                  value={newRoutine.name}
                  onChange={(e) => setNewRoutine({ ...newRoutine, name: e.target.value })}
                  placeholder="Nombre de la rutina"
                  className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-base text-white transition-all duration-300 placeholder-gray-400 focus:outline-none focus:border-[#ff9404] focus:shadow-[0_0_8px_rgba(255,148,4,0.2)] focus:bg-gray-800 focus:scale-102"
                />
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            className="flex flex-col lg:flex-row gap-6 mb-8"
          >
            <div className="flex-[2] bg-gray-700 rounded-xl p-6 min-h-[350px] max-h-[60vh] h-[600px] flex flex-col">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-xl font-semibold text-white mb-6"
              >
                Lista de Ejercicios
              </motion.h2>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="mb-6"
              >
                <label className="text-base font-medium text-white text-left">Selecciona una parte del cuerpo:</label>
                <select
                  value={selectedBodyPart}
                  onChange={handleBodyPartChange}
                  className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-base text-white transition-all duration-300 placeholder-gray-400 focus:outline-none focus:border-[#ff9404] focus:shadow-[0_0_8px_rgba(255,148,4,0.2)] focus:bg-gray-800 focus:scale-102 disabled:opacity-50"
                  disabled={loading}
                >
                  <option value="">Selecciona</option>
                  {bodyParts.map((part) => (
                    <option key={part.value} value={part.value}>
                      {part.label}
                    </option>
                  ))}
                </select>
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="text-base font-semibold text-white mb-4"
              >
                Resultados
              </motion.h3>
              {loading && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-gray-400 text-center text-base flex-1 flex items-center justify-center"
                >
                  Cargando...
                </motion.p>
              )}
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-red-500 text-center text-base flex-1 flex items-center justify-center"
                >
                  {error}
                </motion.p>
              )}
              {!loading && !error && selectedBodyPart && exercises.length > 0 && (
                <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scroll">
                  {exercises.map((exercise, index) => (
                    <motion.div
                      key={exercise.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0 + index * 0.3, duration: 1.0 }}
                      onClick={() => handleExerciseClick(exercise)}
                      className={`p-4 rounded-lg bg-gray-700 cursor-pointer flex items-center gap-4 transition-colors duration-200 hover:bg-gray-600 ${selectedExercise?.id === exercise.id ? 'bg-[#ff9404]' : ''}`}
                    >
                      <img
                        src={exercise.gifUrl}
                        alt={exercise.name}
                        className="w-12 h-12 object-contain rounded-lg"
                      />
                      <p className="text-base font-medium text-white">{exercise.name}</p>
                    </motion.div>
                  ))}
                </div>
              )}
              {!loading && !error && selectedBodyPart && exercises.length === 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-gray-400 text-center text-base flex-1 flex items-center justify-center"
                >
                  No se encontraron ejercicios para esta parte del cuerpo.
                </motion.p>
              )}
              {!selectedBodyPart && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-gray-400 text-center text-base flex-1 flex items-center justify-center"
                >
                  Por favor, selecciona una parte del cuerpo para ver los ejercicios.
                </motion.p>
              )}
            </div>

            {selectedExercise && (
              <div className="flex-[3] bg-gray-700 rounded-xl p-6 min-h-[350px] max-h-[60vh] h-[600px] flex flex-col">
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="text-2xl font-semibold text-white mb-6"
                >
                  {selectedExercise.name}
                </motion.h2>
                <div className="flex gap-6 mb-6 flex-1 overflow-y-auto custom-scroll">
                  <div className="relative flex-1">
                    <img
                      src={selectedExercise.gifUrl}
                      alt={selectedExercise.name}
                      className="w-full h-[12rem] lg:h-[40vh] lg:max-h-[20rem] object-contain rounded-lg"
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-white/30 pointer-events-none">
                      EXERCISEDB
                    </div>
                  </div>
                  <div className="flex-1 text-white overflow-y-auto custom-scroll">
                    <p className="mb-3 text-base"><strong className="text-[#ff9404]">Parte del cuerpo:</strong> {selectedExercise.bodyPart}</p>
                    <p className="mb-3 text-base"><strong className="text-[#ff9404]">Equipo:</strong> {selectedExercise.equipment}</p>
                    <p className="mb-3 text-base"><strong className="text-[#ff9404]">Objetivo:</strong> {selectedExercise.target}</p>
                    <p className="mb-3 text-base"><strong className="text-[#ff9404]">Músculos secundarios:</strong> {selectedExercise.secondaryMuscles.join(', ')}</p>
                    <p className="mb-3 text-base"><strong className="text-[#ff9404]">Instrucciones:</strong></p>
                    <ul className="list-disc pl-6 text-base">
                      {selectedExercise.instructions.map((instruction, index) => (
                        <li key={index} className="mb-2">{instruction}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.0, duration: 0.8 }}
                  onClick={() => handleAddExerciseToRoutine(selectedExercise)}
                  className="w-full py-3 bg-gradient-to-r from-[#ff9404] to-[#e08503] rounded-lg text-base font-medium text-white shadow-[0_0_10px_rgba(255,148,4,0.3)] transition-all duration-300 hover:bg-gradient-to-r hover:from-[#e08503] hover:to-[#ff9404] hover:shadow-[0_0_15px_rgba(255,148,4,0.5)] hover:scale-105 active:scale-95"
                >
                  Agregar a la rutina
                </motion.button>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.6 }}
            className="bg-gray-700 rounded-xl p-6 min-h-[150px] max-h-[350px] lg:max-h-[600px] overflow-y-auto custom-scroll"
          >
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-xl font-semibold text-white mb-6"
            >
              Ejercicios de la rutina
            </motion.h2>
            {newRoutine.exercises.length > 0 ? (
              newRoutine.exercises.map((exercise, index) => (
                <motion.div
                  key={exercise.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 + index * 0.3, duration: 1.0 }}
                  className="max-w-full bg-gray-700 rounded-lg p-4 mb-6 transition-colors duration-200 hover:bg-gray-600"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <img
                        src={exercise.gifUrl}
                        alt={exercise.name}
                        className="w-12 h-12 object-contain rounded-lg"
                      />
                      <h3 className="text-base font-semibold text-white">{exercise.name} ({exercise.equipment})</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.2 + index * 0.3, duration: 0.8 }}
                        onClick={() => handleToggleExercise(exercise.id)}
                        className="bg-transparent border-none cursor-pointer p-1 transition-transform duration-200 hover:scale-125 active:scale-90"
                      >
                        {expandedExercises[exercise.id] ? (
                          <FaChevronUp className="w-5 h-5 text-[#ff9404] hover:text-[#e08503] transition-colors duration-300" />
                        ) : (
                          <FaChevronDown className="w-5 h-5 text-[#ff9404] hover:text-[#e08503] transition-colors duration-300" />
                        )}
                      </motion.button>
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.2 + index * 0.3, duration: 0.8 }}
                        onClick={() => handleRemoveExerciseFromRoutine(exercise.id)}
                        className="bg-transparent border-none cursor-pointer p-1 transition-transform duration-200 hover:scale-125 active:scale-90"
                      >
                        <span className="text-red-500 text-xl hover:text-red-600 transition-colors duration-300">🗑️</span>
                      </motion.button>
                    </div>
                  </div>
                  {expandedExercises[exercise.id] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-2">
                        <label className="text-base font-medium text-white ml-4">Nota:</label>
                        <input
                          type="text"
                          value={exercise.note || ''}
                          onChange={(e) => handleUpdateNote(exercise.id, e.target.value)}
                          placeholder="Agregar nota"
                          className="w-full max-w-[300px] p-3 rounded-lg border border-gray-600 bg-gray-700 text-base text-white ml-4 transition-all duration-300 placeholder-gray-400 focus:outline-none focus:border-[#ff9404] focus:shadow-[0_0_8px_rgba(255,148,4,0.2)] focus:bg-gray-800 focus:scale-102"
                        />
                      </div>
                      <div className="flex flex-col gap-2 mt-2">
                        <label className="text-base font-medium text-white ml-4">Temporizador de descanso:</label>
                        <select
                          value={exercise.restTimer || 'Apagado'}
                          onChange={(e) => handleUpdateRestTimer(exercise.id, e.target.value)}
                          className="w-full max-w-[200px] p-3 rounded-lg border border-gray-600 bg-gray-700 text-base text-white ml-4 transition-all duration-300 placeholder-gray-400 focus:outline-none focus:border-[#ff9404] focus:shadow-[0_0_8px_rgba(255,148,4,0.2)] focus:bg-gray-800 focus:scale-102"
                        >
                          <option value="Apagado">Apagado</option>
                          <option value="30 segundos">30 segundos</option>
                          <option value="60 segundos">60 segundos</option>
                          <option value="90 segundos">90 segundos</option>
                        </select>
                      </div>
                      <div className="mt-2">
                        <div className="grid grid-cols-[1fr_2fr_2fr] items-center text-base font-medium text-white mb-2 text-center">
                          <span>SET</span>
                          <span>KG</span>
                          <span>REPS</span>
                        </div>
                        {(exercise.sets || []).map((set, setIndex) => (
                          <div key={setIndex} className="grid grid-cols-[1fr_2fr_2fr] items-center gap-3 mt-2">
                            <span className="text-base text-center text-white">{setIndex + 1}</span>
                            <div className="flex flex-col items-center">
                              <input
                                type="text"
                                value={set.kg}
                                onChange={(e) =>
                                  handleUpdateSet(exercise.id, setIndex, 'kg', e.target.value)
                                }
                                placeholder="KG"
                                className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-base text-white transition-all duration-300 placeholder-gray-400 focus:outline-none focus:border-[#ff9404] focus:shadow-[0_0_8px_rgba(255,148,4,0.2)] focus:bg-gray-800 focus:scale-102"
                              />
                            </div>
                            <div className="flex flex-col items-center">
                              <input
                                type="text"
                                value={set.reps}
                                onChange={(e) =>
                                  handleUpdateSet(exercise.id, setIndex, 'reps', e.target.value)
                                }
                                placeholder="REPS"
                                className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-base text-white transition-all duration-300 placeholder-gray-400 focus:outline-none focus:border-[#ff9404] focus:shadow-[0_0_8px_rgba(255,148,4,0.2)] focus:bg-gray-800 focus:scale-102"
                              />
                            </div>
                          </div>
                        ))}
                        <div className="flex justify-start gap-4 mt-3 items-center">
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.4 + index * 0.3, duration: 0.8 }}
                            onClick={() => handleAddSet(exercise.id)}
                            className="bg-transparent border-none text-[#ff9404] text-base cursor-pointer flex items-center gap-2 hover:text-[#e08503] transition-colors duration-300"
                          >
                            <FaPlus className="w-5 h-5" />
                            Agregar serie
                          </motion.button>
                          {(exercise.sets || []).length > 1 && (
                            <button
                              onClick={() => handleRemoveSet(exercise.id, (exercise.sets || []).length - 1)}
                              className="bg-transparent border-none text-red-500 text-base cursor-pointer flex items-center gap-2 hover:text-red-600 transition-colors duration-300"
                            >
                              <FaMinus className="w-5 h-5" />
                              Eliminar serie
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-gray-400 text-center text-base flex-1 flex items-center justify-center"
              >
                No hay ejercicios en la rutina.
              </motion.p>
            )}
          </motion.div>

          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            onClick={handleSaveRoutine}
            className="mt-8 w-full py-4 bg-gradient-to-r from-[#ff9404] to-[#e08503] text-white rounded-lg font-medium text-xl shadow-[0_0_10px_rgba(255,148,4,0.3)] transition-all duration-300 hover:bg-gradient-to-r hover:from-[#e08503] hover:to-[#ff9404] hover:shadow-[0_0_15px_rgba(255,148,4,0.5)] hover:scale-105 active:scale-95"
          >
            {fromRoutineDetails ? 'Actualizar rutina' : 'Guardar rutina'}
          </motion.button>
        </motion.div>
      </div>
    </>
  );
};

export default ExerciseList;