import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Eye, EyeOff } from "lucide-react";
import { motion, useInView } from "framer-motion";
import PasswordRecovery from "../components/PasswordRecovery";
import { supabase } from "../lib/supabaseClient";
import { useTheme } from "../pages/ThemeContext";
import { offlineSyncManager } from "../utils/offlineSync";

const LoginPage = () => {
  const { isDarkMode } = useTheme();
  const [input, setInput] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [recoveryModalOpen, setRecoveryModalOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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
          navigate("/dashboard", { replace: true });
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
      // Primero, asegúrate de cerrar cualquier sesión existente
      await supabase.auth.signOut();
      
      // Limpiar datos de autenticación en caché
      await offlineSyncManager.clearAuthData();
      
      // Limpiar localStorage de tokens y sesiones
      localStorage.removeItem("supabase.auth.token");
      localStorage.removeItem("sb-access-token");
      localStorage.removeItem("sb-refresh-token");
      localStorage.removeItem("sb:token");
      localStorage.removeItem("sb:session");
      
      // Limpiar cookies relacionadas con autenticación
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // Pequeña pausa para asegurar que todo se haya limpiado
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL + "/api/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input, password }),
          // Evitar que el navegador use caché para esta solicitud
          cache: "no-store"
        }
      );
      const result = await response.json();

      if (result.error) {
        await Swal.fire({
          title: "¡Error!",
          text: result.error,
          icon: "error",
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
      } else if (result.success) {
        await supabase.auth.setSession({
          access_token: result.token,
          refresh_token: "dummy-refresh-token",
        });
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          navigate("/dashboard", { replace: true });
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
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8 }}
      className={`container mx-auto px-8 py-16 relative transition-colors duration-300 ${
        isDarkMode ? "bg-[#282c3c] text-white" : "bg-[#F8F9FA] text-[#212529]"
      }`}
    >
      {recoveryModalOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            e.stopPropagation();
            setRecoveryModalOpen(false);
          }}
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className={`rounded-xl p-6 shadow-lg w-full max-w-md ${
              isDarkMode ? "bg-[#3B4252]" : "bg-[#F8F9FA]"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <PasswordRecovery onClose={() => setRecoveryModalOpen(false)} />
          </motion.div>
        </motion.div>
      )}

      <div className="max-w-md mx-auto">
        <motion.h1
          initial={{ y: -30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: -30, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-5xl font-bold mb-8 pb-3 text-center"
        >
          Iniciar Sesión
        </motion.h1>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={
            isInView ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0 }
          }
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`rounded-xl p-8 shadow-sm ${
            isDarkMode ? "bg-[#3B4252]" : "bg-white"
          }`}
        >
          <form className="space-y-5" onSubmit={handleLogin}>
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={isInView ? { x: 0, opacity: 1 } : { x: -30, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
            >
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
            </motion.div>

            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={isInView ? { x: 0, opacity: 1 } : { x: -30, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
            >
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
                <motion.button
                  type="button"
                  onClick={togglePasswordVisibility}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  whileHover={{ scale: 1.1 }}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 transition-colors duration-300 text-gray-400 hover:text-[#ff9404]"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </motion.button>
              </div>
            </motion.div>

            <motion.button
              type="submit"
              initial={{ y: 20, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
              whileHover={{ scale: 1.025 }}
              whileTap={{ scale: 0.975 }}
              className="w-full py-2 px-4 font-semibold rounded-lg transition-colors duration-300 bg-[#ff9404] text-white hover:bg-[#ff9404] hover:text-[#282c3c]"
            >
              Iniciar Sesión
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
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
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default React.memo(LoginPage);
