import React, { useState, useEffect, useCallback } from "react";
import ImageUploadDragDrop from "./ImageUploadDragDrop";
import { supabase } from "../lib/supabaseClient";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";

interface Food {
  food_id: string;
  food_name: string;
  food_description: string;
}

interface FoodSearchIAProps {
  type: string;
}

const FoodSearchIA: React.FC<FoodSearchIAProps> = ({ type }) => {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setError("Debes iniciar sesión para analizar imágenes.");
        navigate("/login");
      } else {
        setUserEmail(user.email || "");
      }
    };
    checkAuth();
  }, [navigate]);

  const handleImageUpload = (file: File) => {
    setUploadedImage(file);
    setResult(null);
    setError(null);
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

    const { data: { user }, error: authError } = await supabase.auth.getUser();
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
      formData.append("type", type);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/foods/analyze-image`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al analizar la imagen");
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error && err.message.includes("No se pudo parsear")
          ? "No se pudo identificar la comida en la imagen. Por favor, intenta con otra imagen más clara."
          : (err instanceof Error ? err.message : "Error al procesar la imagen con IA")
      );
    } finally {
      setLoading(false);
    }
  }, [uploadedImage, type]);

  const handleAddFood = useCallback(
    async () => {
      if (!result || !result.foods || !result.foods.food || !result.foods.food[0]) {
        setError("No hay comida válida para agregar. Primero analiza una imagen.");
        return;
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setError("Debes iniciar sesión para agregar alimentos.");
        return;
      }

      if (!type) {
        setError("No se especificó el tipo de comida (Desayuno, Almuerzo, etc.).");
        return;
      }

      const normalizedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

      const requestBody = {
        email: user.email,
        food_id: result.foods.food[0].food_id,
        food_name: result.foods.food[0].food_name,
        food_description: result.foods.food[0].food_description,
        type: normalizedType,
      };

      setLoadingAdd(true);
      setError(null);

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/foods/add`,
          requestBody
        );

        await Swal.fire({
          title: "¡Éxito!",
          text: response.data.message,
          icon: "success",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#ff9404",
          customClass: {
            popup: "custom-swal-background",
            icon: "custom-swal-icon",
            title: "custom-swal-title",
            htmlContainer: "custom-swal-text",
          },
        });

        setUploadedImage(null);
        setResult(null);
        setError(null);
        navigate(`/dashboard?type=${normalizedType}`, {
          state: { fromAddButton: true },
        });
      } catch (err) {
        const axiosError = err as AxiosError<{ error?: string }>;
        const errorMessage =
          axiosError.response?.data?.error || "Error al agregar el alimento";
        setError(errorMessage);
        await Swal.fire({
          title: "¡Error!",
          text: errorMessage,
          icon: "error",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#ff9400",
          customClass: {
            popup: "custom-swal-background",
            title: "custom-swal-title",
            htmlContainer: "custom-swal-text",
          },
        });
      } finally {
        setLoadingAdd(false);
      }
    },
    [result, type, navigate]
  );

  return (
    <div className="bg-[#3B4252] rounded-lg p-4 shadow-md flex-1 mt-4">
      <h2 className="text-sm font-semibold mb-2 text-white">Registro de Comida con IA</h2>
      <ImageUploadDragDrop
        onImageUpload={handleImageUpload}
        onImageRemove={handleImageRemove}
      />
      {uploadedImage && (
        <div className="mt-4 flex flex-col items-center space-y-4">
          <p className="text-gray-400 text-center text-xs">
            Imagen cargada: <span className="font-semibold">{uploadedImage.name}</span>
          </p>
          <button
            onClick={handleCalculate}
            className="flex items-center py-2 px-4 bg-gradient-to-r from-[#ff9404] to-[#FF6B35] text-white font-semibold rounded-full shadow-md hover:shadow-lg hover:from-[#FF6B35] hover:to-[#ff9404] transition-all duration-300 hover:-translate-y-1 z-10 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Analizando..." : "Analizar"}
          </button>
        </div>
      )}
      {error && (
        <p className="text-red-400 mt-2 text-xs text-center">{error}</p>
      )}
      {result && (
        <div className="mt-4 text-gray-400 text-center">
          <p className="text-sm font-medium text-white">
            Comida identificada: {result.foods.food[0].food_name}
          </p>
          <p className="text-xs text-gray-300">{result.foods.food[0].food_description}</p>
          <button
            onClick={handleAddFood}
            className="mt-4 flex items-center py-2 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-full shadow-md hover:shadow-lg hover:from-green-600 hover:to-green-500 transition-all duration-300 hover:-translate-y-1 z-10 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loadingAdd}
          >
            {loadingAdd ? "Agregando..." : "Agregar"}
          </button>
        </div>
      )}
    </div>
  );
};

export default FoodSearchIA;