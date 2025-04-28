// src/pages/LoginPage.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Eye, EyeOff } from "lucide-react";
import PasswordRecovery from "../components/PasswordRecovery";
import { supabase } from "../lib/supabaseClient";
import { useTheme } from "../pages/ThemeContext";

const LoginPage = () => {
  const { isDarkMode } = useTheme();
  const [input, setInput] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [recoveryModalOpen, setRecoveryModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.log(
            "Error al verificar la sesión (esperado si no hay sesión):",
            error.message
          );
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL + "/api/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input, password }),
        }
      );
      const result = await response.json();

      if (result.error) {
        await Swal.fire({
          title: "¡Error!",
          text: result.error,
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
      } else if (result.success) {
        await supabase.auth.setSession({
          access_token: result.token,
          refresh_token: "dummy-refresh-token",
        });
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          navigate("/Dashboard", { replace: true });
        }
        await Swal.fire({
          title: "¡Éxito!",
          text: "Sesión iniciada correctamente.",
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
      }
    } catch (err) {
      console.log("Error al iniciar sesión:", err);
      await Swal.fire({
        title: "¡Error!",
        text: "Ocurrió un error inesperado.",
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div
      className={`container mx-auto px-8 py-16 relative transition-colors duration-300 ${
        isDarkMode ? "bg-[#282c3c] text-white" : "bg-[#F8F9FA] text-[#212529]"
      }`}
    >
      {recoveryModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            e.stopPropagation();
            setRecoveryModalOpen(false);
          }}
        >
          <div
            className={`rounded-xl p-6 shadow-lg w-full max-w-md ${
              isDarkMode ? "bg-[#3B4252]" : "bg-[#F8F9FA]"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <PasswordRecovery onClose={() => setRecoveryModalOpen(false)} />
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto">
        <h1 className="text-5xl font-bold mb-8 pb-3 text-center">
          Iniciar Sesión
        </h1>

        <div
          className={`rounded-xl p-8 shadow-sm ${
            isDarkMode ? "bg-[#3B4252]" : "bg-[#E9ECEF]"
          }`}
        >
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="input"
                className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Usuario o Correo
              </label>
              <input
                type="text"
                id="input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                required
                className={`w-full px-4 py-2 border rounded-lg placeholder-gray-400 focus:ring-[1.5px] focus:ring-[#ff9404] focus:outline-none focus:border-0 transition-colors duration-300 ${
                  isDarkMode
                    ? "border-gray-600 bg-[#282c3c] text-white"
                    : "border-gray-300 bg-white text-gray-900"
                }`}
                placeholder="Usuario o tu@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`w-full px-4 py-2 border rounded-lg placeholder-gray-400 focus:ring-[1.5px] focus:ring-[#ff9404] focus:outline-none focus:border-0 transition-colors duration-300 ${
                    isDarkMode
                      ? "border-gray-600 bg-[#282c3c] text-white"
                      : "border-gray-300 bg-white text-gray-900"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className={`absolute inset-y-0 right-0 flex items-center pr-3 transition-colors duration-300 ${
                    isDarkMode
                      ? "text-gray-400 hover:text-[#ff9404]"
                      : "text-gray-500 hover:text-orange-500"
                  }`}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-2 px-4 font-semibold rounded-lg transition-colors duration-300 ${
                isDarkMode
                  ? "bg-[#ff9404] text-white hover:bg-[#ff9404] hover:text-[#282c3c]"
                  : "bg-orange-500 text-white hover:bg-orange-600 hover:text-white"
              }`}
            >
              Iniciar Sesión
            </button>
          </form>

          <div
            className={`mt-6 text-center text-sm space-y-2 ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <div>
              ¿No tienes una cuenta?{" "}
              <Link
                to="/registro"
                className={`font-medium transition-colors duration-300 ${
                  isDarkMode
                    ? "text-[#ff9404] hover:underline"
                    : "text-orange-500 hover:underline"
                }`}
              >
                Regístrate aquí
              </Link>
            </div>
            <div
              className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              o
            </div>
            <div>
              <button
                onClick={() => setRecoveryModalOpen(true)}
                className={`font-medium transition-colors duration-300 ${
                  isDarkMode
                    ? "text-[#ff9404] hover:underline"
                    : "text-orange-500 hover:underline"
                }`}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(LoginPage);
