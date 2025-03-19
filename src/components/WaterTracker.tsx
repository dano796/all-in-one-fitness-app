import React, { useState } from "react";
import { useSpring, animated } from "react-spring";
import EmptyBottle from "../assets/empty-bottle.png"; // Ajusta la ruta según tu estructura
import FilledBottle from "../assets/filled-bottle.png"; // Ajusta la ruta según tu estructura

const WaterTracker: React.FC = () => {
  const totalBottles = 8; // Total de 8 botellas
  const [filledBottles, setFilledBottles] = useState<number>(0); // Cantidad de botellas llenas

  const handleAddBottle = () => {
    if (filledBottles < totalBottles) {
      setFilledBottles((prev) => prev + 1);
    }
  };

  const handleRemoveBottle = () => {
    if (filledBottles > 0) {
      setFilledBottles((prev) => prev - 1);
    }
  };

  // Generar las botellas con animaciones
  const bottles = Array(totalBottles)
    .fill(0)
    .map((_, index) => {
      const isFilled = index < filledBottles;

      // Animación para la opacidad de la botella vacía y llena
      const emptySpring = useSpring({
        opacity: isFilled ? 0 : 1,
        config: { duration: 500 },
      });

      const filledSpring = useSpring({
        opacity: isFilled ? 1 : 0,
        config: { duration: 500 },
      });

      return (
        <div key={index} className="relative w-20 h-40">
          {/* Botella vacía */}
          <animated.img
            src={EmptyBottle}
            alt="Empty Bottle"
            className="absolute w-20 h-40 object-contain"
            style={{ opacity: emptySpring.opacity }}
          />
          {/* Botella llena */}
          <animated.img
            src={FilledBottle}
            alt="Filled Bottle"
            className="absolute w-20 h-40 object-contain"
            style={{ opacity: filledSpring.opacity }}
          />
        </div>
      );
    });

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#282c3c]">
      <div className="bg-[#3B4252] rounded-lg p-8 shadow-lg text-center">
        <h2 className="text-2xl font-semibold text-white mb-6">
          Control de Consumo de Agua
        </h2>
        <p className="text-base text-gray-300 mb-8">
          Botellas consumidas: {filledBottles}/{totalBottles}
        </p>

        {/* Visualización de botellas */}
        <div className="flex flex-wrap justify-center gap-6 mb-10">
          {bottles}
        </div>

        {/* Botones */}
        <div className="flex justify-center space-x-6">
          <button
            onClick={handleRemoveBottle}
            disabled={filledBottles === 0}
            className={`px-6 py-3 bg-[#ff9404] text-white font-semibold rounded-lg text-xl ${
              filledBottles === 0
                ? "opacity-50 cursor-not-allowed"
                : "hover:text-[#1C1C1E]"
            } transition duration-300`}
          >
            -
          </button>
          <button
            onClick={handleAddBottle}
            disabled={filledBottles === totalBottles}
            className={`px-6 py-3 bg-[#ff9404] text-white font-semibold rounded-lg text-xl ${
              filledBottles === totalBottles
                ? "opacity-50 cursor-not-allowed"
                : "hover:text-[#1C1C1E]"
            } transition duration-300`}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaterTracker;
