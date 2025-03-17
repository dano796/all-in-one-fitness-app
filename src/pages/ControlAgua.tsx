import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import Swal from "sweetalert2";
import { supabase } from "../lib/supabaseClient";

const WaterBottleForm: React.FC = () => {
  const [capacity, setCapacity] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddBottle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (capacity <= 0) {
      setError("Por favor ingresa una capacidad válida.");
      return;
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      setError("Debes iniciar sesión para agregar una botella.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("http://localhost:5000/api/water/add-bottle", {
        email: user.email,
        capacity,
      });

      await Swal.fire({
        title: "¡Éxito!",
        text: response.data.message || "Botella agregada con éxito.",
        icon: "success",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#ff9404",
        customClass: {
          popup: "custom-swal-background",
          title: "custom-swal-title",
          htmlContainer: "custom-swal-text",
        },
      });

      setCapacity(0);
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      const errorMessage = axiosError.response?.data?.error || "Error al agregar la botella";
      setError(errorMessage);
      await Swal.fire({
        title: "¡Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#ff9400",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#3B4252] rounded-lg p-6 shadow-md">
      <h2 className="text-sm font-semibold mb-4">Agregar Botella de Agua</h2>
      <form onSubmit={handleAddBottle} className="space-y-4">
        <div className="flex items-center space-x-4">
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            placeholder="Capacidad en ml (ej. 500)"
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-500 rounded-lg bg-[#1C2526] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className={`py-2 px-4 bg-[#ff9404] text-white font-semibold rounded-lg ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:text-[#1C1C1E]"
            } transition duration-300`}
          >
            {loading ? "Agregando..." : "Agregar"}
          </button>
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
      </form>
    </div>
  );
};

export default WaterBottleForm;