import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import axios, { AxiosError } from "axios";
import Swal from "sweetalert2";
import GalaxyBackground from "../components/GalaxyBackground";

interface Routine {
  day: string;
  name: string;
}

const Routines: React.FC = () => {
  const navigate = useNavigate();
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

  const fetchRoutines = async (email: string) => {
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
  };

  const handleAddRoutineClick = () => {
    navigate("/routine-create");
  };

  const handleRoutineClick = (routineName: string) => {
    navigate(`/routine-details?name=${routineName}`);
  };

  return (
    <div className="relative p-4 space-y-6 bg-[#282c3c] min-h-screen overflow-hidden -mt-12">
      <GalaxyBackground />
      <style>{`
        .routines-section { max-width: 700px; margin: 0 auto; background: #3B4252; border-radius: 8px; padding: 20px; }
        .new-routine-button { padding: 0.75rem 1.5rem; background: linear-gradient(45deg, #ff9404, #e08503); color: white; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 0 10px rgba(255, 148, 4, 0.3); transition: all 0.3s ease; }
        .new-routine-button:hover { background: linear-gradient(45deg, #e08503, #ff9404); box-shadow: 0 0 15px rgba(255, 148, 4, 0.5); transform: scale(1.05); }
        .new-routine-button:active { transform: scale(0.95); }
        .routine-item { max-width: 100%; background: #FFFFFF; border-radius: 8px; padding: 10px; margin-bottom: 10px; }
        .routine-item:hover { background: #E5E7EB; }
        .add-routine-button { background: none; padding: 2px; transition: transform 0.2s ease; }
        .add-routine-button:hover { transform: scale(1.2); }
        .add-routine-button:active { transform: scale(0.9); }
        .add-routine-button .lucide-plus { color: #000000; transition: color 0.3s ease; }
        .add-routine-button:hover .lucide-plus { color: #ff9404; }
        .dashboard-swal-container .dashboard-swal-popup { background-color: #3B4252 !important; color: #fff !important; }
        .dashboard-swal-container .dashboard-swal-icon { color: #ff9404 !important; }
        .dashboard-swal-container .dashboard-swal-title { color: #fff !important; font-size: 1.5rem !important; }
        .dashboard-swal-container .dashboard-swal-text { color: #fff !important; font-size: 1rem !important; }
        .dashboard-swal-container .dashboard-swal-confirm-button { background: linear-gradient(45deg, #ff9404, #e08503) !important; color: white !important; border: none !important; padding: 10px 20px !important; border-radius: 4px !important; font-size: 0.875rem !important; box-shadow: 0 0 10px rgba(255, 148, 4, 0.3) !important; transition: all 0.3s ease !important; }
        .dashboard-swal-container .dashboard-swal-confirm-button:hover { background: linear-gradient(45deg, #e08503, #ff9404) !important; box-shadow: 0 0 15px rgba(255, 148, 4, 0.5) !important; }
        @media (max-width: 640px) {
          .routines-section { max-width: 100%; padding: 15px; }
          .new-routine-button { font-size: 0.875rem; padding: 0.5rem 1rem; }
          .routine-item { padding: 8px; }
        }
      `}</style>

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
          <button onClick={handleAddRoutineClick} className="new-routine-button mt-4">
            Nueva rutina
          </button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="routines-section relative z-10"
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
            className="text-red-400 mb-4 text-center"
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
                className="routine-item flex items-center justify-between cursor-pointer"
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
                  className="add-routine-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddRoutineClick();
                  }}
                >
                  <Plus className="h-4 w-4 lucide-plus" />
                </motion.button>
              </motion.div>
            ))
          ) : (
            <p className="text-gray-400 text-center">No hay rutinas registradas.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default React.memo(Routines);