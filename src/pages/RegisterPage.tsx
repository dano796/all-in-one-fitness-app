import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";
import { supabase } from "../lib/supabaseClient";

const RegisterPage = () => {
  const [usuario, setUsuario] = useState("");
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [contador, setContador] = useState(60);
  const [puedeReenviar, setPuedeReenviar] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (!puedeReenviar && contador > 0) {
      timer = setTimeout(() => setContador(contador - 1), 1000);
    } else {
      setPuedeReenviar(true);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [contador, puedeReenviar]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
          console.log("Error al verificar la sesión (esperado si no hay sesión):", error.message);
          return;
        }

        if (user) {
          navigate("/Dashboard", { replace: true });
        }
      } catch (err) {
        console.error("Excepción al verificar la sesión:", err);
      }
    };

    checkSession();
  }, [navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (contraseña !== confirmarContraseña) {
      await Swal.fire({
        title: "¡Error!",
        text: "Las contraseñas no coinciden.",
        icon: "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#ff9400",
        customClass: {
          popup: "custom-swal-background",
          title: "custom-swal-title",
          htmlContainer: "custom-swal-text",
        },
      });
      return;
    }

    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, correo, contraseña }),
      });
      const result = await response.json();

      if (result.error) {
        await Swal.fire({
          title: "¡Error!",
          text: result.error,
          icon: "error",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#ff9400",
          customClass: {
            popup: "custom-swal-background",
            title: "custom-swal-title",
            htmlContainer: "custom-swal-text",
          },
        });
      } else {
        await Swal.fire({
          title: "¡Éxito!",
          text: result.success || "Registro exitoso.",
          icon: "success",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#ff9400",
          customClass: {
            popup: "custom-swal-background",
            icon: "custom-swal-icon",
            title: "custom-swal-title",
            htmlContainer: "custom-swal-text",
          },
        });
        setContador(60);
        setPuedeReenviar(false);
        setUsuario("");
        setCorreo("");
        setContraseña("");
        setConfirmarContraseña("");
        // Verificar sesión después del registro (opcional, dependiendo del flujo)
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          navigate("/Dashboard", { replace: true });
        }
      }
    } catch (err) {
      console.error("Error durante el registro:", err);
      await Swal.fire({
        title: "¡Error!",
        text: "Ocurrió un error inesperado.",
        icon: "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#ff9400",
      });
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <div className="container mx-auto px-4 py-16 bg-[#282c3c] text-white">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold mb-8 pb-3 text-center">Crear Cuenta</h1>

        <div className="bg-[#3B4252] rounded-xl p-8 shadow-sm">
          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="NombreUsuario"
                className="w-full px-4 py-2 bg-[#282c3c] text-white border border-gray-600 rounded-lg"
                required
              />
            </div>
            <div>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="example@email.com"
                className="w-full px-4 py-2 bg-[#282c3c] text-white border border-gray-600 rounded-lg"
                required
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-[#282c3c] text-white border border-gray-600 rounded-lg"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-[#ff9404]"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmarContraseña}
                onChange={(e) => setConfirmarContraseña(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-[#282c3c] text-white border border-gray-600 rounded-lg"
                required
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-[#ff9404]"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-[#ff9404] text-white font-semibold rounded-lg hover:bg-[#ff9404]"
            >
              Crear Cuenta
            </button>
          </form>
          <p className="mt-4 text-center text-gray-400">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="text-[#ff9404] hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;