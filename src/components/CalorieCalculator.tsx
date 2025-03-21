import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import axios from "axios";
import { Calculator } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import GalaxyBackground from "./GalaxyBackground";

// Estilos personalizados para scrollbar, dropdown y radio buttons
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
`;

const CalorieCalculator: React.FC = () => {
  const navigate = useNavigate();
  const [age, setAge] = useState<number | undefined>(18);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [height, setHeight] = useState<number | undefined>(180);
  const [weight, setWeight] = useState<number | undefined>(80);
  const [activityLevel, setActivityLevel] = useState<string>("moderate");
  const [calories, setCalories] = useState<{ [key: string]: number } | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
    maintain: "Maintain Weight",
    mildLoss: "Mild Weight Loss (0.25 kg/week)",
    loss: "Weight Loss (0.5 kg/week)",
    extremeLoss: "Extreme Weight Loss (1 kg/week)",
    mildGain: "Mild Weight Gain (0.25 kg/week)",
    gain: "Weight Gain (0.5 kg/week)",
    fastGain: "Fast Weight Gain (1 kg/week)",
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setError("Debes iniciar sesión para usar la calculadora.");
        navigate("/login");
      } else {
        setUserEmail(user.email || "");
      }
    };
    checkAuth();
  }, [navigate]);

  const calculateCalories = () => {
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
      toast.error("Please enter valid values for all fields.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
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
      toast.success("Calories calculated successfully!");
    }, 1500);
  };

  const handleGoalSelect = async (goal: string, calorieValue: number) => {
    if (!userEmail) {
      setError("Debes estar autenticado para seleccionar un objetivo.");
      toast.error("Authentication required.");
      return;
    }

    setSelectedGoal(goal);

    try {
      const response = await axios.post("http://localhost:5000/api/set-calorie-goal", {
        email: userEmail,
        calorieGoal: calorieValue,
      });

      if (response.data.success) {
        toast.success("Calorie goal set successfully!");
        navigate("/dashboard");
      } else {
        setError(response.data.error || "Error al establecer el límite de calorías.");
        toast.error(response.data.error || "Error setting calorie goal.");
      }
    } catch (err) {
      setError("Error al conectar con el servidor. Intenta de nuevo.");
      toast.error("Server error. Please try again.");
    }
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : undefined;
    if (value !== undefined) {
      const clampedValue = Math.max(15, Math.min(80, value));
      setAge(clampedValue);
    } else {
      setAge(undefined);
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : undefined;
    if (value !== undefined && value > 0) {
      setHeight(value);
    } else {
      setHeight(undefined);
    }
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : undefined;
    if (value !== undefined && value > 0) {
      setWeight(value);
    } else {
      setWeight(undefined);
    }
  };

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
      <GalaxyBackground /> {/* Partículas solo en esta página */}
      <style>{customStyles}</style>
      <Toaster position="top-right" reverseOrder={false} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-2xl w-full bg-[#3B4252] rounded-xl shadow-md p-8 relative z-10"
      >
        <h1 className="text-4xl font-bold text-center text-white mb-8 flex items-center justify-center gap-3">
          <Calculator className="w-8 h-8 text-[#ff9404]" />
          Calorie Calculator
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
              Age (15-80)
            </label>
            <input
              type="number"
              id="age"
              value={age ?? ""}
              onChange={handleAgeChange}
              className="w-full px-4 py-3 bg-[#282c3c] border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-[#ff9404] focus:border-transparent transition-all duration-300 placeholder-gray-400 hover:bg-[#2f3447]"
              placeholder="Enter your age"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Gender
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
                Male
              </label>
              <label className="flex items-center text-gray-200">
                <input
                  type="radio"
                  value="female"
                  checked={gender === "female"}
                  onChange={() => setGender("female")}
                  className="mr-2"
                />
                Female
              </label>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Height (cm)
            </label>
            <input
              type="number"
              id="height"
              value={height ?? ""}
              onChange={handleHeightChange}
              className="w-full px-4 py-3 bg-[#282c3c] border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-[#ff9404] focus:border-transparent transition-all duration-300 placeholder-gray-400 hover:bg-[#2f3447]"
              placeholder="Enter your height"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Weight (kg)
            </label>
            <input
              type="number"
              id="weight"
              value={weight ?? ""}
              onChange={handleWeightChange}
              className="w-full px-4 py-3 bg-[#282c3c] border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-[#ff9404] focus:border-transparent transition-all duration-300 placeholder-gray-400 hover:bg-[#2f3447]"
              placeholder="Enter your weight"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Activity Level
            </label>
            <select
              id="activity"
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              className="w-full px-4 py-3 bg-[#282c3c] border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-[#ff9404] focus:border-transparent transition-all duration-300 hover:bg-[#2f3447]"
            >
              <option value="basal">Basal Metabolic Rate (BMR)</option>
              <option value="sedentary">Sedentary: little or no exercise</option>
              <option value="light">Light: exercise 1-3 times/week</option>
              <option value="moderate">Moderate: exercise 4-5 times/week</option>
              <option value="active">Active: daily exercise or intense 3-4 times/week</option>
              <option value="veryActive">Very Active: intense exercise 6-7 times/week</option>
              <option value="extraActive">Extra Active: very intense daily or physical job</option>
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
              "Calculate Calories"
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
              <h2 className="text-2xl font-semibold text-center text-white mb-6">
                Estimated Daily Calorie Needs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-[#ff9404] mb-4 text-center">
                    Weight Loss Estimates
                  </h3>
                  <div className="space-y-4">
                    {["maintain", "mildLoss", "loss", "extremeLoss"].map((goal) => (
                      <motion.div
                        key={goal}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className={`bg-[#282c3c] p-4 rounded-lg cursor-pointer transition-all duration-300 hover:bg-[#2f3447] ${
                          selectedGoal === goal ? "border-2 border-[#ff9404]" : "border border-gray-600"
                        }`}
                        onClick={() => handleGoalSelect(goal, calories[goal])}
                      >
                        <p className="font-medium text-[#ff9404]">{goalLabels[goal]}</p>
                        <p className="text-lg text-gray-200">
                          {calories[goal]} kcal/day (
                          {Math.round((calories[goal] / calories.maintain) * 100)}%)
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#ff9404] mb-4 text-center">
                    Weight Gain Estimates
                  </h3>
                  <div className="space-y-4">
                    {["mildGain", "gain", "fastGain"].map((goal) => (
                      <motion.div
                        key={goal}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className={`bg-[#282c3c] p-4 rounded-lg cursor-pointer transition-all duration-300 hover:bg-[#2f3447] ${
                          selectedGoal === goal ? "border-2 border-[#ff9404]" : "border border-gray-600"
                        }`}
                        onClick={() => handleGoalSelect(goal, calories[goal])}
                      >
                        <p className="font-medium text-[#ff9404]">{goalLabels[goal]}</p>
                        <p className="text-lg text-gray-200">
                          {calories[goal]} kcal/day (
                          {Math.round((calories[goal] / calories.maintain) * 100)}%)
                        </p>
                      </motion.div>
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

export default CalorieCalculator;