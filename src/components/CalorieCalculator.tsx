import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import axios from "axios";

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
      return;
    }

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
  };

  const handleGoalSelect = async (goal: string, calorieValue: number) => {
    if (!userEmail) {
      setError("Debes estar autenticado para seleccionar un objetivo.");
      return;
    }

    setSelectedGoal(goal);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/set-calorie-goal",
        {
          email: userEmail,
          calorieGoal: calorieValue,
        }
      );

      if (response.data.success) {
        navigate("/dashboard");
      } else {
        setError(
          response.data.error || "Error al establecer el límite de calorías."
        );
      }
    } catch (err) {
      setError("Error al conectar con el servidor. Intenta de nuevo.");
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
    <div className="container mx-auto px-4 py-16 bg-[#282c3c] text-white min-h-screen">
      <div className="max-w-2xl mx-auto w-full">
        <h1 className="text-5xl font-bold mb-12 text-center text-white flex items-center justify-center">
          Calorie Calculator
        </h1>

        {error && <p className="text-red-400 mb-4 text-center">{error}</p>}

        <div className="bg-[#3B4252] rounded-xl p-6 shadow-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              calculateCalories();
            }}
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="age"
                className="block text-sm font-medium text-white mb-1"
              >
                Age (15-80)
              </label>
              <input
                type="number"
                id="age"
                value={age ?? ""}
                onChange={handleAgeChange}
                className="w-full px-4 py-2 border border-gray-500 rounded-lg bg-[#282c3c] text-white focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                placeholder="Enter age"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Gender
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="male"
                    checked={gender === "male"}
                    onChange={() => setGender("male")}
                    className="mr-2 text-[#FF6B35] focus:ring-[#FF6B35]"
                  />
                  Male
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="female"
                    checked={gender === "female"}
                    onChange={() => setGender("female")}
                    className="mr-2 text-[#FF6B35] focus:ring-[#FF6B35]"
                  />
                  Female
                </label>
              </div>
            </div>

            <div>
              <label
                htmlFor="height"
                className="block text-sm font-medium text-white mb-1"
              >
                Height (cm)
              </label>
              <input
                type="number"
                id="height"
                value={height ?? ""}
                onChange={handleHeightChange}
                className="w-full px-4 py-2 border border-gray-500 rounded-lg bg-[#282c3c] text-white focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                placeholder="Enter height in cm"
              />
            </div>

            <div>
              <label
                htmlFor="weight"
                className="block text-sm font-medium text-white mb-1"
              >
                Weight (kg)
              </label>
              <input
                type="number"
                id="weight"
                value={weight ?? ""}
                onChange={handleWeightChange}
                className="w-full px-4 py-2 border border-gray-500 rounded-lg bg-[#282c3c] text-white focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                placeholder="Enter weight in kg"
              />
            </div>

            <div>
              <label
                htmlFor="activity"
                className="block text-sm font-medium text-white mb-1"
              >
                Activity Level
              </label>
              <select
                id="activity"
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-500 rounded-lg bg-[#282c3c] text-white focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
              >
                <option value="basal">Basal Metabolic Rate (BMR)</option>
                <option value="sedentary">
                  Sedentary: little or no exercise
                </option>
                <option value="light">Light: exercise 1-3 times/week</option>
                <option value="moderate">
                  Moderate: exercise 4-5 times/week
                </option>
                <option value="active">
                  Active: daily exercise or intense 3-4 times/week
                </option>
                <option value="veryActive">
                  Very Active: intense exercise 6-7 times/week
                </option>
                <option value="extraActive">
                  Extra Active: very intense daily or physical job
                </option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-[#ff9404] text-white font-semibold rounded-lg hover:text-[#1C1C1E] transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
              disabled={isButtonDisabled}
            >
              Calculate Calories
            </button>

            {calories && (
              <div className="mt-6 space-y-4">
                <h2 className="text-xl mt-12 mb-8 font-semibold text-white text-center">
                  Estimated Daily Calorie Needs
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4 text-center">
                      Weight Loss Estimates
                    </h3>
                    <div className="space-y-4">
                      {["maintain", "mildLoss", "loss", "extremeLoss"].map(
                        (goal) => (
                          <div
                            key={goal}
                            className={`bg-[#282c3c] p-4 rounded-lg cursor-pointer transition duration-200 ${
                              selectedGoal === goal
                                ? "border-2 border-[#ff9404]"
                                : ""
                            }`}
                            onClick={() =>
                              handleGoalSelect(goal, calories[goal])
                            }
                          >
                            <p className="font-medium text-[#ff9404]">
                              {goalLabels[goal]}
                            </p>
                            <p className="text-lg">
                              {calories[goal]} kcal/day (
                              {Math.round(
                                (calories[goal] / calories.maintain) * 100
                              )}
                              %)
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 text-center">
                      Weight Gain Estimates
                    </h3>
                    <div className="space-y-4">
                      {["mildGain", "gain", "fastGain"].map((goal) => (
                        <div
                          key={goal}
                          className={`bg-[#282c3c] p-4 rounded-lg cursor-pointer transition duration-200 ${
                            selectedGoal === goal
                              ? "border-2 border-[#ff9404]"
                              : ""
                          }`}
                          onClick={() => handleGoalSelect(goal, calories[goal])}
                        >
                          <p className="font-medium text-[#ff9404]">
                            {goalLabels[goal]}
                          </p>
                          <p className="text-lg">
                            {calories[goal]} kcal/day (
                            {Math.round(
                              (calories[goal] / calories.maintain) * 100
                            )}
                            %)
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CalorieCalculator;
