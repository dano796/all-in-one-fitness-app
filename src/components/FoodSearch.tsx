import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { supabase } from "../lib/supabaseClient";
import Swal from "sweetalert2";

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

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setError("Debes iniciar sesión para buscar alimentos.");
      }
    };
    checkAuth();
  }, []);

  const handleSearch = async (e: React.MouseEvent<HTMLButtonElement>) => {
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

  const handleSelectFood = (food: Food) => {
    setSelectedFood(food);
  };

  const handleAddFood = async () => {
    if (!selectedFood) {
      setError("Por favor selecciona un alimento.");
      return;
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      setError("Debes iniciar sesión para agregar alimentos.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/foods/add", {
        email: user.email,
        food_id: selectedFood.food_id,
        food_name: selectedFood.food_name,
        food_description: selectedFood.food_description,
      });

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

  return (
    <div className="space-y-6">
      <div className="bg-[#3B4252] rounded-lg p-6 shadow-md">
        <h2 className="text-sm font-semibold mb-4">Search for Foods</h2>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ingresa un alimento (ejemplo: manzana)"
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-500 rounded-lg bg-[#1C2526] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className={`py-2 px-4 bg-[#ff9404] text-white font-semibold rounded-lg ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:text-[#1C1C1E]"
            } transition duration-300`}
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>
        {error && <p className="text-red-400 mt-4 text-xs">{error}</p>}
      </div>

      {foods.length > 0 && (
        <div className="bg-[#3B4252] rounded-lg p-6 shadow-md">
          <h2 className="text-sm font-semibold mb-4">Resultados</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#4B5563]">
                  <th className="p-3 text-sm font-semibold">Seleccionar</th>
                  <th className="p-3 text-sm font-semibold">Nombre del Alimento</th>
                  <th className="p-3 text-sm font-semibold">Descripción</th>
                </tr>
              </thead>
              <tbody>
                {foods.map((food) => (
                  <tr
                    key={food.food_id}
                    className={`border-b border-gray-600 ${
                      selectedFood?.food_id === food.food_id ? "bg-[#4B5563]" : "hover:bg-[#4B5563]"
                    }`}
                  >
                    <td className="p-3">
                      <input
                        type="radio"
                        name="foodSelection"
                        checked={selectedFood?.food_id === food.food_id}
                        onChange={() => handleSelectFood(food)}
                        className="w-4 h-4 text-[#FF6B35]"
                      />
                    </td>
                    <td className="p-3 text-sm font-medium">{food.food_name}</td>
                    <td className="p-3 text-xs text-gray-300">{food.food_description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 text-right">
            <button
              onClick={handleAddFood}
              disabled={!selectedFood}
              className={`py-2 px-4 bg-[#ff9404] text-white font-semibold rounded-lg ${
                selectedFood ? "hover:text-[#1C1C1E]" : "opacity-50 cursor-not-allowed"
              } transition duration-300`}
            >
              Agregar Alimento
            </button>
          </div>
        </div>
      )}
      {!loading && hasSearched && foods.length === 0 && !error && (
        <p className="text-gray-300 text-center text-xs">No se encontraron resultados</p>
      )}
    </div>
  );
};

export default FoodSearch;