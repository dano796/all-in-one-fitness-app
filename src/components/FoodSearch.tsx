import React, { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { supabase } from "../lib/supabaseClient";
import Swal from "sweetalert2";
import { FaArrowLeft, FaSearch } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ClipLoader } from "react-spinners";
import FoodItem from "./FoodItem";
import { useTheme } from "../pages/ThemeContext";

interface Food {
  food_id: string;
  food_name: string;
  food_description: string;
}

const FoodSearch: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [query, setQuery] = useState<string>("");
  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("");

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const type = searchParams.get("type") || "";

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        setError("Debes iniciar sesión para buscar alimentos.");
      } else {
        setUserEmail(user.email || "");
      }
    };
    checkAuth();
  }, []);

  const handleSearch = useCallback(
    async (
      e:
        | React.MouseEvent<HTMLButtonElement>
        | React.KeyboardEvent<HTMLInputElement>
    ) => {
      e.preventDefault();
      if (!query.trim()) {
        setError("Por favor ingresa un término de búsqueda");
        return;
      }

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        setError("Debes iniciar sesión para buscar alimentos.");
        return;
      }

      setLoading(true);
      setError(null);
      setHasSearched(true);

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/foods/search`,
          {
            params: { query, max_results: 10 },
          }
        );
        const foodResults = response.data.foods?.food || [];
        setFoods(Array.isArray(foodResults) ? foodResults : []);
        if (foodResults.length === 0) {
          await Swal.fire({
            title: "¡Información!",
            text: "No se encontraron alimentos para tu búsqueda.",
            icon: "info",
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#ff9404",
            customClass: {
              popup: "custom-swal-background",
              icon: "custom-swal-icon",
              title: "custom-swal-title",
              htmlContainer: "custom-swal-text",
            },
          });
        }
      } catch (err) {
        const axiosError = err as AxiosError<{ error?: string }>;
        setError(
          axiosError.response?.data?.error || "Error al buscar alimentos"
        );
        await Swal.fire({
          title: "¡Error!",
          text: "No se pudo guardar el alimento. Por favor intente de nuevo.",
          icon: "error",
          iconColor: "#ff9400",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#ff9400",
          customClass: {
            popup: "custom-swal-background",
            icon: "custom-swal-icon",
            title: "custom-swal-title",
            htmlContainer: "custom-swal-text",
          },
        });
      } finally {
        setLoading(false);
      }
    },
    [query]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSearch(e);
      }
    },
    [handleSearch]
  );

  const handleSelectFood = useCallback((food: Food) => {
    setSelectedFood(food);
  }, []);

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

      if (!type) {
        setError(
          "No se especificó el tipo de comida (Desayuno, Almuerzo, etc.)."
        );
        return;
      }

      const normalizedType =
        type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

      const requestBody = {
        email: user.email,
        food_id: food.food_id,
        food_name: food.food_name,
        food_description: food.food_description,
        type: normalizedType,
      };

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/foods/add`,
          requestBody
        );

        await Swal.fire({
          title: "¡Éxito!",
          text: "El alimento ha sido registrado correctamente.",
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

        setSelectedFood(null);
        setFoods([]);
        setQuery("");
        setError(null);
        setHasSearched(false);
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
          iconColor: "#ff9400",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#ff9400",
          customClass: {
            popup: "custom-swal-background",
            icon: "custom-swal-icon",
            title: "custom-swal-title",
            htmlContainer: "custom-swal-text",
          },
        });
      }
    },
    [type, navigate]
  );

  const handleFoodClick = useCallback(
    (food: Food) => {
      navigate("/food-quantity-adjust", { state: { food, type } });
    },
    [navigate, type]
  );

  return (
    <div
      className={`relative min-h-screen ${
        isDarkMode ? "bg-[#282c3c]" : "bg-[#F8F9FA]"
      } overflow-hidden`}
    >
      <div className="relative z-10 p-4 mt-8 sm:p-6 space-y-4 sm:space-y-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <Link to="/dashboard">
                <button
                  className={`flex items-center py-2 px-3 sm:px-4 bg-gradient-to-r from-[#ff9404] to-[#FF6B35] ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  } font-semibold rounded-full shadow-[0_0_10px_rgba(255,148,4,0.3)] hover:shadow-[0_0_15px_rgba(255,148,4,0.5)] hover:scale-105 active:scale-95 transition-all duration-300`}
                  aria-label="Volver al dashboard"
                >
                  <FaArrowLeft className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Volver
                </button>
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className={`${
              isDarkMode ? "bg-[#3B4252]" : "bg-white"
            } rounded-lg p-4 sm:p-5 shadow-md w-full mt-3 sm:mt-4`}
          >
            <h2
              className={`text-base sm:text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              } mb-3 sm:mb-4`}
            >
              Buscar Alimentos
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ingresa un alimento (ejemplo: manzana)"
                disabled={loading}
                className={`w-full px-3 py-2 sm:px-4 sm:py-2 border ${
                  isDarkMode
                    ? "border-gray-600 bg-[#2D3242] text-white placeholder-gray-400"
                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                } rounded-lg focus:ring-[1.5px] focus:ring-[#ff9404] focus:outline-none focus:border-0 text-sm sm:text-base`}
                aria-label="Buscar alimentos"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className={`flex items-center justify-center py-2 px-4 sm:px-6 bg-gradient-to-br from-[#ff9404] to-[#FF6B35] ${
                  isDarkMode ? "text-white" : "text-gray-900"
                } font-semibold rounded-lg shadow-md hover:shadow-[0_0_15px_rgba(255,148,4,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label="Iniciar búsqueda"
              >
                {loading ? (
                  <ClipLoader color="#ffffff" size={16} />
                ) : (
                  <>
                    <FaSearch className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Buscar
                  </>
                )}
              </button>
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 mt-2 sm:mt-3 text-xs sm:text-sm"
              >
                {error}
              </motion.p>
            )}
          </motion.div>
        </div>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center my-6 sm:my-8"
          >
            <ClipLoader color="#ff9404" size={40} />
          </motion.div>
        )}

        {hasSearched && !loading && foods.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center my-6 sm:my-8 max-w-5xl mx-auto text-sm sm:text-base ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            } px-2 sm:px-4`}
          >
            No se encontraron resultados
          </motion.div>
        )}

        {foods.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`${
              isDarkMode ? "bg-[#3B4252]" : "bg-white"
            } rounded-lg p-4 sm:p-5 shadow-md max-w-5xl mx-auto px-2 sm:px-4`}
          >
            <h3
              className={`text-lg sm:text-xl font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              } mx-2 mb-3 sm:mb-4`}
            >
              Resultados
            </h3>
            <div
              className={`space-y-3 max-h-[50vh] overflow-y-auto ml-2 pr-2 [scrollbar-width:thin] scrollbar-thin ${
                isDarkMode
                  ? "scrollbar-track-[#2D3242] scrollbar-thumb-[#6B7280] hover:scrollbar-thumb-[#9CA3AF]"
                  : "scrollbar-track-gray-100 scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500"
              }`}
            >
              {foods.map((food) => (
                <FoodItem
                  key={food.food_id}
                  food={food}
                  onSelect={() => {
                    handleSelectFood(food);
                    handleAddFood(food);
                  }}
                  onNavigate={handleFoodClick}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default React.memo(FoodSearch);
