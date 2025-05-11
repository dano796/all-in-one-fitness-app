// src/pages/RegisteredFoods.tsx
import React, { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { supabase } from "../lib/supabaseClient";
import Swal from "sweetalert2";
import { FaArrowLeft, FaTrash, FaEdit } from "react-icons/fa";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useTheme } from "../pages/ThemeContext";
import { useNotificationStore } from "../store/notificationStore";

interface RegisteredFood {
  id_registro: string;
  id_comida: string;
  nombre_comida: string;
  descripcion: string;
  fecha: string;
  isEditable: boolean;
  tipo: string;
}

interface OrganizedFoods {
  Desayuno: RegisteredFood[];
  Almuerzo: RegisteredFood[];
  Merienda: RegisteredFood[];
  Cena: RegisteredFood[];
}

interface FoodsResponse {
  foods: OrganizedFoods;
  currentFoodType: keyof OrganizedFoods | null;
  isToday: boolean;
}

const RegisteredFoods: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { addNotification } = useNotificationStore();
  const TIMEZONE = "America/Bogota";
  const [date, setDate] = useState<string>(
    new Date().toLocaleDateString("en-CA", { timeZone: TIMEZONE })
  );
  const [foodsData, setFoodsData] = useState<FoodsResponse>({
    foods: { Desayuno: [], Almuerzo: [], Merienda: [], Cena: [] },
    currentFoodType: null,
    isToday: false,
  });
  const [userEmail, setUserEmail] = useState<string>("");
  const [selectedFood, setSelectedFood] = useState<{
    id_registro: string;
    index: number;
    type: keyof OrganizedFoods;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get("type")
    ? ((searchParams.get("type")!.charAt(0).toUpperCase() +
        searchParams
          .get("type")!
          .slice(1)
          .toLowerCase()) as keyof OrganizedFoods)
    : null;
  const dateParam = searchParams.get("date") || date;
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        setError("Debes iniciar sesión para ver las comidas registradas.");
      } else {
        setUserEmail(user.email || "");
      }
    };
    checkAuth();
  }, []);

  const fetchFoods = useCallback(async () => {
    if (!userEmail || !dateParam) return;
    try {
      const response = await axios.get<FoodsResponse>(
        `${import.meta.env.VITE_BACKEND_URL}/api/foods/user`,
        {
          params: { email: userEmail, date: dateParam },
        }
      );
      setFoodsData(response.data);
      setError(null);
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setError(
        axiosError.response?.data?.error ||
          "Error al consultar las comidas registradas"
      );
    }
  }, [userEmail, dateParam]);

  useEffect(() => {
    setDate(dateParam);
    if (userEmail && dateParam) fetchFoods();
  }, [userEmail, dateParam, fetchFoods]);

  const handleDeleteFood = async () => {
    if (!selectedFood) {
      setError("Por favor selecciona una comida para eliminar.");
      return;
    }
    try {
      const foodToDelete = foodsData.foods[selectedFood.type][selectedFood.index];
      const foodName = foodToDelete.nombre_comida;
      
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/foods/delete`,
        {
          data: { email: userEmail, id_registro: selectedFood.id_registro },
        }
      );
      
      addNotification(
        "Alimento eliminado",
        `Has eliminado ${foodName} de tu registro de ${selectedFood.type.toLowerCase()}.`,
        "success",
        true,
        "comida"
      );
      
      await Swal.fire({
        title: "¡Éxito!",
        text: "El alimento ha sido eliminado correctamente.",
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
      fetchFoods();
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      const errorMessage =
        axiosError.response?.data?.error || "Error al eliminar la comida";
      setError(errorMessage);
      
      addNotification(
        "Error al eliminar alimento",
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
        confirmButtonColor: "#ff9400",
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
    }
  };

  const handleEditFood = (food: RegisteredFood) => {
    if (!food.isEditable) return;
    
    navigate("/food-quantity-adjust", {
      state: { 
        food: {
          food_id: food.id_comida,
          food_name: food.nombre_comida,
          food_description: food.descripcion
        }, 
        type: food.tipo,
        isEdit: true,
        registryId: food.id_registro
      },
    });
  };

  const renderFoodSection = (type: keyof OrganizedFoods, label: string) => {
    if (!typeParam || typeParam !== type) return null;

    const foods = foodsData.foods[type] || [];

    return (
      <div
        className={`rounded-xl p-6 shadow-lg max-w-2xl mx-auto w-full transition-colors duration-300 ${
          isDarkMode ? "bg-[#2E3440]" : "bg-white"
        }`}
      >
        <h3
          className={`text-lg font-semibold mb-4 text-center ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {label}
        </h3>
        {foods.length > 0 ? (
          <div className="space-y-4 max-h-[20rem] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {foods.map((food, index) => (
              <div
                key={`${food.id_registro}-${index}`}
                className={`p-4 rounded-xl border transition duration-200 ${
                  selectedFood?.index === index && selectedFood.type === type
                    ? isDarkMode
                      ? "bg-[#4B5563]"
                      : "bg-gray-100"
                    : isDarkMode
                    ? "border-gray-600 hover:bg-[#4B5563]"
                    : "border-gray-300 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <input
                    type="radio"
                    name="registeredFoodSelection"
                    checked={
                      selectedFood?.index === index &&
                      selectedFood.type === type
                    }
                    onChange={() => {
                      setSelectedFood({
                        id_registro: food.id_registro,
                        index,
                        type,
                      });
                    }}
                    className={`w-5 h-5 focus:ring-[#FF6B35] ${
                      isDarkMode
                        ? "text-[#FF6B35]"
                        : "text-orange-500 focus:ring-orange-500"
                    }`}
                  />
                  <div className="flex-1">
                    <p
                      className={`text-md font-medium ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {food.nombre_comida}
                    </p>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {food.descripcion}
                    </p>
                  </div>
                  {food.isEditable && (
                    <button
                      onClick={() => handleEditFood(food)}
                      className={`p-2 rounded-full transition-colors duration-200 ${
                        isDarkMode 
                          ? "hover:bg-[#3B4252] text-gray-400 hover:text-[#FF6B35]" 
                          : "hover:bg-gray-100 text-gray-600 hover:text-orange-500"
                      }`}
                    >
                      <FaEdit className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p
            className={`text-center text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            No hay {label.toLowerCase()} registrados.
          </p>
        )}
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen p-6 flex flex-col items-center justify-start [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden transition-colors duration-300 ${
        isDarkMode ? "bg-[#282c3c]" : "bg-[#F8F9FA]"
      }`}
    >
      <div className="mb-6 w-full max-w-2xl">
        <Link to="/foodDashboard" className="inline-block">
          <button
            className={`flex items-center py-2 px-4 font-semibold rounded-full shadow-md transition-all duration-300 hover:-translate-y-1 z-10 ${
              isDarkMode
                ? "bg-gradient-to-r from-[#ff9404] to-[#FF6B35] text-white hover:shadow-lg hover:from-[#FF6B35] hover:to-[#ff9404]"
                : "bg-orange-500 text-white hover:bg-orange-600 hover:shadow-lg"
            }`}
          >
            <FaArrowLeft className="mr-1 text-base" />
            Volver
          </button>
        </Link>
      </div>

      <div className="mb-6 w-full max-w-2xl">
        <h2
          className={`text-md font-semibold text-center ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Comidas Registradas -{" "}
          {new Date(date + "T00:00:00").toLocaleDateString("es-ES", {
            timeZone: TIMEZONE,
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </h2>
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
      )}

      {typeParam && (
        <div className="w-full max-w-2xl">
          {renderFoodSection(typeParam, typeParam)}
        </div>
      )}
      {!typeParam && (
        <p
          className={`text-sm text-center ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Por favor selecciona un tipo de comida desde el dashboard.
        </p>
      )}

      {selectedFood && (
        <div className="mt-6 text-right w-full max-w-2xl sticky bottom-0 z-10">
          <button
            onClick={handleDeleteFood}
            className={`ml-auto flex items-center py-2 px-4 font-semibold rounded-full shadow-md transition-all duration-300 hover:-translate-y-1 z-10 ${
              isDarkMode
                ? "bg-gradient-to-r from-[#ff9404] to-[#FF6B35] text-white hover:shadow-lg hover:from-[#FF6B35] hover:to-[#ff9404]"
                : "bg-orange-500 text-white hover:bg-orange-600 hover:shadow-lg"
            }`}
          >
            <FaTrash className="mr-1 text-base" />
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(RegisteredFoods);
