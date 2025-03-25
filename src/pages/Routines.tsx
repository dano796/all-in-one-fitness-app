import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import axios from "axios";
import GalaxyBackground from "../components/GalaxyBackground";
import styles from "../components/Routines.module.css";

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
  const deleteConfirmRef = useRef<HTMLDivElement>(null); // Referencia al diálogo

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

  // Cerrar el diálogo al hacer clic fuera
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
    <div className={styles.container}>
      <GalaxyBackground />
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className={styles.header}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className={styles.title}
        >
          <h1>All In One Fitness App</h1>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className={styles.routinesLabel}
        >
          MIS RUTINAS
        </motion.div>
      </motion.div>

      <div className={styles.listWrapper}>
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className={styles.addButtonContainer}
        >
          <button onClick={handleAddRoutineClick} className={styles.addButton}>
            <Plus className="w-4 h-4" />
            Nueva rutina
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className={styles.listContainer}
        >
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
          {loading ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className={styles.loading}
            >
              Cargando...
            </motion.p>
          ) : (
            <div className={styles.list}>
              {routines.length > 0 ? (
                routines.map((routine, index) => (
                  <motion.div
                    key={routine.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.3, duration: 1.0 }}
                    className={styles.item}
                  >
                    <div
                      className={styles.itemContent}
                      onClick={() => handleRoutineClick(routine.id)}
                    >
                      <h3 className={styles.itemText}>
                        {routine.day}: {routine.name}
                      </h3>
                    </div>
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.0 + index * 0.3, duration: 0.8 }}
                      className={styles.itemButton}
                      onClick={() => toggleDeleteConfirm(routine.id)}
                    >
                      <MoreHorizontal className={styles.itemIcon} />
                    </motion.button>
                    {showDeleteConfirm === routine.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        className={styles.deleteConfirm}
                        ref={deleteConfirmRef}
                      >
                        <p className={styles.deleteConfirmText}>¿Eliminar esta rutina?</p>
                        <button
                          onClick={() => handleDeleteRoutine(routine.id)}
                          className={styles.confirmDeleteButton}
                        >
                          <Trash2 className="w-4 h-4" />
                          Sí
                        </button>
                        <button
                          onClick={() => toggleDeleteConfirm(null)}
                          className={styles.cancelDeleteButton}
                        >
                          No
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                ))
              ) : (
                <p className={styles.empty}>No hay rutinas registradas.</p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default React.memo(Routines);