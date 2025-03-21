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
        <div key={index} className="relative w-16 h-32">
          {/* Botella vacía */}
          <animated.img
            src={EmptyBottle}
            alt="Empty Bottle"
            className="absolute w-16 h-32 object-contain"
            style={{ opacity: emptySpring.opacity }}
          />
          {/* Botella llena */}
          <animated.img
            src={FilledBottle}
            alt="Filled Bottle"
            className="absolute w-16 h-32 object-contain"
            style={{ opacity: filledSpring.opacity }}
          />
        </div>
      );
    });

  return (
    <div className="container mx-auto px-4 py-16 bg-[#282c3c] text-white min-h-screen">
      <div className="max-w-2xl mx-auto w-full">
        <h1 className="text-5xl font-bold mb-12 text-center text-white">
          Water Tracker
        </h1>

        <div className="bg-[#3B4252] rounded-xl p-6 shadow-md">
          <p className="text-sm font-medium text-white mb-4 text-center">
            Botellas consumidas: {filledBottles}/{totalBottles}
          </p>

          {/* Visualización de botellas */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {bottles}
          </div>

          {/* Botones */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleRemoveBottle}
              disabled={filledBottles === 0}
              className={`w-12 h-12 bg-[#ff9404] text-white font-extrabold rounded-lg flex items-center justify-center ${
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
              className={`w-12 h-12 bg-[#ff9404] text-white font-bold rounded-lg flex items-center justify-center ${
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
    </div>
  );
};

export default WaterTracker;
