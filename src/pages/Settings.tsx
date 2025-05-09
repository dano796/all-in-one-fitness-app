import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings as SettingsIcon,
  User,
  Lock,
  Bell,
  Moon,
  Sun,
  Globe,
  Dumbbell,
  CreditCard,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import GalaxyBackground from "../components/GalaxyBackground";
import { motion } from "framer-motion";
import { useTheme } from "../pages/ThemeContext";
import axios from "axios";

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [notifications, setNotifications] = useState<boolean>(true);
  const [measurementUnit, setMeasurementUnit] = useState<"metric" | "imperial">(
    "metric"
  );
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        setErrorMsg("Debes iniciar sesión para acceder a los ajustes.");
        navigate("/login");
      } else {
        setUserEmail(user.email || "");
        fetchUserSettings(user.email || "");
        fetchSubscription(user.email || "");
      }
    };

    checkAuth();
  }, [navigate]);

  const fetchUserSettings = async (email: string) => {
    try {
      setIsLoading(true);
      const { data: userData, error: userError } = await supabase
        .from("Inicio Sesion")
        .select("Usuario")
        .eq("Correo", email)
        .single();

      if (userError) {
        console.error("Error fetching user data:", userError);
        setErrorMsg("Error al cargar los datos de usuario.");
        return;
      }

      setUserName(userData?.Usuario || "");
    } catch (err) {
      console.error("Error fetching user settings:", err);
      setErrorMsg("Error al cargar los ajustes de usuario.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubscription = async (email: string) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/get-user-subscription`, {
        params: { email },
      });

      const data = response.data;
      setHasSubscription(data.Suscripcion);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setHasSubscription(null);
      setErrorMsg("Error al cargar el estado de la suscripción.");
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);

      const { data: userData, error: userError } = await supabase
        .from("Inicio Sesion")
        .select("Usuario")
        .eq("Correo", userEmail)
        .single();

      if (userError) {
        console.error("Error fetching user data:", userError);
        setErrorMsg("Error al verificar los datos de usuario.");
        return;
      }

      if (userData && userData.Usuario !== userName.toLowerCase()) {
        const { error: updateError } = await supabase
          .from("Inicio Sesion")
          .update({ Usuario: userName.toLowerCase() })
          .eq("Correo", userEmail);

        if (updateError) {
          console.error("Error updating username:", updateError);
          setErrorMsg("Error al actualizar el nombre de usuario.");
          return;
        }
      }

      setSuccessMsg("¡Ajustes guardados correctamente!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
      setErrorMsg("Error al guardar los ajustes.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = () => {
    navigate("/reset-password");
  };

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-[#282c3c] text-white" : "bg-[#F8F9FA] text-[#212529]"
      } relative overflow-hidden transition-colors duration-300`}
    >
      <GalaxyBackground />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <header className="mb-8 text-center">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 ${
                isDarkMode ? "bg-[#3B4252]" : "bg-white"
              } rounded-full mb-4 shadow-lg`}
            >
              <SettingsIcon className="h-8 w-8 text-[#ff9404]" />
            </div>
            <h1 className="text-3xl font-bold">Ajustes</h1>
            <p
              className={`${
                isDarkMode ? "text-gray-400" : "text-[#6C757D]"
              } mt-2`}
            >
              Personaliza tu experiencia en All In One Fitness
            </p>
          </header>

          {errorMsg && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-lg mb-6">
              {successMsg}
            </div>
          )}

          <div
            className={`rounded-xl shadow-md overflow-hidden ${
              isDarkMode ? "bg-[#3B4252]" : "bg-white"
            }`}
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <User className="h-5 w-5 mr-2 text-[#ff9404]" />
                Perfil de Usuario
              </h2>

              <div className="space-y-4 mb-8">
                <div>
                  <label
                    htmlFor="email"
                    className={`block text-sm font-medium ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    } mb-1`}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={userEmail}
                    disabled
                    className={`w-full px-3 py-2 text-sm border ${
                      isDarkMode
                        ? "border-gray-500 bg-[#2D3242] text-gray-400"
                        : "border-gray-300 bg-[#F8F9FA] text-[#6C757D]"
                    } rounded-md cursor-not-allowed`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="name"
                    className={`block text-sm font-medium ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    } mb-1`}
                  >
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className={`w-full px-3 py-2 text-sm border ${
                      isDarkMode
                        ? "border-gray-500 bg-[#2D3242] text-gray-200"
                        : "border-gray-300 bg-white focus:bg-[#F8F9FA] text-[#212529]"
                    } rounded-md focus:outline-none focus:border-[#ff9404] focus:ring-2 focus:ring-[#ff9404]/20`}
                    placeholder="Tu nombre"
                  />
                </div>

                <div>
                  <button
                    onClick={handleChangePassword}
                    className="flex items-center text-[#ff9404] hover:text-[#e08503] transition-colors"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    <span>Cambiar contraseña</span>
                  </button>
                </div>
              </div>

              <hr
                className={`my-6 ${
                  isDarkMode ? "border-gray-600" : "border-gray-200"
                }`}
              />

              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <Dumbbell className="h-5 w-5 mr-2 text-[#ff9404]" />
                Preferencias de Entrenamiento
              </h2>

              <div className="space-y-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 mr-3 text-[#ff9404]" />
                    <div>
                      <p className="font-medium">Unidades de medida</p>
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Sistema métrico o imperial
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <select
                      value={measurementUnit}
                      onChange={(e) =>
                        setMeasurementUnit(
                          e.target.value as "metric" | "imperial"
                        )
                      }
                      className={`w-full px-3 py-1.5 text-sm border ${
                        isDarkMode
                          ? "border-gray-500 bg-[#2D3242] text-gray-200"
                          : "border-gray-300 bg-white focus:bg-[#F8F9FA] text-[#212529]"
                      } rounded-md focus:outline-none focus:border-[#ff9404] focus:ring-2 focus:ring-[#ff9404]/20 appearance-none pr-8`}
                    >
                      <option value="metric">Métrico (kg, cm)</option>
                      <option value="imperial">Imperial (lb, inch)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                      <svg
                        className="h-4 w-4 fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <hr
                className={`my-6 ${
                  isDarkMode ? "border-gray-600" : "border-gray-200"
                }`}
              />

              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <Bell className="h-5 w-5 mr-2 text-[#ff9404]" />
                Notificaciones y Apariencia
              </h2>

              <div className="space-y-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell
                      className={`h-5 w-5 mr-3 ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    />
                    <div>
                      <p className="font-medium">Notificaciones</p>
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Recordatorios y alertas
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notifications}
                      onChange={() => setNotifications(!notifications)}
                    />
                    <div
                      className={`w-11 h-6 ${
                        isDarkMode ? "bg-gray-600" : "bg-gray-300"
                      } peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#ff9404]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff9404]`}
                    ></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {isDarkMode ? (
                      <Moon
                        className={`h-5 w-5 mr-3 ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      />
                    ) : (
                      <Sun
                        className={`h-5 w-5 mr-3 ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      />
                    )}
                    <div>
                      <p className="font-medium">Modo oscuro</p>
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Apariencia de la aplicación
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={isDarkMode}
                      onChange={toggleDarkMode}
                    />
                    <div
                      className={`w-11 h-6 ${
                        isDarkMode ? "bg-gray-600" : "bg-gray-300"
                      } peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#ff9404]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff9404]`}
                    ></div>
                  </label>
                </div>
              </div>

              <hr
                className={`my-6 ${
                  isDarkMode ? "border-gray-600" : "border-gray-200"
                }`}
              />

              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-[#ff9404]" />
                Mi Suscripción
              </h2>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-3 text-[#ff9404]" />
                  <div>
                    <p className="font-medium">Mi plan</p>
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {hasSubscription === null
                        ? "Cargando..."
                        : hasSubscription
                        ? "Premium"
                        : "Gratuito"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/subscription-plans")}
                  className="px-4 py-1.5 bg-[#ff9404] text-white rounded-md hover:bg-[#e08503] transition-colors duration-300"
                >
                  Mejorar
                </button>
              </div>
            </div>

            <div
              className={`px-6 py-4 ${
                isDarkMode ? "bg-[#2D3242]" : "bg-[#F8F9FA]"
              }`}
            >
              <button
                onClick={handleSaveSettings}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-gradient-to-br from-[#ff9404] to-[#e08503] text-white border-none rounded-md hover:bg-gradient-to-br hover:from-[#e08503] hover:to-[#ff9404] hover:shadow-[0_0_10px_rgba(255,148,4,0.5)] transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed font-medium flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  "Guardar ajustes"
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default React.memo(Settings);