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
        title: "\!Error!",
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

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        throw new Error(error.message);
      }
    } catch (err) {
      console.error("Error al iniciar sesión con Google:", err);
      await Swal.fire({
        title: "¡Error!",
        text: "No se pudo iniciar sesión con Google.",
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
                  className="absolute inset-y-0 right-0 flex items-center pr-3 transition-colors duration-300 text-gray-400 hover:text-[#ff9404]"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 font-semibold rounded-lg transition-colors duration-300 bg-[#ff9404] text-white hover:bg-[#ff9404] hover:text-[#282c3c]"
            >
              Iniciar Sesión
            </button>
          </form>

          <button
            onClick={handleGoogleLogin}
            className="w-full mt-4 py-2 px-4 font-semibold rounded-lg transition-colors duration-300 bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.28-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
            Continuar con Google
          </button>

          <div
            className={`mt-6 text-center text-sm space-y-2 ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <div>
              ¿No tienes una cuenta?{" "}
              <Link
                to="/registro"
                className="font-medium transition-colors duration-300 text-[#ff9404] hover:underline"
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
                className="font-medium transition-colors duration-300 text-[#ff9404] hover:underline"
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