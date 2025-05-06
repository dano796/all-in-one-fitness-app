// src/components/FoodSearchIA.tsx
import React, { useState, useEffect, useCallback } from "react";
import ImageUploadDragDrop from "./ImageUploadDragDrop";
import { supabase } from "../lib/supabaseClient";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";
import axios, { AxiosError } from "axios";
import FoodItem from "./FoodItem";
import { motion } from "framer-motion";
import ButtonToolTip from "./ButtonToolTip";
import { useTheme } from "../pages/ThemeContext";
import { useNotificationStore } from "../store/notificationStore";

interface FoodSearchIAProps {
  initialType?: string;
  date?: string;
}

interface Food {
  food_id: string;
  food_name: string;
  food_description: string;
}

const FoodSearchIA: React.FC<FoodSearchIAProps> = ({ initialType, date }) => {
  const { isDarkMode } = useTheme();
  const { addNotification } = useNotificationStore();
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>(
    initialType
      ? initialType.charAt(0).toUpperCase() + initialType.slice(1)
      : "Desayuno"
  );

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        setError("Debes iniciar sesión para analizar imágenes.");
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  const handleImageUpload = (file: File) => {
    setUploadedImage(file);
    setResult(null);
    setError(null);
    addNotification(
      "Imagen cargada",
      `La imagen "${file.name}" ha sido cargada con éxito.`,
      "info",
      false,
      "comida"
    );
    console.log("Imagen subida:", file.name);
  };

  const handleImageRemove = () => {
    setUploadedImage(null);
    setResult(null);
    setError(null);
  };

  const handleCalculate = useCallback(async () => {
    if (!uploadedImage) {
      setError("Por favor sube una imagen para analizar");
      return;
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      setError("Debes iniciar sesión para analizar imágenes.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", uploadedImage);
      formData.append("email", user.email || "");
      formData.append("type", selectedType);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/foods/analyze-image`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al analizar la imagen");
      }

      setResult(data);
      
      addNotification(
        "Análisis completado",
        "La imagen ha sido analizada correctamente.",
        "success",
        true,
        "comida"
      );
    } catch (err) {
      const errorMessage = err instanceof Error && err.message.includes("No se pudo parsear")
        ? "No se pudo identificar la comida en la imagen. Por favor, intenta con otra imagen más clara."
        : err instanceof Error
        ? err.message
        : "Error al procesar la imagen con IA";
      
      setError(errorMessage);
      
      addNotification(
        "Error en el análisis",
        errorMessage,
        "error",
        true,
        "comida"
      );
    } finally {
      setLoading(false);
    }
  }, [uploadedImage, selectedType, addNotification]);

  const handleAddFood = useCallback(
    async (food: Food) => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        setError("Debes iniciar sesión para agregar alimentos.");
        return;
      }

      if (!selectedType) {
        setError(
          "No se especificó el tipo de comida (Desayuno, Almuerzo, etc.)."
        );
        return;
      }

      const normalizedType =
        selectedType.charAt(0).toUpperCase() +
        selectedType.slice(1).toLowerCase();

      const requestBody = {
        email: user.email,
        food_id: food.food_id,
        food_name: food.food_name,
        food_description: food.food_description,
        type: normalizedType,
      };

      setLoadingAdd(true);
      setError(null);

      try {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/foods/add`,
          requestBody
        );
        
        addNotification(
          "Alimento registrado",
          `Has añadido ${food.food_name} a tu registro de ${normalizedType.toLowerCase()}.`,
          "success",
          true,
          "comida"
        );

        await Swal.fire({
          title: "¡Éxito!",
          text: "La comida ha sido registrada exitosamente.",
          icon: "success",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#ff9400",
          background: isDarkMode ? "#282c3c" : "#ffffff",
          customClass: {
            popup: isDarkMode ? "custom-dark-swal" : "custom-light-swal",
            icon: "custom-swal-icon",
            title: isDarkMode ? "text-white" : "text-gray-900",
            htmlContainer: isDarkMode ? "text-gray-400" : "text-gray-600",
          },
        });

        setUploadedImage(null);
        setResult(null);
        setError(null);
        
        const currentDate = date || new Date().toISOString().split('T')[0];
        
        navigate(`/comidas?type=${normalizedType.toLowerCase()}&date=${currentDate}`, {
          state: { fromAddButton: true },
        });
      } catch (err) {
        const axiosError = err as AxiosError<{ error?: string }>;
        const errorMessage =
          axiosError.response?.data?.error || "Error al agregar el alimento";
        setError(errorMessage);

        addNotification(
          "Error al agregar alimento",
          errorMessage,
          "error",
          true,
          "comida"
        );

        await Swal.fire({
          title: "¡Error!",
          text: errorMessage,
          icon: "error",
          iconColor: "#ff9400",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#ff9404",
          customClass: {
            popup: isDarkMode
              ? "custom-swal-background"
              : "custom-swal-background-light",
            icon: "custom-swal-icon",
            title: isDarkMode ? "custom-swal-title" : "custom-swal-title-light",
            htmlContainer: isDarkMode
              ? "custom-swal-text"
              : "custom-swal-text-light",
          },
        });
      } finally {
        setLoadingAdd(false);
      }
    },
    [selectedType, navigate, date, isDarkMode, addNotification]
  );

  const handleFoodClick = useCallback(
    (food: Food) => {
      addNotification(
        "Ajustar cantidad",
        `Estás ajustando la cantidad de ${food.food_name}.`,
        "info",
        false,
        "comida"
      );
      
      navigate("/food-quantity-adjust", {
        state: { food, type: selectedType },
      });
    },
    [navigate, selectedType, addNotification]
  );

  const infoText = {
    foodAIInfo:
      "Utiliza Inteligencia Artificial para identificar alimentos en tus imágenes. Sube una foto de tu comida y el sistema reconocerá automáticamente los alimentos para que puedas agregarlos a tu registro diario.",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-lg p-6 shadow-md flex-1 mt-4 transition-colors duration-300 ${
        isDarkMode ? "bg-[#3B4252]" : "bg-white"
      }`}
    >
      <div className="flex items-center gap-3 mb-6">
        <h2
          className={`text-xl font-semibold ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Registro de Comida con IA
        </h2>
        <ButtonToolTip content={infoText.foodAIInfo} />
      </div>

      {/* Dropdown para seleccionar el tipo de comida */}
      <div className="mb-4">
        <label
          htmlFor="meal-type"
          className={`text-base font-medium mr-2 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Selecciona el tipo de comida:
        </label>
        <select
          id="meal-type"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className={`px-2.5 py-1.5 text-sm border rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#ff9404]/20 ${
            isDarkMode
              ? "border-gray-500 bg-[#2D3242] text-gray-200 focus:border-[#ff9404]"
              : "border-gray-300 bg-white hover:bg-[#F8F9FA] text-gray-900 focus:border-[#ff9404]"
          }`}
        >
          <option value="Desayuno">Desayuno</option>
          <option value="Almuerzo">Almuerzo</option>
          <option value="Cena">Cena</option>
          <option value="Merienda">Merienda</option>
        </select>
      </div>

      <ImageUploadDragDrop
        onImageUpload={handleImageUpload}
        onImageRemove={handleImageRemove}
      />
      {uploadedImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="mt-4 flex flex-col items-center space-y-4"
        >
          <p
            className={`text-center text-xs ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Imagen cargada:{" "}
            <span className="font-semibold">{uploadedImage?.name}</span>
          </p>
          <button
            onClick={handleCalculate}
            className={`flex items-center py-2 px-4 text-white font-semibold rounded-full shadow-md transition-all duration-300 hover:-translate-y-1 z-10 disabled:opacity-50 disabled:cursor-not-allowed ${
              isDarkMode
                ? "bg-gradient-to-r from-[#ff9404] to-[#FF6B35] hover:shadow-lg hover:from-[#FF6B35] hover:to-[#ff9404]"
                : "bg-orange-500 hover:bg-orange-600 hover:shadow-lg"
            }`}
            disabled={loading}
          >
            {loading ? "Analizando..." : "Analizar"}
          </button>
        </motion.div>
      )}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-red-400 mt-2 text-xs text-center"
        >
          {error}
        </motion.p>
      )}
      {result && result.foods && result.foods.food && result.foods.food[0] && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-4"
        >
          <h3
            className={`text-sm font-semibold mb-2 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Resultado
          </h3>
          <div className="space-y-3">
            <FoodItem
              food={result.foods.food[0]}
              onSelect={() => handleAddFood(result.foods.food[0])}
              onNavigate={handleFoodClick}
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default FoodSearchIA;
