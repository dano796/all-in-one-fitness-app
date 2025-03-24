import React, { useState } from "react";

const exercises = [
  "Peso Muerto",
  "Sentadilla",
  "Press de Banca",
  "Press Militar",
  "Curl de Bíceps",
  "Extensión de Tríceps",
  "Press de Hombros",
];

const OneRepMaxCalculator: React.FC = () => {
  const [weight, setWeight] = useState<number | undefined>(undefined);
  const [unit, setUnit] = useState<"kg" | "lb">("kg");
  const [reps, setReps] = useState<number | undefined>(undefined);
  const [rpe, setRpe] = useState<number | undefined>(undefined);
  const [exercise, setExercise] = useState<string>("Peso Muerto");
  const [oneRepMax, setOneRepMax] = useState<number | null>(null);

  const convertWeight = (value: number, toUnit: "kg" | "lb"): number => {
    return toUnit === "kg"
      ? Math.round(value * 0.453592)
      : Math.round(value / 0.453592);
  };

  const handleUnitChange = () => {
    setUnit((prevUnit) => {
      const newUnit = prevUnit === "kg" ? "lb" : "kg";
      if (weight !== undefined) {
        setWeight(convertWeight(weight, newUnit));
      }
      return newUnit;
    });
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : undefined;
    setWeight(value !== undefined && value > 0 ? value : undefined);
  };

  const handleRepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : undefined;
    setReps(
      value !== undefined && value > 0 && value <= 30 ? value : undefined
    );
  };

  const handleRpeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : undefined;
    setRpe(value !== undefined && value >= 1 && value <= 10 ? value : undefined);
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

    const weightInKg = unit === "lb" ? convertWeight(weight, "kg") : weight;
    const isCompound = [
      "Peso Muerto",
      "Sentadilla",
      "Press de Banca",
      "Press Militar",
    ].includes(exercise);
    const oneRm = isCompound
      ? weightInKg * (1 + reps / 30) // Epley
      : weightInKg * (36 / (37 - reps)); // Brzycki

    const rpeAdjustment = 1 + (10 - rpe) * 0.033;
    const adjustedOneRm = Math.round(oneRm * rpeAdjustment);
    setOneRepMax(unit === "lb" ? convertWeight(adjustedOneRm, "lb") : adjustedOneRm);
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
          Calculadora Repetición Máxima (1RM)
        </h1>

        <div className="bg-[#3B4252] rounded-xl p-6 shadow-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              calculateOneRepMax();
            }}
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="weight"
                className="block text-sm font-medium text-white mb-1"
              >
                Peso
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="weight"
                  value={weight ?? ""}
                  onChange={handleWeightChange}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-500 rounded-md bg-[#2D3242] text-gray-200 text-center focus:outline-none focus:border-[#ff9404] focus:ring-2 focus:ring-[#ff9404]/20 focus:bg-[#2D3242] focus:scale-102 transition-all duration-300 placeholder:text-gray-500 placeholder:text-center [.error&]:border-[#ff4444] [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-12 sm:text-sm sm:px-2.5 sm:py-1.5"
                  placeholder="Ingresa el peso"
                />
                <button
                  type="button"
                  onClick={handleUnitChange}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-br from-[#ff9404] to-[#e08503] text-white border-none rounded-sm shadow-[0_0_5px_rgba(255,148,4,0.3)] hover:bg-gradient-to-br hover:from-[#e08503] hover:to-[#ff9404] hover:shadow-[0_0_10px_rgba(255,148,4,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 leading-none sm:text-[0.65rem] sm:px-1.5 sm:py-0.5 text-[0.6rem] px-1 py-0.5"
                >
                  {unit}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="reps"
                className="block text-sm font-medium text-white mb-1"
              >
                Repeticiones (1-30)
              </label>
              <input
                type="number"
                id="reps"
                value={reps ?? ""}
                onChange={handleRepsChange}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-500 rounded-md bg-[#2D3242] text-gray-200 text-center focus:outline-none focus:border-[#ff9404] focus:ring-2 focus:ring-[#ff9404]/20 focus:bg-[#2D3242] focus:scale-102 transition-all duration-300 placeholder:text-gray-500 placeholder:text-center [.error&]:border-[#ff4444] [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none sm:text-sm sm:px-2.5 sm:py-1.5"
                placeholder="Ingresa el número de reps"
              />
            </div>

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
                className="w-full px-2.5 py-1.5 text-sm border border-gray-500 rounded-md bg-[#2D3242] text-gray-200 text-center focus:outline-none focus:border-[#ff9404] focus:ring-2 focus:ring-[#ff9404]/20 focus:bg-[#2D3242] focus:scale-102 transition-all duration-300 placeholder:text-gray-500 placeholder:text-center [.error&]:border-[#ff4444] [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none sm:text-sm sm:px-2.5 sm:py-1.5"
                placeholder="Ingresa RPE (1-10)"
              />
            </div>

            <div>
              <label
                htmlFor="exercise"
                className="block text-sm font-medium text-white mb-1"
              >
                Ejercicio
              </label>
              <select
                id="exercise"
                value={exercise}
                onChange={(e) => setExercise(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-500 rounded-md bg-[#2D3242] text-gray-200 text-center focus:outline-none focus:border-[#ff9404] focus:ring-2 focus:ring-[#ff9404]/20 focus:bg-[#2D3242] focus:scale-102 transition-all duration-300 appearance-none 
                  [background-image:url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] 
                  bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.5em_1.5em] 
                  sm:text-sm sm:px-2.5 sm:py-1.5 sm:pr-7 pr-6"
              >
                {exercises.map((ex) => (
                  <option key={ex} value={ex} className="bg-[#2D3242] text-gray-200">
                    {ex}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 text-sm bg-gradient-to-br from-[#ff9404] to-[#e08503] text-white border-none rounded-md hover:bg-gradient-to-br hover:from-[#e08503] hover:to-[#ff9404] hover:shadow-[0_0_10px_rgba(255,148,4,0.5)] hover:scale-102 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed sm:text-sm sm:px-4 sm:py-2 "
              disabled={isButtonDisabled}
            >
              Calcular 1RM (Repetición Máxima)
            </button>

            {oneRepMax && (
              <div className="mt-6 space-y-4">
                <h2 className="text-4xl font-bold text-center text-white">
                  Tú 1RM es {oneRepMax} {unit}
                </h2>
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-white mb-4 text-center">
                    Máximo de Repeticiones Estimado
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

export default React.memo(OneRepMaxCalculator);