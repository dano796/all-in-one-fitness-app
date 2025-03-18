import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { supabase } from "../lib/supabaseClient";
import Swal from "sweetalert2";
import { FaPlus, FaArrowLeft, FaArrowRight, FaTrash } from "react-icons/fa";

// Interfaces actualizadas
interface RegisteredFood {
  id_comida: string;
  nombre_comida: string;
  descripcion: string;
  fecha: string;
  isEditable: boolean;
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
    id_comida: string;
    index: number;
    type: keyof OrganizedFoods;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const fetchFoods = async () => {
    if (!userEmail || !date) return;
    try {
      const response = await axios.get<FoodsResponse>(
        "http://localhost:5000/api/foods/user",
        {
          params: { email: userEmail, date },
        }
      );
      setFoodsData(response.data);
      setError(null);
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setError(
        axiosError.response?.data?.error || "Error al consultar las comidas registradas"
      );
    }
  };

  useEffect(() => {
    if (userEmail && date) fetchFoods();
  }, [userEmail, date]);

  const handlePreviousDay = () => {
    const currentDate = new Date(date + "T00:00:00");
    currentDate.setDate(currentDate.getDate() - 1);
    setDate(currentDate.toLocaleDateString("en-CA", { timeZone: TIMEZONE }));
    setSelectedFood(null);
    setError(null);
  };

  const handleNextDay = () => {
    const currentDate = new Date(date + "T00:00:00");
    currentDate.setDate(currentDate.getDate() + 1);
    setDate(currentDate.toLocaleDateString("en-CA", { timeZone: TIMEZONE }));
    setSelectedFood(null);
    setError(null);
  };

  const handleDeleteFood = async () => {
    if (!selectedFood) {
      setError("Por favor selecciona una comida para eliminar.");
      return;
    }
    try {
      const response = await axios.delete("http://localhost:5000/api/foods/delete", {
        data: { email: userEmail, food_id: selectedFood.id_comida },
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
      fetchFoods();
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      const errorMessage = axiosError.response?.data?.error || "Error al eliminar la comida";
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

  const handleAddFood = (type: keyof OrganizedFoods) => {
    window.location.href = `/foodsearch?type=${type}`;
  };

  const renderFoodSection = (type: keyof OrganizedFoods, label: string) => {
    const foods = foodsData.foods[type];
    return (
      <div className="bg-[#2E3440] rounded-lg p-4 shadow-md">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">{label}</h3>
          {foodsData.currentFoodType === type && (
            <button
              onClick={() => handleAddFood(type)}
              className="flex items-center py-1 px-2 bg-gradient-to-r from-[#ff9404] to-[#FF6B35] text-white font-semibold rounded-full shadow-md hover:shadow-lg hover:from-[#FF6B35] hover:to-[#ff9404] transition-all duration-300 transform hover:-translate-y-1 z-10"
            >
              <FaPlus className="text-base" />
            </button>
          )}
        </div>
        {foods.length > 0 ? (
          <div className="space-y-2 max-h-[calc(5*4rem)] overflow-y-auto no-scrollbar">
            {foods.map((food, index) => (
              <div
                key={`${food.id_comida}-${index}`}
                className={`p-2 rounded-lg border border-gray-600 ${
                  selectedFood?.index === index && selectedFood.type === type
                    ? "bg-[#4B5563]"
                    : "hover:bg-[#4B5563]"
                } transition duration-200`}
              >
                <div className="flex items-center space-x-2">
                  {food.isEditable && (
                    <input
                      type="radio"
                      name="registeredFoodSelection"
                      checked={selectedFood?.index === index && selectedFood.type === type}
                      onChange={() =>
                        setSelectedFood({ id_comida: food.id_comida, index, type })
                      }
                      className="w-4 h-4 text-[#FF6B35]"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{food.nombre_comida}</p>
                    <p className="text-xs text-gray-300">{food.descripcion}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-xs">No hay {label.toLowerCase()} registrados.</p>
        )}
      </div>
    );
  };

  return (
    <div className="registered-foods-container" style={{ height: "calc(100vh - 4rem)", overflow: "hidden" }}>
      <style>
        {`
          /* Ocultar scrollbar globalmente */
          html, body {
            -ms-overflow-style: none; /* IE y Edge */
            scrollbar-width: none; /* Firefox */
            overflow-y: hidden; /* Evita scroll en el body */
          }
          html::-webkit-scrollbar, body::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
          }

          /* Clase para ocultar scrollbar en contenedores específicos */
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none; /* IE y Edge */
            scrollbar-width: none; /* Firefox */
          }

          /* Asegurar que el contenedor principal no genere scroll */
          .registered-foods-container {
            overflow: hidden;
          }
        `}
      </style>
      <div className="flex justify-between items-center mb-4 p-4">
        <h2 className="text-sm font-semibold">
          Comidas Registradas -{" "}
          {new Date(date + "T00:00:00").toLocaleDateString("es-ES", {
            timeZone: TIMEZONE,
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePreviousDay}
            className="flex items-center py-2 px-4 bg-gradient-to-r from-[#ff9404] to-[#FF6B35] text-white font-semibold rounded-full shadow-md hover:shadow-lg hover:from-[#FF6B35] hover:to-[#ff9404] transition-all duration-300 transform hover:-translate-y-1 z-10"
          >
            <FaArrowLeft className="text-base" />
          </button>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2 border border-gray-500 rounded-lg bg-[#1C2526] text-white focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
          />
          <button
            onClick={handleNextDay}
            className="flex items-center py-2 px-4 bg-gradient-to-r from-[#ff9404] to-[#FF6B35] text-white font-semibold rounded-full shadow-md hover:shadow-lg hover:from-[#FF6B35] hover:to-[#ff9404] transition-all duration-300 transform hover:-translate-y-1 z-10"
          >
            <FaArrowRight className="text-base" />
          </button>
        </div>
      </div>

      {error && <p className="text-red-400 text-xs mb-2 p-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {renderFoodSection("Desayuno", "Desayuno")}
        {renderFoodSection("Almuerzo", "Almuerzo")}
        {renderFoodSection("Merienda", "Merienda")}
        {renderFoodSection("Cena", "Cena")}
      </div>

      {selectedFood && (
        <div className="mt-4 text-right p-4">
          <button
            onClick={handleDeleteFood}
            disabled={!foodsData.isToday}
            className={`ml-auto flex items-center py-2 px-4 bg-gradient-to-r from-[#ff9404] to-[#FF6B35] text-white font-semibold rounded-full shadow-md hover:shadow-lg hover:from-[#FF6B35] hover:to-[#ff9404] transition-all duration-300 transform hover:-translate-y-1 z-10 ${
              !foodsData.isToday ? "opacity-50 cursor-not-allowed" : ""
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

export default RegisteredFoods;