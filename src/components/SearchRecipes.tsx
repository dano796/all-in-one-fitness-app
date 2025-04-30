import React, { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { supabase } from "../lib/supabaseClient";
import GalaxyBackground from "./GalaxyBackground";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaSearch,
  FaExternalLinkAlt,
  FaTimes,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import ButtonToolTip from "./ButtonToolTip";
import { ClipLoader } from "react-spinners";
import { Recipe } from "../types";
import { useTheme } from "../pages/ThemeContext";
import ChatBot from "../components/ChatBot";
import { User } from "@supabase/supabase-js";

const SearchRecipes: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [query, setQuery] = useState<string>("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [isChatBotOpen, setIsChatBotOpen] = useState<boolean>(false);
  const [initialChatMessage, setInitialChatMessage] = useState<string>("");

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        setError("Debes iniciar sesión para buscar recetas.");
        navigate("/login");
      } else {
        setUser(user);
        setUserEmail(user.email || "");
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (selectedRecipe) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [selectedRecipe]);

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
      setLoading(true);
      setError(null);
      setHasSearched(true);
      setSelectedRecipe(null);

      try {
        const response = await axios.get(`${API_URL}/api/recipes/search`, {
          params: { query, max_results: 10 },
        });
        const recipeData = response.data.recipes?.recipe || [];
        const validRecipes = Array.isArray(recipeData)
          ? recipeData.filter((recipe) => recipe.recipe_id)
          : recipeData.recipe_id
          ? [recipeData]
          : [];
        setRecipes(validRecipes);
        if (validRecipes.length === 0) {
          setError("No se encontraron recetas válidas para tu búsqueda.");
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.error || error.message);
        } else {
          setError("Ocurrió un error inesperado.");
        }
      } finally {
        setLoading(false);
      }
    },
    [query, API_URL]
  );

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  const handleClose = () => {
    setSelectedRecipe(null);
  };

  const handleOpenChatBot = (recipe: Recipe) => {
    const ingredients = recipe.recipe_ingredients?.ingredient?.map((ing: any) => {
      if (typeof ing === "string") {
        return ing;
      } else {
        let ingredientText = ing.ingredient_name || "Ingrediente desconocido";
        if (ing.quantity && ing.measurement_description) {
          ingredientText += ` (${ing.quantity} ${ing.measurement_description})`;
        }
        if (ing.ingredient_description) {
          ingredientText += ` (${ing.ingredient_description})`;
        }
        return ingredientText;
      }
    }).join(", ") || "Ingredientes no disponibles";

    const message = `¿Cómo puedo preparar una receta de "${recipe.recipe_name}" con los siguientes ingredientes: ${ingredients}? Por favor, dame instrucciones detalladas paso a paso.`;
    setInitialChatMessage(message);
    setIsChatBotOpen(true);
  };

  const infoText = {
    recipeSearch:
      "Busca recetas por ingrediente, tipo de cocina o plato. Encontrarás información detallada sobre ingredientes, preparación, nutrición y más.",
  };

  const formatNutrition = (nutrition: Recipe["recipe_nutrition"]) => {
    if (!nutrition)
      return {
        calories: "N/A",
        fat: "N/A",
        carbohydrate: "N/A",
        protein: "N/A",
      };
    return {
      calorias: nutrition.calories ? `${nutrition.calories} kcal` : "N/A",
      grasa: nutrition.fat ? `${nutrition.fat} g` : "N/A",
      carbohidratos: nutrition.carbohydrate
        ? `${nutrition.carbohydrate} g`
        : "N/A",
      proteína: nutrition.protein ? `${nutrition.protein} g` : "N/A",
    };
  };

  return (
    <div
      className={`relative min-h-screen overflow-hidden ${
        isDarkMode ? "bg-[#282c3c]" : "bg-[#F8F9FA]"
      }`}
    >
      <div className="absolute inset-0 z-0">
        <GalaxyBackground />
      </div>

      <div className="relative z-10 p-4 mt-8 lg:mt-0 sm:p-6 space-y-4 sm:space-y-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center py-2 px-3 sm:px-4 bg-gradient-to-r from-[#ff9404] to-[#FF6B35] text-white font-semibold rounded-full shadow-[0_0_10px_rgba(255,148,4,0.3)] hover:shadow-[0_0_15px_rgba(255,148,4,0.5)] hover:scale-105 active:scale-95 transition-all duration-300"
                aria-label="Volver al dashboard"
              >
                <FaArrowLeft className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Volver
              </button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className={`rounded-lg p-4 sm:p-5 shadow-md w-full mt-3 sm:mt-4 ${
              isDarkMode ? "bg-[#3B4252]" : "bg-white"
            }`}
          >
            <div className="flex items-center mb-3 sm:mb-4">
              <h3
                className={`text-base sm:text-lg font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                } mr-2`}
              >
                Buscar Recetas
              </h3>
              <ButtonToolTip content={infoText.recipeSearch} />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Buscar recetas... (ej: pasta, pizza, ensalada)"
                className={`w-full px-3 py-2 sm:px-4 sm:py-2 border rounded-lg focus:ring-[1.5px] focus:ring-[#ff9404] focus:outline-none focus:border-0 text-sm sm:text-base ${
                  isDarkMode
                    ? "border-gray-600 bg-[#2D3242] text-white placeholder-gray-400"
                    : "border-gray-300 bg-white focus:bg-[#F8F9FA] text-gray-900 placeholder-gray-500"
                }`}
                disabled={!userEmail || loading}
                aria-label="Buscar recetas"
              />
              <button
                onClick={handleSearch}
                className="flex items-center justify-center py-2 px-4 sm:px-6 bg-gradient-to-br from-[#ff9404] to-[#FF6B35] text-white font-semibold rounded-lg shadow-md hover:shadow-[0_0_15px_rgba(255,148,4,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!userEmail || loading}
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

        {hasSearched && !loading && recipes.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center my-6 sm:my-8 max-w-5xl mx-auto text-sm sm:text-base px-2 sm:px-4 ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            No se encontraron recetas para tu búsqueda.
          </motion.div>
        )}

        {recipes.length > 0 && !selectedRecipe && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`rounded-lg p-4 sm:p-5 shadow-md max-w-5xl mx-auto px-2 sm:px-4 ${
              isDarkMode ? "bg-[#3B4252]" : "bg-white"
            }`}
          >
            <h3
              className={`text-lg sm:text-xl font-semibold mx-2 mb-3 sm:mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Resultados
            </h3>
            <div className="space-y-3 sm:space-y-4 max-h-[50vh] overflow-y-auto ml-2 pr-2 [scrollbar-width:thin] scrollbar-thin scrollbar-track-[#2D3242] scrollbar-thumb-[#6B7280] hover:scrollbar-thumb-[#9CA3AF]">
              {recipes.map((recipe) => (
                <motion.div
                  key={recipe.recipe_id}
                  whileHover={{ scale: 1.001 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRecipeSelect(recipe)}
                  className={`cursor-pointer p-3 sm:p-4 rounded-lg border hover:shadow-[0_0_10px_rgba(255,148,4,0.2)] transition-all duration-200 flex items-start gap-3 sm:gap-4 ${
                    isDarkMode
                      ? "bg-[#2D3242] border-gray-600 hover:border-[#ff9404]"
                      : "bg-white border-gray-300 hover:bg-[#F8F9FA] hover:border-[#ff9404]"
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleRecipeSelect(recipe)
                  }
                  aria-label={`Ver detalles de ${recipe.recipe_name}`}
                >
                  {recipe.recipe_image && (
                    <img
                      src={recipe.recipe_image}
                      alt={recipe.recipe_name}
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-md"
                    />
                  )}
                  <div className="flex-1">
                    <p
                      className={`font-medium text-sm sm:text-base ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {recipe.recipe_name}
                    </p>
                    {recipe.recipe_description && (
                      <p
                        className={`text-xs sm:text-sm mt-1 line-clamp-2 ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {recipe.recipe_description}
                      </p>
                    )}
                    <div
                      className={`text-xs mt-1 sm:mt-2 flex gap-3 sm:gap-4 ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {recipe.cooking_time_min && (
                        <span>Tiempo: {recipe.cooking_time_min} min</span>
                      )}
                      {recipe.number_of_servings && (
                        <span>Porciones: {recipe.number_of_servings}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {selectedRecipe && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed -inset-10 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0"
              onClick={handleClose}
              role="dialog"
              aria-modal="true"
              aria-label="Detalles de la receta"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className={`rounded-lg p-4 sm:p-6 shadow-xl w-full max-w-[75vw] max-h-[90vh] overflow-hidden relative ${
                  isDarkMode ? "bg-[#3B4252]" : "bg-white"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <div className="w-6 sm:w-8"></div>
                  <h2
                    className={`text-2xl sm:text-3xl font-bold text-center flex-grow px-2 sm:px-4 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {selectedRecipe.recipe_name || "Receta sin nombre"}
                  </h2>
                  <button
                    onClick={handleClose}
                    className={`hover:text-[#ff9404] transition-all duration-300 z-20 w-6 sm:w-8 flex-shrink-0 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                    aria-label="Cerrar modal"
                  >
                    <FaTimes className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>

                <div className="flex justify-center mb-4">
                  <button
                    onClick={() => handleOpenChatBot(selectedRecipe)}
                    className="flex items-center py-2 px-4 bg-gradient-to-r from-[#ff9404] to-[#FF6B35] text-white font-semibold rounded-full shadow-[0_0_10px_rgba(255,148,4,0.3)] hover:shadow-[0_0_15px_rgba(255,148,4,0.5)] hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    ¿Quieres saber cómo prepararla?
                  </button>
                </div>

                {error && (
                  <p className="text-red-400 mb-3 sm:mb-4 text-xs sm:text-sm">
                    {error}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-2 sm:mt-4">
                  <div className="flex flex-col items-center">
                    {selectedRecipe.recipe_image ? (
                      <img
                        src={selectedRecipe.recipe_image}
                        alt={selectedRecipe.recipe_name || "Receta"}
                        className="w-full h-48 sm:h-64 md:h-80 object-contain rounded-lg"
                      />
                    ) : (
                      <div
                        className={`w-full h-48 sm:h-64 md:h-80 rounded-lg flex items-center justify-center ${
                          isDarkMode ? "bg-gray-600" : "bg-gray-200"
                        }`}
                      >
                        <p
                          className={`text-xs sm:text-sm ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Imagen no disponible
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="overflow-y-auto max-h-[60vh] sm:max-h-[70vh] pr-2 sm:pr-6 [scrollbar-width:thin] scrollbar-thin scrollbar-track-[#2D3242] scrollbar-thumb-[#6B7280] hover:scrollbar-thumb-[#9CA3AF]">
                    {selectedRecipe.recipe_description && (
                      <div className="mb-3 sm:mb-4">
                        <h3 className="text-base sm:text-lg font-semibold text-[#ff9404] mb-1 sm:mb-2">
                          Descripción
                        </h3>
                        <p
                          className={`text-xs sm:text-sm ${
                            isDarkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {selectedRecipe.recipe_description}
                        </p>
                      </div>
                    )}

                    <div className="mb-3 sm:mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-[#ff9404] mb-1 sm:mb-2">
                        Información
                      </h3>
                      <div
                        className={`text-xs sm:text-sm space-y-1 ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {selectedRecipe.cooking_time_min && (
                          <p>
                            <strong>Tiempo de preparación:</strong>{" "}
                            {selectedRecipe.cooking_time_min} minutos
                          </p>
                        )}
                        {selectedRecipe.number_of_servings && (
                          <p>
                            <strong>Porciones:</strong>{" "}
                            {selectedRecipe.number_of_servings}
                          </p>
                        )}
                        {(selectedRecipe.recipe_types?.recipe_type?.length ??
                          0) > 0 && (
                          <p>
                            <strong>Tipo:</strong>{" "}
                            {selectedRecipe.recipe_types?.recipe_type.join(
                              ", "
                            ) || "No disponible"}
                          </p>
                        )}
                        {(selectedRecipe.recipe_categories?.recipe_category
                          ?.length ?? 0) > 0 && (
                          <p>
                            <strong>Categorías:</strong>{" "}
                            {selectedRecipe.recipe_categories?.recipe_category.join(
                              ", "
                            ) || "No disponible"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mb-3 sm:mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-[#ff9404] mb-1 sm:mb-2">
                        Nutrición (por porción)
                      </h3>
                      <div
                        className={`grid grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {Object.entries(
                          formatNutrition(selectedRecipe.recipe_nutrition || {})
                        ).map(([key, value]) => (
                          <p key={key}>
                            <strong>
                              {key.charAt(0).toUpperCase() + key.slice(1)}:
                            </strong>{" "}
                            {value}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="mb-3 sm:mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-[#ff9404] mb-1 sm:mb-2">
                        Ingredientes
                      </h3>
                      {(selectedRecipe.recipe_ingredients?.ingredient?.length ?? 0) > 0 ? (
                        <ul
                          className={`list-disc pl-5 space-y-1 text-xs sm:text-sm ${
                            isDarkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {selectedRecipe.recipe_ingredients?.ingredient.map((ing: any, index: number) => (
                            <li key={index}>
                              {typeof ing === "string" 
                                ? ing 
                                : ing.ingredient_name 
                                  ? ing.ingredient_name 
                                  : "Ingrediente desconocido"}
                              {typeof ing !== "string" && ing.quantity && ing.measurement_description
                                ? ` (${ing.quantity} ${ing.measurement_description})`
                                : ""}
                              {typeof ing !== "string" && ing.ingredient_description
                                ? ` (${ing.ingredient_description})`
                                : ""}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p
                          className={`text-xs sm:text-sm ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Ingredientes no disponibles
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ChatBot user={user} initialMessage={initialChatMessage} isOpen={isChatBotOpen} onClose={() => setIsChatBotOpen(false)} />
      </div>
    </div>
  );
};

export default SearchRecipes;