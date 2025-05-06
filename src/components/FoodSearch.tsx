import React, { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { supabase } from "../lib/supabaseClient";
import Swal from "sweetalert2";
import { FaArrowLeft, FaSearch, FaCheck, FaPlus } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ClipLoader } from "react-spinners";
import { useTheme } from "../pages/ThemeContext";
import { useNotificationStore } from "../store/notificationStore";

interface Food {
  food_id: string;
  food_name: string;
  food_description: string;
  selected?: boolean;
}

const FoodSearch: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { addNotification } = useNotificationStore();
  const [query, setQuery] = useState<string>("");
  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [addingMultiple, setAddingMultiple] = useState<boolean>(false);

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
        const formattedFoods = Array.isArray(foodResults) ? foodResults : [];
        
        const updatedFoods = formattedFoods.map(food => ({
          ...food,
          selected: selectedFoods.some(selected => selected.food_id === food.food_id)
        }));
        
        setFoods(updatedFoods);
        
        if (formattedFoods.length > 0) {
          addNotification(
            "Búsqueda completada",
            `Se encontraron ${formattedFoods.length} resultados para "${query}"`,
            "success",
            false,
            "comida"
          );
        } else {
          addNotification(
            "Sin resultados",
            `No se encontraron alimentos para "${query}"`,
            "info",
            false,
            "comida"
          );
        }
        
        if (formattedFoods.length === 0) {
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
          text: "No se pudo buscar el alimento. Por favor intente de nuevo.",
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
    [query, selectedFoods, addNotification]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSearch(e);
      }
    },
    [handleSearch]
  );

  const toggleFoodSelection = useCallback((food: Food) => {
    setFoods(prevFoods => 
      prevFoods.map(f => 
        f.food_id === food.food_id 
          ? { ...f, selected: !f.selected } 
          : f
      )
    );
    
    setSelectedFoods(prevSelected => {
      const isAlreadySelected = prevSelected.some(
        selected => selected.food_id === food.food_id
      );
      
      if (isAlreadySelected) {
        return prevSelected.filter(
          selected => selected.food_id !== food.food_id
        );
      } else {
        return [...prevSelected, { ...food, selected: true }];
      }
    });
  }, []);

  const handleAddSelected = useCallback(
    async () => {
      if (selectedFoods.length === 0) {
        setError("Por favor selecciona al menos un alimento.");
        return;
      }

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

      setLoading(true);
      setError(null);

      try {
        for (const food of selectedFoods) {
          const requestBody = {
            email: user.email,
            food_id: food.food_id,
            food_name: food.food_name,
            food_description: food.food_description,
            type: normalizedType,
          };

          await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/foods/add`,
            requestBody
          );
        }

        addNotification(
          "Alimentos registrados",
          `Se han agregado ${selectedFoods.length} alimentos a tu registro de ${normalizedType.toLowerCase()}.`,
          "success",
          true,
          "comida"
        );

        await Swal.fire({
          title: "¡Éxito!",
          text: `${selectedFoods.length} alimento(s) agregado(s) correctamente.`,
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

        setSelectedFoods([]);
        setFoods(prevFoods => prevFoods.map(food => ({ ...food, selected: false })));
        setQuery("");
        setError(null);
        setHasSearched(false);
        
        // Obtener la fecha actual o usar la fecha de la URL
        const searchParams = new URLSearchParams(location.search);
        const currentDate = searchParams.get("date") || new Date().toISOString().split('T')[0];
        
        navigate(`/comidas?type=${normalizedType.toLowerCase()}&date=${currentDate}`, {
          state: { fromAddButton: true },
        });
      } catch (err) {
        const axiosError = err as AxiosError<{ error?: string }>;
        const errorMessage =
          axiosError.response?.data?.error || "Error al agregar los alimentos";
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
      } finally {
        setLoading(false);
      }
    },
    [selectedFoods, type, navigate, isDarkMode]
  );

  const handleAddFood = useCallback(
    async (food: Food) => {
      if (addingMultiple) {
        toggleFoodSelection(food);
        return;
      }

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

        setSelectedFoods([]);
        setFoods([]);
        setQuery("");
        setError(null);
        setHasSearched(false);
        
        const searchParams = new URLSearchParams(location.search);
        const currentDate = searchParams.get("date") || new Date().toISOString().split('T')[0];
        
        navigate(`/comidas?type=${normalizedType.toLowerCase()}&date=${currentDate}`, {
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
    [type, navigate, isDarkMode, addingMultiple, toggleFoodSelection]
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
      
      navigate("/food-quantity-adjust", { state: { food, type } });
    },
    [navigate, type, addNotification]
  );

  const toggleMultipleSelection = useCallback(() => {
    setAddingMultiple(prev => !prev);
    if (addingMultiple) {
      setSelectedFoods([]);
      setFoods(prevFoods => prevFoods.map(food => ({ ...food, selected: false })));
    }
  }, [addingMultiple]);

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
              <Link to="/comidas">
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
            
            {foods.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <button
                  onClick={toggleMultipleSelection}
                  className={`flex items-center py-2 px-3 sm:px-4 ${
                    addingMultiple 
                      ? "bg-[#38B2AC] text-white" 
                      : isDarkMode 
                        ? "bg-[#4B5563] text-white" 
                        : "bg-gray-200 text-gray-800"
                  } font-semibold rounded-full shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300`}
                >
                  {addingMultiple ? "Cancelar selección" : "Selección múltiple"}
                </button>
              </motion.div>
            )}
            
            {addingMultiple && selectedFoods.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <button
                  onClick={handleAddSelected}
                  className={`flex items-center py-2 px-3 sm:px-4 bg-gradient-to-r from-[#ff9404] to-[#FF6B35] text-white font-semibold rounded-full shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300`}
                >
                  <FaCheck className="mr-2 h-4 w-4" />
                  Agregar {selectedFoods.length} alimento(s)
                </button>
              </motion.div>
            )}
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
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3
                className={`text-lg sm:text-xl font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Resultados
              </h3>
              {selectedFoods.length > 0 && addingMultiple && (
                <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  {selectedFoods.length} seleccionado(s)
                </span>
              )}
            </div>
            <div
              className={`space-y-3 max-h-[50vh] overflow-y-auto ml-2 pr-2 [scrollbar-width:thin] scrollbar-thin ${
                isDarkMode
                  ? "scrollbar-track-[#2D3242] scrollbar-thumb-[#6B7280] hover:scrollbar-thumb-[#9CA3AF]"
                  : "scrollbar-track-gray-100 scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500"
              }`}
            >
              {foods.map((food) => (
                <div
                  key={food.food_id}
                  className={`p-3 rounded-lg border ${
                    food.selected
                      ? isDarkMode
                        ? "border-[#38B2AC] bg-[#2D3F3F]" 
                        : "border-[#38B2AC] bg-[#E6FFFA]"
                      : isDarkMode 
                        ? "border-gray-600 hover:bg-[#4B5563]" 
                        : "border-gray-300 hover:bg-gray-200"
                  } transition duration-200 flex items-center justify-between cursor-pointer`}
                  onClick={() => addingMultiple ? toggleFoodSelection(food) : handleFoodClick(food)}
                >
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {food.food_name}
                    </p>
                    <p className={`text-xs ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                      {food.food_description}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                      addingMultiple ? toggleFoodSelection(food) : handleAddFood(food);
                    }}
                    className={`${
                      food.selected
                        ? "text-[#38B2AC] hover:text-[#2C9490] active:text-[#1D6F6D]"
                        : isDarkMode
                          ? "text-gray-400 hover:text-[#FF6B35] active:text-[#ff9404]"
                          : "text-gray-600 hover:text-[#FF6B35] active:text-[#ff9404]"
                    } transition-all duration-200 transform hover:scale-125 active:scale-95 ml-3`}
                  >
                    {food.selected ? <FaCheck className="text-sm" /> : <FaPlus className="text-sm" />}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default React.memo(FoodSearch);
