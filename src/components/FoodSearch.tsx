import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { supabase } from "../lib/supabaseClient";
import Swal from "sweetalert2";
import { FaArrowLeft, FaPlus } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface Food {
  food_id: string;
  food_name: string;
  food_description: string;
}

const FoodSearch: React.FC = () => {
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
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setError("Debes iniciar sesión para buscar alimentos.");
      } else {
        setUserEmail(user.email || "");
      }
    };
    checkAuth();
  }, []);

  const handleSearch = async (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (!query.trim()) {
      setError("Por favor ingresa un término de búsqueda");
      return;
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      setError("Debes iniciar sesión para buscar alimentos.");
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await axios.get("http://localhost:5000/api/foods/search", {
        params: { query, max_results: 10 },
      });
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
            title: "custom-swal-title",
            htmlContainer: "custom-swal-text",
          },
        });
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setError(axiosError.response?.data?.error || "Error al buscar alimentos");
      await Swal.fire({
        title: "¡Error!",
        text: axiosError.response?.data?.error || "Ocurrió un error al buscar alimentos.",
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
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  const handleSelectFood = (food: Food) => {
    setSelectedFood(food);
  };

  const handleAddFood = async (food: Food) => {
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
      food_id: food.food_id,
      food_name: food.food_name,
      food_description: food.food_description,
      type: normalizedType,
    };

    try {
      const response = await axios.post("http://localhost:5000/api/foods/add", requestBody);

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

      setSelectedFood(null);
      setFoods([]);
      setQuery("");
      setError(null);
      setHasSearched(false);
      navigate(`/dashboard?type=${normalizedType}`, { state: { fromAddButton: true } });
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      const errorMessage = axiosError.response?.data?.error || "Error al agregar el alimento";
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
    }
  };

  const handleFoodClick = (food: Food) => {
    navigate("/food-quantity-adjust", { state: { food, type } });
  };

  return (
    <div className="mt-0">
      <div className="ml-0 mr-2 mt-0">
        <Link to="/dashboard" className="inline-block">
          <button className="flex items-center py-2 px-4 bg-gradient-to-r from-[#ff9404] to-[#FF6B35] text-white font-semibold rounded-full shadow-md hover:shadow-lg hover:from-[#FF6B35] hover:to-[#ff9404] transition-all duration-300 transform hover:-translate-y-1 z-10">
            <FaArrowLeft className="mr-1 text-base" />
            Volver
          </button>
        </Link>
      </div>

      <div className="bg-[#3B4252] rounded-lg p-4 shadow-md flex-1 mt-9">
        <h2 className="text-sm font-semibold mb-2">Buscar Alimentos</h2>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown} // Añadimos el evento onKeyDown
            placeholder="Ingresa un alimento (ejemplo: manzana)"
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-500 rounded-lg bg-[#1C2526] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className={`flex items-center py-2 px-4 bg-gradient-to-r from-[#ff9404] to-[#FF6B35] text-white font-semibold rounded-full shadow-md hover:shadow-lg hover:from-[#FF6B35] hover:to-[#ff9404] transition-all duration-300 transform hover:-translate-y-1 z-10 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>
        {error && <p className="text-red-400 mt-2 text-xs">{error}</p>}

        {foods.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold mb-2">Resultados</h3>
            <div className="space-y-3 max-h-[calc(8*4.5rem)] overflow-y-auto scrollbar-hide">
              {foods.map((food) => (
                <div
                  key={food.food_id}
                  className="p-3 rounded-lg border border-gray-600 hover:bg-[#4B5563] transition duration-200 flex items-center justify-between cursor-pointer"
                  onClick={() => handleFoodClick(food)}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{food.food_name}</p>
                    <p className="text-xs text-gray-300">{food.food_description}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectFood(food);
                      handleAddFood(food);
                    }}
                    className="text-gray-400 hover:text-[#FF6B35] active:text-[#ff9404] transition-all duration-200 transform hover:scale-125 active:scale-95 ml-3"
                  >
                    <FaPlus className="text-sm" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {!loading && hasSearched && foods.length === 0 && !error && (
          <p className="text-gray-300 text-center text-xs mt-2">No se encontraron resultados</p>
        )}
      </div>
    </div>
  );
};

export default FoodSearch;