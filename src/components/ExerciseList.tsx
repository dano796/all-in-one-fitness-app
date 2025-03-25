import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaChevronDown, FaChevronUp, FaMinus } from 'react-icons/fa';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import GalaxyBackground from '../components/GalaxyBackground';
import styles from './ExerciseList.module.css';

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

  // Determinar si venimos de RoutineDetails o Routines
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
    exercises: existingExercises, // Inicializamos con los ejercicios existentes si venimos de RoutineDetails
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
      // Actualizar la rutina existente (solo ejercicios)
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
      // Crear una nueva rutina
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
    <div className={styles.container}>
      <GalaxyBackground />

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className={styles.header}
      >
        <button onClick={handleBackClick} className={styles.backButton}>
          <FaArrowLeft className={styles.backIcon} />
          Volver
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className={styles.content}
      >
        {/* Formulario condicional: solo se muestra si NO venimos de RoutineDetails */}
        {!fromRoutineDetails && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className={styles.form}
          >
            <div>
              <label className={styles.label}>Día de la semana:</label>
              <select
                value={newRoutine.day}
                onChange={(e) => setNewRoutine({ ...newRoutine, day: e.target.value })}
                className={styles.select}
              >
                <option value="">Selecciona un día</option>
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={styles.label}>Nombre de la rutina:</label>
              <input
                type="text"
                value={newRoutine.name}
                onChange={(e) => setNewRoutine({ ...newRoutine, name: e.target.value })}
                placeholder="Nombre de la rutina"
                className={styles.input}
              />
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          className={styles.exerciseContainer}
        >
          <div className={styles.exerciseList}>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className={styles.title}
            >
              Lista de Ejercicios
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className={styles.selectContainer}
            >
              <label className={styles.label}>Selecciona una parte del cuerpo:</label>
              <select
                value={selectedBodyPart}
                onChange={handleBodyPartChange}
                className={styles.select}
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
              className={styles.subtitle}
            >
              Resultados
            </motion.h3>
            {loading && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className={styles.loading}
              >
                Cargando...
              </motion.p>
            )}
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className={styles.error}
              >
                {error}
              </motion.p>
            )}
            {!loading && !error && selectedBodyPart && exercises.length > 0 && (
              <div className={styles.list}>
                {exercises.map((exercise, index) => (
                  <motion.div
                    key={exercise.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 + index * 0.3, duration: 1.0 }}
                    onClick={() => handleExerciseClick(exercise)}
                    className={`${styles.listItem} ${selectedExercise?.id === exercise.id ? styles.selected : ''}`}
                  >
                    <img
                      src={exercise.gifUrl}
                      alt={exercise.name}
                      className={styles.listItemImage}
                    />
                    <p className={styles.listItemText}>{exercise.name}</p>
                  </motion.div>
                ))}
              </div>
            )}
            {!loading && !error && selectedBodyPart && exercises.length === 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className={styles.empty}
              >
                No se encontraron ejercicios para esta parte del cuerpo.
              </motion.p>
            )}
            {!selectedBodyPart && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className={styles.empty}
              >
                Por favor, selecciona una parte del cuerpo para ver los ejercicios.
              </motion.p>
            )}
          </div>

          {selectedExercise && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
              className={styles.exerciseDetails}
            >
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className={styles.detailTitle}
              >
                {selectedExercise.name}
              </motion.h2>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className={styles.detailContent}
              >
                <div className={styles.detailImageContainer}>
                  <img
                    src={selectedExercise.gifUrl}
                    alt={selectedExercise.name}
                    className={styles.detailImage}
                  />
                  <div className={styles.exerciseDbLogo}>EXERCISEDB</div>
                </div>
                <div className={styles.detailInfo}>
                  <p><strong>Parte del cuerpo:</strong> {selectedExercise.bodyPart}</p>
                  <p><strong>Equipo:</strong> {selectedExercise.equipment}</p>
                  <p><strong>Objetivo:</strong> {selectedExercise.target}</p>
                  <p><strong>Músculos secundarios:</strong> {selectedExercise.secondaryMuscles.join(', ')}</p>
                  <p><strong>Instrucciones:</strong></p>
                  <ul className={styles.instructions}>
                    {selectedExercise.instructions.map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0, duration: 0.8 }}
                onClick={() => handleAddExerciseToRoutine(selectedExercise)}
                className={styles.addButton}
              >
                Agregar a la rutina
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.6 }}
          className={styles.routineExercises}
        >
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className={styles.title}
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
                className={styles.routineItem}
              >
                <div className={styles.routineItemHeader}>
                  <div className={styles.routineItemContent}>
                    <img
                      src={exercise.gifUrl}
                      alt={exercise.name}
                      className={styles.routineItemImage}
                    />
                    <h3 className={styles.routineItemTitle}>{exercise.name} ({exercise.equipment})</h3>
                  </div>
                  <div className={styles.routineItemActions}>
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.2 + index * 0.3, duration: 0.8 }}
                      onClick={() => handleToggleExercise(exercise.id)}
                      className={styles.toggleButton}
                    >
                      {expandedExercises[exercise.id] ? (
                        <FaChevronUp className={styles.toggleIcon} />
                      ) : (
                        <FaChevronDown className={styles.toggleIcon} />
                      )}
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.2 + index * 0.3, duration: 0.8 }}
                      onClick={() => handleRemoveExerciseFromRoutine(exercise.id)}
                      className={styles.routineItemRemove}
                    >
                      <span className={styles.routineItemRemoveIcon}>🗑️</span>
                    </motion.button>
                  </div>
                </div>
                {expandedExercises[exercise.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={styles.routineItemDetailsWrapper}
                  >
                    <div className={styles.routineItemDetails}>
                      <label className={styles.noteLabel}>Nota:</label>
                      <input
                        type="text"
                        value={exercise.note || ''}
                        onChange={(e) => handleUpdateNote(exercise.id, e.target.value)}
                        placeholder="Agregar nota"
                        className={styles.noteInput}
                      />
                    </div>
                    <div className={styles.routineItemDetails}>
                      <label className={styles.noteLabel}>Temporizador de descanso:</label>
                      <select
                        value={exercise.restTimer || 'Apagado'}
                        onChange={(e) => handleUpdateRestTimer(exercise.id, e.target.value)}
                        className={styles.restTimerSelect}
                      >
                        <option value="Apagado">Apagado</option>
                        <option value="30 segundos">30 segundos</option>
                        <option value="60 segundos">60 segundos</option>
                        <option value="90 segundos">90 segundos</option>
                      </select>
                    </div>
                    <div className={styles.routineItemDetails}>
                      <div className={styles.setsHeader}>
                        <span>SET</span>
                        <span>KG</span>
                        <span>REPS</span>
                      </div>
                      {(exercise.sets || []).map((set, setIndex) => (
                        <div key={setIndex} className={styles.set}>
                          <span className={styles.setNumber}>{setIndex + 1}</span>
                          <div className={styles.setField}>
                            <input
                              type="text"
                              value={set.kg}
                              onChange={(e) =>
                                handleUpdateSet(exercise.id, setIndex, 'kg', e.target.value)
                              }
                              placeholder="KG"
                              className={styles.setInput}
                            />
                          </div>
                          <div className={styles.setField}>
                            <input
                              type="text"
                              value={set.reps}
                              onChange={(e) =>
                                handleUpdateSet(exercise.id, setIndex, 'reps', e.target.value)
                              }
                              placeholder="REPS"
                              className={styles.setInput}
                            />
                          </div>
                        </div>
                      ))}
                      <div className={styles.setActions}>
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1.4 + index * 0.3, duration: 0.8 }}
                          onClick={() => handleAddSet(exercise.id)}
                          className={styles.addSetButton}
                        >
                          <FaPlus className={styles.addSetIcon} />
                          Agregar serie
                        </motion.button>
                        {(exercise.sets || []).length > 1 && (
                          <button
                            onClick={() => handleRemoveSet(exercise.id, (exercise.sets || []).length - 1)}
                            className={styles.removeSetButton}
                          >
                            <FaMinus className={styles.addSetIcon} />
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
              className={styles.empty}
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
          className={styles.saveButton}
        >
          {fromRoutineDetails ? 'Actualizar rutina' : 'Guardar rutina'}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ExerciseList;