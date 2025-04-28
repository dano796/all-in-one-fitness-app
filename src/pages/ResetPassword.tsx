// src/pages/ResetPassword.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Swal from "sweetalert2";
import { Eye, EyeOff } from "lucide-react";
import { FaCheck } from "react-icons/fa";
import { useTheme } from "./ThemeContext";
import "../index.css";

const ResetPassword = () => {
  const { isDarkMode } = useTheme();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  });
  const passwordContainerRef = useRef<HTMLDivElement>(null);
  const confirmPasswordContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const getHashParams = () => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    return {
      accessToken: params.get("access_token"),
      refreshToken: params.get("refresh_token"),
      type: params.get("type"),
    };
  };

  const validatePassword = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;
    return {
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
      isLongEnough,
      isValid: hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isLongEnough,
    };
  };

  useEffect(() => {
    const params = getHashParams();
    const { accessToken, type, refreshToken } = params;

    if (type !== "recovery" || !accessToken || !refreshToken) {
      setMessage("El enlace de recuperación es inválido o no contiene un token válido.");
      setIsLoading(false);
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
      return;
    }

    const verifyTokenAndSetSession = async () => {
      try {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          setMessage(`Error al verificar el enlace: ${error.message}`);
          setIsLoading(false);
          setTimeout(() => {
            navigate("/login", { replace: true });
          }, 2000);
          return;
        }

        if (data.user) {
          setMessage("Enlace verificado. Ingresa tu nueva contraseña.");
        } else {
          setMessage("No se pudo verificar el usuario asociado al token.");
          setTimeout(() => {
            navigate("/login", { replace: true });
          }, 2000);
        }
        setIsLoading(false);
      } catch (err) {
        setMessage("Ocurrió un error inesperado al verificar el enlace.");
        setIsLoading(false);
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);
      }
    };

    verifyTokenAndSetSession();
  }, [navigate]);

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");
    setErrors({ password: "", confirmPassword: "" });

    if (!password) {
      setErrors((prev) => ({ ...prev, password: "required" }));
      setIsLoading(false);
      return;
    } else if (!validatePassword(password).isValid) {
      setErrors((prev) => ({ ...prev, password: "La contraseña no cumple con los requisitos" }));
      setIsLoading(false);
      return;
    }

    if (!confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "required" }));
      setIsLoading(false);
      return;
    } else if (password !== confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "Las contraseñas no coinciden" }));
      setIsLoading(false);
      return;
    }

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        setMessage("No se pudo obtener la información del usuario.");
        setIsLoading(false);
        return;
      }

      const userEmail = userData.user.email;
      if (!userEmail) {
        setMessage("No se pudo obtener el correo del usuario.");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setMessage(`Error al actualizar la contraseña: ${error.message}`);
        setIsLoading(false);
        return;
      }

      const backendUrl = `${import.meta.env.VITE_BACKEND_URL}/api/update-password`;
      const response = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, newPassword: password }),
      });

      if (!response.ok) {
        let result;
        try {
          result = await response.json();
          setMessage(result.error || `Error al actualizar la contraseña en la base de datos (código ${response.status}).`);
        } catch (jsonErr) {
          setMessage(`Error del servidor al actualizar la contraseña (código ${response.status}).`);
        }
        setIsLoading(false);
        return;
      }

      await Swal.fire({
        title: "¡Éxito!",
        text: "Tu contraseña ha sido actualizada correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#ff9400",
        customClass: {
          popup: isDarkMode ? "custom-swal-background" : "custom-swal-background-light",
          icon: "custom-swal-icon",
          title: isDarkMode ? "custom-swal-title" : "custom-swal-title-light",
          htmlContainer: isDarkMode ? "custom-swal-text" : "custom-swal-text-light",
        },
      });

      await supabase.auth.signOut();
      navigate("/login", { replace: true });
    } catch (err) {
      setMessage(err.message || "Ocurrió un error inesperado al actualizar la contraseña.");
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleFocus = () => {
    if (!validatePassword(password).isValid) {
      setIsPasswordFocused(true);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (passwordContainerRef.current && e.relatedTarget instanceof Node && passwordContainerRef.current.contains(e.relatedTarget)) return;
    setIsPasswordFocused(false);
  };

  const handleConfirmPasswordBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (confirmPasswordContainerRef.current && e.relatedTarget instanceof Node && confirmPasswordContainerRef.current.contains(e.relatedTarget)) return;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setIsPasswordFocused(!validatePassword(newPassword).isValid);
  };

  return (
    <div className={`container mx-auto px-4 py-16 transition-colors duration-300 ${isDarkMode ? "bg-[#282c3c] text-white" : "bg-white-100 text-gray-900"}`}>
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Restablecer Contraseña
        </h1>

        {isLoading ? (
          <p className={`text-center ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Procesando enlace de recuperación...</p>
        ) : (
          <div className={`rounded-xl p-8 shadow-sm ${isDarkMode ? "bg-[#3B4252]" : "bg-white"}`}>
            {message && <p className={`text-center mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{message}</p>}
            {!message.includes("Error") &&
              !message.includes("inválido") &&
              !message.includes("verificar") && (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div>
                    <label
                      htmlFor="password"
                      className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
                    >
                      Nueva Contraseña
                    </label>
                    <div className="relative" ref={passwordContainerRef} onFocus={handleFocus} onBlur={handleBlur} tabIndex={-1}>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={password}
                        onChange={handlePasswordChange}
                        required
                        className={`w-full px-4 py-2 rounded-lg border pr-10 focus:ring-[1.5px] focus:ring-[#ff9404] focus:outline-none focus:border-0 transition-colors duration-300 ${
                          isDarkMode
                            ? `bg-[#282c3c] text-white ${errors.password ? "border-red-500" : "border-gray-600"}`
                            : `bg-white text-gray-900 ${errors.password ? "border-red-500" : "border-gray-300"}`
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        style={{ top: "50%", transform: "translateY(-50%)" }}
                      >
                        {showPassword ? (
                          <EyeOff size={20} className={`hover:text-[#ff9400] ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                        ) : (
                          <Eye size={20} className={`hover:text-[#ff9400] ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                        )}
                      </button>
                      <div
                        className={`absolute top-full left-0 mt-2 text-sm w-full transition-all duration-300 ease-in-out z-10 ${
                          isPasswordFocused ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
                        }`}
                      >
                        <ul className={`list-none pl-2 space-y-1 p-4 rounded-lg shadow-md ${isDarkMode ? "bg-[#3B4252]" : "bg-white"}`}>
                          <li className="flex items-center">
                            <span
                              className={`mr-2 inline-flex items-center justify-center w-3 h-3 rounded-full border ${isDarkMode ? "border-gray-500" : "border-gray-400"} ${
                                validatePassword(password).hasUpperCase ? isDarkMode ? "bg-gray-300 border-gray-300" : "bg-gray-200 border-gray-200" : "bg-transparent"
                              }`}
                            >
                              {validatePassword(password).hasUpperCase && <FaCheck className={`${isDarkMode ? "text-black" : "text-gray-900"} text-[8px]`} />}
                            </span>
                            <span className={validatePassword(password).hasUpperCase ? isDarkMode ? "text-gray-300" : "text-gray-700" : isDarkMode ? "text-gray-400" : "text-gray-500"}>Letra Mayúscula</span>
                          </li>
                          <li className="flex items-center">
                            <span
                              className={`mr-2 inline-flex items-center justify-center w-3 h-3 rounded-full border ${isDarkMode ? "border-gray-500" : "border-gray-400"} ${
                                validatePassword(password).hasLowerCase ? isDarkMode ? "bg-gray-300 border-gray-300" : "bg-gray-200 border-gray-200" : "bg-transparent"
                              }`}
                            >
                              {validatePassword(password).hasLowerCase && <FaCheck className={`${isDarkMode ? "text-black" : "text-gray-900"} text-[8px]`} />}
                            </span>
                            <span className={validatePassword(password).hasLowerCase ? isDarkMode ? "text-gray-300" : "text-gray-700" : isDarkMode ? "text-gray-400" : "text-gray-500"}>Letra Minúscula</span>
                          </li>
                          <li className="flex items-center">
                            <span
                              className={`mr-2 inline-flex items-center justify-center w-3 h-3 rounded-full border ${isDarkMode ? "border-gray-500" : "border-gray-400"} ${
                                validatePassword(password).hasNumber ? isDarkMode ? "bg-gray-300 border-gray-300" : "bg-gray-200 border-gray-200" : "bg-transparent"
                              }`}
                            >
                              {validatePassword(password).hasNumber && <FaCheck className={`${isDarkMode ? "text-black" : "text-gray-900"} text-[8px]`} />}
                            </span>
                            <span className={validatePassword(password).hasNumber ? isDarkMode ? "text-gray-300" : "text-gray-700" : isDarkMode ? "text-gray-400" : "text-gray-500"}>Número</span>
                          </li>
                          <li className="flex items-center">
                            <span
                              className={`mr-2 inline-flex items-center justify-center w-3 h-3 rounded-full border ${isDarkMode ? "border-gray-500" : "border-gray-400"} ${
                                validatePassword(password).hasSpecialChar ? isDarkMode ? "bg-gray-300 border-gray-300" : "bg-gray-200 border-gray-200" : "bg-transparent"
                              }`}
                            >
                              {validatePassword(password).hasSpecialChar && <FaCheck className={`${isDarkMode ? "text-black" : "text-gray-900"} text-[8px]`} />}
                            </span>
                            <span className={validatePassword(password).hasSpecialChar ? isDarkMode ? "text-gray-300" : "text-gray-700" : isDarkMode ? "text-gray-400" : "text-gray-500"}>Carácter Especial (e.g. !@#$%)</span>
                          </li>
                          <li className="flex items-center">
                            <span
                              className={`mr-2 inline-flex items-center justify-center w-3 h-3 rounded-full border ${isDarkMode ? "border-gray-500" : "border-gray-400"} ${
                                validatePassword(password).isLongEnough ? isDarkMode ? "bg-gray-300 border-gray-300" : "bg-gray-200 border-gray-200" : "bg-transparent"
                              }`}
                            >
                              {validatePassword(password).isLongEnough && <FaCheck className={`${isDarkMode ? "text-black" : "text-gray-900"} text-[8px]`} />}
                            </span>
                            <span className={validatePassword(password).isLongEnough ? isDarkMode ? "text-gray-300" : "text-gray-700" : isDarkMode ? "text-gray-400" : "text-gray-500"}>8 Caracteres o Más</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    {errors.password && errors.password !== "required" && (
                      <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
                    >
                      Confirmar Contraseña
                    </label>
                    <div className="relative" ref={confirmPasswordContainerRef} onBlur={handleConfirmPasswordBlur} tabIndex={-1}>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className={`w-full px-4 py-2 rounded-lg border pr-10 focus:ring-[1.5px] focus:ring-[#ff9404] focus:outline-none focus:border-0 transition-colors duration-300 ${
                          isDarkMode
                            ? `bg-[#282c3c] text-white ${errors.confirmPassword ? "border-red-500" : "border-gray-600"}`
                            : `bg-white text-gray-900 ${errors.confirmPassword ? "border-red-500" : "border-gray-300"}`
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        style={{ top: "50%", transform: "translateY(-50%)" }}
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={20} className={`hover:text-[#ff9400] ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                        ) : (
                          <Eye size={20} className={`hover:text-[#ff9400] ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && errors.confirmPassword !== "required" && (
                      <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-2 px-4 font-semibold rounded-lg text-white transition-all duration-300 ${
                      isDarkMode
                        ? `bg-[#ff9400] hover:bg-[#e68900] disabled:bg-gray-600`
                        : `bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400`
                    }`}
                  >
                    Actualizar Contraseña
                  </button>
                </form>
              )}
            <p className={`mt-4 text-center ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              ¿Volver al inicio de sesión?{" "}
              <a href="/login" className="text-[#ff9400] hover:underline">
                Inicia sesión aquí
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;