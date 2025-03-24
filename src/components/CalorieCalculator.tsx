import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";

// Estilos personalizados (sin cambios)
const customStyles = `
  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-track {
    background: #3B4252;
  }
  ::-webkit-scrollbar-thumb {
    background: #6B7280;
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #9CA3AF;
  }

  /* Custom Dropdown Arrow */
  select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1.5em;
  }

  /* Custom Radio Button Styles */
  input[type="radio"] {
    appearance: none;
    width: 20px;
    height: 20px;
    border: 2px solid #000000;
    border-radius: 50%;
    background-clip: content-box;
    position: relative;
    transition: all 0.3s ease;
  }
  input[type="radio"]:hover {
    border-color: #ff9404;
    box-shadow: 0 0 8px rgba(255, 148, 4, 0.5);
  }
  input[type="radio"]:checked {
    background-color: #ffffff;
  }
  input[type="radio"]:checked::after {
    content: '';
    display: block;
    width: 12px;
    height: 12px;
    background: #ff9404;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  /* Estilo para Inputs Numéricos */
  .calorie-goal-input {
    width: 100%;
    padding: 6px 10px;
    font-size: 0.875rem;
    border: 1px solid #6B7280;
    border-radius: 6px;
    background: #2D3242;
    color: #E5E7EB;
    text-align: center;
    transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease;
  }
  .calorie-goal-input::-webkit-outer-spin-button,
  .calorie-goal-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .calorie-goal-input[type="number"] {
    -moz-appearance: textfield;
  }
  .calorie-goal-input:focus {
    outline: none;
    border-color: #ff9404;
    box-shadow: 0 0 0 3px rgba(255, 148, 4, 0.2);
    background: #2D3242;
    transform: scale(1.02);
  }
  .calorie-goal-input::placeholder {
    color: #6B7280;
    opacity: 1;
  }
  .calorie-goal-input.error {
    border-color: #ff4444;
  }

  /* Estilo para Select (Dropdown) */
  .calorie-goal-select {
    width: 100%;
    padding: 6px 10px;
    font-size: 0.875rem;
    border: 1px solid #6B7280;
    border-radius: 6px;
    background: #2D3242;
    color: #E5E7EB;
    transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease;
  }
  .calorie-goal-select:focus {
    outline: none;
    border-color: #ff9404;
    box-shadow: 0 0 0 3px rgba(255, 148, 4, 0.2);
    background: #2D3242;
    transform: scale(1.02);
  }

  /* Responsive Adjustments */
  @media (max-width: 640px) {
    .calorie-goal-input {
      width: 100%;
      font-size: 0.75rem;
      padding: 4px 8px;
    }
    .calorie-goal-select {
      font-size: 0.75rem;
      padding: 4px 8px;
    }
  }
`;

// Constantes fuera del componente para evitar recreación
const activityMultipliers = {
  basal: 1.2,
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
  extraActive: 2.2,
};

const goalAdjustments = {
  maintain: 1.0,
  mildLoss: 0.91,
  loss: 0.81,
  extremeLoss: 0.62,
  mildGain: 1.09,
  gain: 1.19,
  fastGain: 1.38,
};

const goalLabels: { [key: string]: string } = {
  maintain: "Mantener peso",
  mildLoss: "Pérdida leve (0.25 kg/sem)",
  loss: "Pérdida (0.5 kg/sem)",
  extremeLoss: "Pérdida extrema (1 kg/sem)",
  mildGain: "Aumento leve (0.25 kg/sem)",
  gain: "Aumento (0.5 kg/sem)",
  fastGain: "Aumento rápido (1 kg/sem)",
};

// Componente reutilizable para las tarjetas de objetivos
const GoalCard: React.FC<{
  goal: string;
  calorieValue: number;
  isSelected: boolean;
  onClick: () => void;
  baseCalories: number;
}> = ({ goal, calorieValue, isSelected, onClick, baseCalories }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className={`bg-[#282c3c] p-4 rounded-lg cursor-pointer transition-all duration-300 hover:bg-[#2f3447] ${
      isSelected ? "border-2 border-[#ff9404]" : "border border-gray-600"
    }`}
    onClick={onClick}
  >
    <p className="font-medium text-[#ff9404]">{goalLabels[goal]}</p>
    <p className="text-lg text-gray-200">
      {calorieValue} kcal/day ({Math.round((calorieValue / baseCalories) * 100)}
      %)
    </p>
  </motion.div>
);

const CalorieCalculator: React.FC = () => {
  const navigate = useNavigate();
  const [age, setAge] = useState<number | undefined>(18);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [height, setHeight] = useState<number | undefined>(180);
  const [weight, setWeight] = useState<number | undefined>(80);
  const [activityLevel, setActivityLevel] = useState<string>("moderate");
  const [calories, setCalories] = useState<{ [key: string]: number } | null>(
    null
  );
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        setError("Debes iniciar sesión para usar la calculadora.");
        navigate("/login");
      } else {
        setUserEmail(user.email || "");
      }
    };
    checkAuth();
  }, [navigate]);

  const handleInputChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      setter: React.Dispatch<React.SetStateAction<number | undefined>>,
      minValue?: number
    ) => {
      const value = e.target.value ? Number(e.target.value) : undefined;
      if (value !== undefined && (minValue === undefined || value > minValue)) {
        setter(value);
      } else {
        setter(undefined);
      }
    },
    []
  );

  const calculateCalories = useCallback(() => {
    if (
      age === undefined ||
      height === undefined ||
      weight === undefined ||
      age < 15 ||
      age > 80 ||
      height <= 0 ||
      weight <= 0
    ) {
      setCalories(null);
      toast.error("Por favor ingrese valores válidos en todos los campos.");
      return;
    }

    setIsLoading(true);
    let bmr: number;
    if (gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const activityFactor =
      activityMultipliers[activityLevel as keyof typeof activityMultipliers];
    const baseTDEE = Math.round(bmr * activityFactor);

    const goalCalories: { [key: string]: number } = {};
    for (const [goal, adjustment] of Object.entries(goalAdjustments)) {
      goalCalories[goal] = Math.round(baseTDEE * adjustment);
    }

    setCalories(goalCalories);
    setIsLoading(false);
    toast.success("Calorías calculadas correctamente.");
  }, [age, height, weight, gender, activityLevel]);

  const handleGoalSelect = useCallback(
    async (goal: string, calorieValue: number) => {
      if (!userEmail) {
        setError("Debes estar autenticado para seleccionar un objetivo.");
        toast.error("Autenticación requerida.");
        return;
      }

      setSelectedGoal(goal);

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/set-calorie-goal`,
          {
            email: userEmail,
            calorieGoal: calorieValue,
          }
        );

        if (response.data.success) {
          toast.success("Calorie goal set successfully!");
          navigate("/dashboard");
        } else {
          setError(
            response.data.error || "Error al establecer el límite de calorías."
          );
          toast.error(response.data.error || "Error setting calorie goal.");
        }
      } catch (err) {
        console.log(err);
        setError("Error al conectar con el servidor. Intenta de nuevo.");
        toast.error("Server error. Please try again.");
      }
    },
    [userEmail, navigate]
  );

  const isButtonDisabled =
    age === undefined ||
    height === undefined ||
    weight === undefined ||
    age < 15 ||
    age > 80 ||
    height <= 0 ||
    weight <= 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative w-full">
      <style>{customStyles}</style>
      <Toaster position="top-center" reverseOrder={false} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-2xl w-full bg-[#3B4252] rounded-xl shadow-md p-8 relative z-10"
      >
        <h1 className="text-4xl font-bold text-center text-white mb-8 flex items-center justify-center gap-3">
          Calculadora de Calorías
        </h1>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 mb-4 text-center"
          >
            {error}
          </motion.p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            calculateCalories();
          }}
          className="space-y-6"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Edad (15-80)
            </label>
            <input
              type="number"
              id="age"
              value={age ?? ""}
              onChange={(e) => handleInputChange(e, setAge)}
              className="calorie-goal-input"
              placeholder="Enter your age"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Género
            </label>
            <div className="flex space-x-6">
              <label className="flex items-center text-gray-200">
                <input
                  type="radio"
                  value="male"
                  checked={gender === "male"}
                  onChange={() => setGender("male")}
                  className="mr-2"
                />
                Masculino
              </label>
              <label className="flex items-center text-gray-200">
                <input
                  type="radio"
                  value="female"
                  checked={gender === "female"}
                  onChange={() => setGender("female")}
                  className="mr-2"
                />
                Femenino
              </label>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Altura (cm)
            </label>
            <input
              type="number"
              id="height"
              value={height ?? ""}
              onChange={(e) => handleInputChange(e, setHeight, 0)}
              className="calorie-goal-input"
              placeholder="Enter your height"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Peso (kg)
            </label>
            <input
              type="number"
              id="weight"
              value={weight ?? ""}
              onChange={(e) => handleInputChange(e, setWeight, 0)}
              className="calorie-goal-input"
              placeholder="Enter your weight"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Nivel de Actividad
            </label>
            <select
              id="activity"
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              className="calorie-goal-select"
            >
              <option value="basal">Tasa Metabólica Basal (BMR)</option>
              <option value="sedentary">
                Sedentario: sin ejercicio o actividad física ligera
              </option>
              <option value="light">Light: exercise 1-3 times/week</option>
              <option value="moderate">
                Moderado: ejercicio 1-3 veces/semana
              </option>
              <option value="active">
                Activo: ejercicio 3-5 veces/semana
              </option>
              <option value="veryActive">
                Muy Activo: ejercicio intenso diario o trabajo físico
              </option>
              <option value="extraActive">
                Extra Activo: ejercicio intenso 2 veces al día
              </option>
            </select>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-[#ff9404] to-[#FF6B35] text-white font-semibold rounded-full shadow-md hover:shadow-lg hover:from-[#FF6B35] hover:to-[#ff9404] transition-all duration-300 transform hover:-translate-y-1 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={isButtonDisabled || isLoading}
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
            ) : (
              "Estimar mis Calorías"
            )}
          </motion.button>
        </form>

        <AnimatePresence>
          {calories && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-8"
            >
              <h2 className="mt-12 text-3xl font-bold text-center text-white mb-6">
                Calorías Diarias Estimadas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-center">
                    Pérdida de Peso Estimada
                  </h3>
                  <div className="space-y-4">
                    {["maintain", "mildLoss", "loss", "extremeLoss"].map(
                      (goal) => (
                        <GoalCard
                          key={goal}
                          goal={goal}
                          calorieValue={calories[goal]}
                          isSelected={selectedGoal === goal}
                          onClick={() =>
                            handleGoalSelect(goal, calories[goal])
                          }
                          baseCalories={calories.maintain}
                        />
                      )
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-center">
                    Ganancia de Peso Estimada
                  </h3>
                  <div className="space-y-4">
                    {["mildGain", "gain", "fastGain"].map((goal) => (
                      <GoalCard
                        key={goal}
                        goal={goal}
                        calorieValue={calories[goal]}
                        isSelected={selectedGoal === goal}
                        onClick={() =>
                          handleGoalSelect(goal, calories[goal])
                        }
                        baseCalories={calories.maintain}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default React.memo(CalorieCalculator);