import React, { useState } from "react";

const OneRepMaxCalculator: React.FC = () => {
  const [weight, setWeight] = useState<number | undefined>(undefined);
  const [unit, setUnit] = useState<"kg" | "lb">("kg");
  const [reps, setReps] = useState<number | undefined>(undefined);
  const [rpe, setRpe] = useState<number | undefined>(undefined);
  const [exercise, setExercise] = useState<string>("Deadlift");
  const [oneRepMax, setOneRepMax] = useState<number | null>(null);

  // List of exercises (compound vs. isolation for formula selection)
  const exercises = [
    "Deadlift",
    "Squat",
    "Bench Press",
    "Overhead Press",
    "Bicep Curl",
    "Tricep Extension",
    "Shoulder Press",
  ];

  // Convert weight between kg and lb
  const convertWeight = (value: number, toUnit: "kg" | "lb"): number => {
    if (toUnit === "kg") {
      return Math.round(value * 0.453592); // lb to kg
    }
    return Math.round(value / 0.453592); // kg to lb
  };

  const handleUnitChange = () => {
    if (weight !== undefined) {
      const newUnit = unit === "kg" ? "lb" : "kg";
      const convertedWeight = convertWeight(weight, newUnit);
      setWeight(convertedWeight);
      setUnit(newUnit);
    } else {
      setUnit(unit === "kg" ? "lb" : "kg");
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

  const handleRepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : undefined;
    if (value !== undefined && value > 0 && value <= 30) {
      setReps(value);
    } else {
      setReps(undefined);
    }
  };

  const handleRpeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : undefined;
    if (value !== undefined && value >= 1 && value <= 10) {
      setRpe(value);
    } else {
      setRpe(undefined);
    }
  };

  const calculateOneRepMax = () => {
    if (
      weight === undefined ||
      reps === undefined ||
      rpe === undefined ||
      weight <= 0 ||
      reps <= 0 ||
      rpe < 1 ||
      rpe > 10
    ) {
      setOneRepMax(null);
      return;
    }

    // Convert weight to kg if in lb for calculation
    const weightInKg = unit === "lb" ? convertWeight(weight, "kg") : weight;

    // Select formula based on exercise type
    const isCompound = [
      "Deadlift",
      "Squat",
      "Bench Press",
      "Overhead Press",
    ].includes(exercise);
    let oneRm: number;

    if (isCompound) {
      // Epley Formula for compound lifts
      oneRm = weightInKg * (1 + reps / 30);
    } else {
      // Brzycki Formula for isolation lifts
      oneRm = weightInKg * (36 / (37 - reps));
    }

    // Adjust for RPE (if RPE < 10, user could have done more reps)
    const rpeAdjustment = 1 + (10 - rpe) * 0.033; // Approximate adjustment
    oneRm = oneRm * rpeAdjustment;

    // Round to nearest integer
    oneRm = Math.round(oneRm);

    // Convert back to lb if the unit is lb
    if (unit === "lb") {
      oneRm = convertWeight(oneRm, "lb");
    }

    setOneRepMax(oneRm);
  };

  const isButtonDisabled =
    weight === undefined ||
    reps === undefined ||
    rpe === undefined ||
    weight <= 0 ||
    reps <= 0 ||
    rpe < 1 ||
    rpe > 10;

  return (
    <div className="container mx-auto px-4 py-16 bg-[#282c3c] text-white min-h-screen">
      <div className="max-w-2xl mx-auto w-full">
        <h1 className="text-5xl font-bold mb-12 text-center text-white flex items-center justify-center">
          1RM Calculator
        </h1>

        <div className="bg-[#3B4252] rounded-xl p-6 shadow-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              calculateOneRepMax();
            }}
            className="space-y-6"
          >
            {/* Weight Input with Unit Toggle Inside */}
            <div>
              <label
                htmlFor="weight"
                className="block text-sm font-medium text-white mb-1"
              >
                Weight
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="weight"
                  value={weight ?? ""}
                  onChange={handleWeightChange}
                  className="w-full px-4 py-2 pr-16 border border-gray-500 rounded-lg bg-[#282c3c] text-white focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                  placeholder={`Enter weight`}
                />
                <button
                  type="button"
                  onClick={handleUnitChange}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-[#ff9404] text-white font-semibold rounded-lg hover:text-[#1C1C1E] transition duration-300 text-sm"
                >
                  {unit}
                </button>
              </div>
            </div>

            {/* Repetitions Input */}
            <div>
              <label
                htmlFor="reps"
                className="block text-sm font-medium text-white mb-1"
              >
                Repetitions (1-30)
              </label>
              <input
                type="number"
                id="reps"
                value={reps ?? ""}
                onChange={handleRepsChange}
                className="w-full px-4 py-2 border border-gray-500 rounded-lg bg-[#282c3c] text-white focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                placeholder="Enter number of reps"
              />
            </div>

            {/* RPE Input */}
            <div>
              <label
                htmlFor="rpe"
                className="block text-sm font-medium text-white mb-1"
              >
                RPE (1-10)
              </label>
              <input
                type="number"
                id="rpe"
                value={rpe ?? ""}
                onChange={handleRpeChange}
                className="w-full px-4 py-2 border border-gray-500 rounded-lg bg-[#282c3c] text-white focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                placeholder="Enter RPE (1-10)"
              />
            </div>

            {/* Exercise Dropdown */}
            <div>
              <label
                htmlFor="exercise"
                className="block text-sm font-medium text-white mb-1"
              >
                Exercise
              </label>
              <select
                id="exercise"
                value={exercise}
                onChange={(e) => setExercise(e.target.value)}
                className="w-full px-4 py-2 border border-gray-500 rounded-lg bg-[#282c3c] text-white focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
              >
                {exercises.map((ex) => (
                  <option key={ex} value={ex}>
                    {ex}
                  </option>
                ))}
              </select>
            </div>

            {/* Calculate Button */}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-[#ff9404] text-white font-semibold rounded-lg hover:text-[#1C1C1E] transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
              disabled={isButtonDisabled}
            >
              Calculate 1RM
            </button>

            {/* Results */}
            {oneRepMax && (
              <div className="mt-6 space-y-4">
                <h2 className="text-4xl font-bold text-center text-white">
                  Your 1RM is {oneRepMax} {unit}
                </h2>
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-white mb-4 text-center">
                    Estimated Rep Maxes
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-[#282c3c] p-4 rounded-lg flex justify-between">
                      <p className="font-medium text-[#ff9404]">2 Reps</p>
                      <p className="text-lg">
                        {Math.round(oneRepMax * 0.96)} {unit} (96%)
                      </p>
                    </div>
                    <div className="bg-[#282c3c] p-4 rounded-lg flex justify-between">
                      <p className="font-medium text-[#ff9404]">3 Reps</p>
                      <p className="text-lg">
                        {Math.round(oneRepMax * 0.92)} {unit} (92%)
                      </p>
                    </div>
                    <div className="bg-[#282c3c] p-4 rounded-lg flex justify-between">
                      <p className="font-medium text-[#ff9404]">4 Reps</p>
                      <p className="text-lg">
                        {Math.round(oneRepMax * 0.9)} {unit} (90%)
                      </p>
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

export default OneRepMaxCalculator;
