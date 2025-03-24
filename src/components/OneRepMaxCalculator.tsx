import React, { useState } from "react";

const customStyles = `
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
    text-align: center;
  }
  .calorie-goal-input.error {
    border-color: #ff4444;
  }

  /* Estilo para Input con Botón de Unidad */
  .calorie-goal-input-with-unit {
    padding-right: 48px;
  }

  /* Estilo para Select (Dropdown) */
  .calorie-goal-select {
    width: 100%;
    padding: 6px 30px 6px 10px;
    font-size: 0.875rem;
    border: 1px solid #6B7280;
    border-radius: 6px;
    background: #2D3242;
    color: #E5E7EB;
    text-align: center;
    text-align-last: center;
    transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1.5em;
  }
  .calorie-goal-select:focus {
    outline: none;
    border-color: #ff9404;
    box-shadow: 0 0 0 3px rgba(255, 148, 4, 0.2);
    background: #2D3242;
    transform: scale(1.02);
  }
  .calorie-goal-select option {
    text-align: center;
  }

  /* Estilo para el Botón de Unidad */
  .unit-toggle-button {
    padding: 2px 6px;
    font-size: 0.65rem;
    background: linear-gradient(45deg, #ff9404, #e08503);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    box-shadow: 0 0 5px rgba(255, 148, 4, 0.3);
    transition: all 0.3s ease;
    line-height: 1;
  }
  .unit-toggle-button:hover {
    background: linear-gradient(45deg, #e08503, #ff9404);
    box-shadow: 0 0 10px rgba(255, 148, 4, 0.5);
    transform: scale(1.05);
  }
  .unit-toggle-button:active {
    transform: scale(0.95);
  }

  /* Estilo para el Botón de Calcular */
  .calculate-button {
    width: 100%;
    padding: 8px 16px;
    font-size: 0.875rem;
    background: linear-gradient(45deg, #ff9404, #e08503);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  .calculate-button:hover {
    background: linear-gradient(45deg, #e08503, #ff9404);
    box-shadow: 0 0 10px rgba(255, 148, 4, 0.5);
    transform: scale(1.02);
  }
  .calculate-button:disabled {
    background: #6B7280;
    cursor: not-allowed;
  }

  /* Responsive Adjustments */
  @media (max-width: 640px) {
    .calorie-goal-input {
      width: 100%;
      font-size: 0.75rem;
      padding: 4px 8px;
    }
    .calorie-goal-input-with-unit {
      padding-right: 40px;
    }
    .calorie-goal-select {
      font-size: 0.75rem;
      padding: 4px 24px 4px 8px;
    }
    .unit-toggle-button {
      padding: 2px 4px;
      font-size: 0.6rem;
    }
    .calculate-button {
      font-size: 0.75rem;
      padding: 6px 12px;
    }
  }
`;

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
      <style>{customStyles}</style>
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
                  className="calorie-goal-input calorie-goal-input-with-unit"
                  placeholder="Ingresa el peso"
                />
                <button
                  type="button"
                  onClick={handleUnitChange}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 unit-toggle-button"
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
                className="calorie-goal-input"
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
                className="calorie-goal-input"
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
                className="calorie-goal-select"
              >
                {exercises.map((ex) => (
                  <option key={ex} value={ex}>
                    {ex}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="calculate-button"
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