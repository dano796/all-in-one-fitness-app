// src/components/AnatomyViewer.tsx
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../pages/ThemeContext";
import GalaxyBackground from "./GalaxyBackground";
import ButtonToolTip from "./ButtonToolTip";

const AnatomyViewer: React.FC = () => {
  const { isDarkMode } = useTheme();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  // Model URL from the Sketchfab link provided
  const modelUrl =
    "https://sketchfab.com/models/197a68dea64246d38f22b97b5d7c0bb1/embed";

  // Instrucciones para el ToolTip
  const infoText = {
    anatomyViewerInfo:
      "Explora el sistema muscular humano en un modelo 3D interactivo. Puedes rotar, acercar y alejar el modelo para ver los músculos desde diferentes ángulos.",
  };

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        const newProgress = prev + Math.random() * 15;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 500);

    // Cleanup interval
    return () => clearInterval(interval);
  }, []);

  // Handle iframe load event
  const handleIframeLoad = () => {
    setIsLoading(false);
    setLoadingProgress(100);
  };
  return (
    <div
      className={`min-h-screen relative px-2 sm:px-4 py-4 ${
        isDarkMode ? "bg-transparent" : "bg-transparent"
      } transition-colors duration-300`}
    >
      <GalaxyBackground />{" "}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-6 sm:mb-8 text-center relative z-10"
      >
        <div className="flex flex-wrap items-center justify-center">
          {" "}
          <h1
            className={`text-xl sm:text-2xl md:text-3xl font-bold mt-8 md:mt-4 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Visualizador de Anatomía Muscular 3D
          </h1>
          <div className="ml-2 flex items-center z-10 mt-0 min-[415px]:mt-7 md:mt-3">
            <ButtonToolTip content={infoText.anatomyViewerInfo} />
          </div>
        </div>
        <p
          className={`mt-2 px-4 max-w-3xl mx-auto text-sm sm:text-base ${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Explora el sistema muscular humano y visualiza los grupos musculares
          principales y su disposición en el cuerpo humano. Conoce sus nombres,
          ubicaciones y funciones principales.
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.68, -0.55, 0.265, 1.55] }}
        className={`rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl backdrop-blur-sm mx-auto max-w-6xl w-[95%] relative ${
          isDarkMode
            ? "bg-[#3B4252]/80 border border-gray-600"
            : "bg-white/90 border border-gray-200"
        }`}
      >
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 rounded-2xl bg-opacity-90 bg-black">
            <div className="text-white mb-4">Cargando modelo 3D...</div>
            <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#ff9404]"
                initial={{ width: "0%" }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="text-white mt-2">
              {Math.round(loadingProgress)}%
            </div>
          </div>
        )}{" "}
        <div className="relative aspect-video w-full overflow-hidden">
          <iframe
            ref={iframeRef}
            title="Modelo anatómico muscular 3D"
            onLoad={handleIframeLoad}
            className="w-full h-full rounded-xl"
            src={`${modelUrl}?autospin=0&ui_theme=${
              isDarkMode ? "dark" : "light"
            }&ui_annotations=1&ui_controls=1&ui_fullscreen=1&ui_help=0&ui_inspector=0&ui_settings=0&ui_vr=0`}
            allowFullScreen
            allow="autoplay; fullscreen; xr-spatial-tracking"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default React.memo(AnatomyViewer);
