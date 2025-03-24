import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { supabase } from "../lib/supabaseClient";
import Swal from "sweetalert2";
import { FaArrowLeft, FaTrash } from "react-icons/fa";
import { Link, useSearchParams } from "react-router-dom";

interface RegisteredFood {
  id_registro: string;
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
  };

  useEffect(() => {
    setDate(dateParam);
    if (userEmail && dateParam) fetchFoods();
  }, [userEmail, dateParam]);

  const handleDeleteFood = async () => {
    if (!selectedFood) {
      setError("Por favor selecciona una comida para eliminar.");
      return;
    }
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/foods/delete`,
        {
          data: { email: userEmail, id_registro: selectedFood.id_registro },
        }
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
      setSelectedFood(null);
      fetchFoods();
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      const errorMessage =
        axiosError.response?.data?.error || "Error al eliminar la comida";
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

  const renderFoodSection = (type: keyof OrganizedFoods, label: string) => {
    if (!typeParam || typeParam !== type) return null;

    const foods = foodsData.foods[type] || [];

    return (
      <div className="bg-[#2E3440] rounded-xl p-6 shadow-lg max-w-2xl mx-auto w-full">
        <h3 className="text-lg font-semibold mb-4 text-center text-white">
          {label}
        </h3>
        {foods.length > 0 ? (
          <div className="space-y-4 max-h-[calc(5*5rem)] overflow-y-auto no-scrollbar">
            {foods.map((food, index) => (
              <div
                key={`${food.id_registro}-${index}`}
                className={`p-4 rounded-xl border border-gray-600 ${
                  selectedFood?.index === index && selectedFood.type === type
                    ? "bg-[#4B5563]"
                    : "hover:bg-[#4B5563]"
                } transition duration-200`}
              >
                <div className="flex items-center space-x-4">
                  <input
                    type="radio"
                    name="registeredFoodSelection"
                    checked={
                      selectedFood?.index === index && selectedFood.type === type
                    }
                    onChange={() => {
                      setSelectedFood({
                        id_registro: food.id_registro,
                        index,
                        type,
                      });
                    }}
                    className="w-5 h-5 text-[#FF6B35]"
                  />
                  <div className="flex-1">
                    <p className="text-md font-medium text-white">
                      {food.nombre_comida}
                    </p>
                    <p className="text-sm text-gray-300">{food.descripcion}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center text-sm">
            No hay {label.toLowerCase()} registrados.
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="registered-foods-container min-h-screen bg-[#282c3c] p-6 flex flex-col items-center justify-start">
      <style>
        {`
          html, body {
            -ms-overflow-style: none;
            scrollbar-width: none;
            overflow-y: auto;
          }
          html::-webkit-scrollbar, body::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .registered-foods-container {
            overflow-y: auto;
          }
        `}
      </style>

      <div className="mb-6 w-full max-w-2xl">
        <Link to="/dashboard" className="inline-block">
          <button className="flex items-center py-2 px-4 bg-gradient-to-r from-[#ff9404] to-[#FF6B35] text-white font-semibold rounded-full shadow-md hover:shadow-lg hover:from-[#FF6B35] hover:to-[#ff9404] transition-all duration-300 transform hover:-translate-y-1 z-10">
            <FaArrowLeft className="mr-1 text-base" />
            Volver
          </button>
        </Link>
      </div>

      <div className="mb-6 w-full max-w-2xl">
        <h2 className="text-md font-semibold text-white text-center">
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
        <p className="text-gray-400 text-sm text-center">
          Por favor selecciona un tipo de comida desde el dashboard.
        </p>
      )}

      {selectedFood && (
        <div className="mt-6 text-right w-full max-w-2xl sticky bottom-0 z-10">
          <button
            onClick={handleDeleteFood}
            className="ml-auto flex items-center py-2 px-4 bg-gradient-to-r from-[#ff9404] to-[#FF6B35] text-white font-semibold rounded-full shadow-md hover:shadow-lg hover:from-[#FF6B35] hover:to-[#ff9404] transition-all duration-300 transform hover:-translate-y-1 z-10"
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