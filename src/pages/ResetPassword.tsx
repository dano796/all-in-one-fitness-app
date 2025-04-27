import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Swal from "sweetalert2";
import { Eye, EyeOff } from "lucide-react";
import { FaCheck } from "react-icons/fa";
import "../index.css";

const ResetPassword = () => {
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
  const passwordContainerRef = useRef(null);
  const confirmPasswordContainerRef = useRef(null);
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

  const validatePassword = (password) => {
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

  const handleResetPassword = async (event) => {
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

      const result = await response.json();

      await Swal.fire({
        title: "¡Éxito!",
        text: "Tu contraseña ha sido actualizada correctamente.",
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

      await supabase.auth.signOut();
      navigate("/login", { replace: true });
    } catch (err) {
      setMessage(err.message || "Ocurrió un error inesperado al actualizar la contraseña.");
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (e) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = (e) => {
    e.preventDefault();
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleFocus = () => {
    if (!validatePassword(password).isValid) {
      setIsPasswordFocused(true);
    }
  };

  const handleBlur = (e) => {
    if (passwordContainerRef.current && e.relatedTarget instanceof Node && passwordContainerRef.current.contains(e.relatedTarget)) return;
    setIsPasswordFocused(false);
  };

  const handleConfirmPasswordBlur = (e) => {
    if (confirmPasswordContainerRef.current && e.relatedTarget instanceof Node && confirmPasswordContainerRef.current.contains(e.relatedTarget)) return;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setIsPasswordFocused(!validatePassword(newPassword).isValid);
  };

  return (
    <div className="container mx-auto px-4 py-16 bg-[#282c3c] text-white">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Restablecer Contraseña
        </h1>

        {isLoading ? (
          <p className="text-center">Procesando enlace de recuperación...</p>
        ) : (
          <div className="bg-[#3B4252] rounded-xl p-8">
            {message && <p className="text-center mb-4">{message}</p>}
            {!message.includes("Error") &&
              !message.includes("inválido") &&
              !message.includes("verificar") && (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-300 mb-1"
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
                        className={`w-full px-4 py-2 bg-[#282c3c] text-white border rounded-lg pr-10
                          ${errors.password ? "border-red-500" : "border-gray-600"}
                          focus:ring-[1.5px] focus:ring-[#ff9404] focus:outline-none focus:border-0`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        style={{ top: "50%", transform: "translateY(-50%)" }}
                      >
                        {showPassword ? (
                          <EyeOff size={20} className="text-gray-400 hover:text-[#ff9400]" />
                        ) : (
                          <Eye size={20} className="text-gray-400 hover:text-[#ff9400]" />
                        )}
                      </button>
                      <div
                        className={`absolute top-full left-0 mt-2 text-sm w-full transition-all duration-300 ease-in-out z-10 ${
                          isPasswordFocused ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
                        }`}
                      >
                        <ul className="list-none pl-2 space-y-1 bg-[#3B4252] p-4 rounded-lg shadow-md">
                          <li className="flex items-center">
                            <span
                              className={`mr-2 inline-flex items-center justify-center w-3 h-3 rounded-full border border-gray-500 ${
                                validatePassword(password).hasUpperCase ? "bg-gray-300 border-gray-300" : "bg-transparent"
                              }`}
                            >
                              {validatePassword(password).hasUpperCase && <FaCheck className="text-black text-[8px]" />}
                            </span>
                            <span className={validatePassword(password).hasUpperCase ? "text-gray-300" : "text-gray-400"}>Letra Mayúscula</span>
                          </li>
                          <li className="flex items-center">
                            <span
                              className={`mr-2 inline-flex items-center justify-center w-3 h-3 rounded-full border border-gray-500 ${
                                validatePassword(password).hasLowerCase ? "bg-gray-300 border-gray-300" : "bg-transparent"
                              }`}
                            >
                              {validatePassword(password).hasLowerCase && <FaCheck className="text-black text-[8px]" />}
                            </span>
                            <span className={validatePassword(password).hasLowerCase ? "text-gray-300" : "text-gray-400"}>Letra Minúscula</span>
                          </li>
                          <li className="flex items-center">
                            <span
                              className={`mr-2 inline-flex items-center justify-center w-3 h-3 rounded-full border border-gray-500 ${
                                validatePassword(password).hasNumber ? "bg-gray-300 border-gray-300" : "bg-transparent"
                              }`}
                            >
                              {validatePassword(password).hasNumber && <FaCheck className="text-black text-[8px]" />}
                            </span>
                            <span className={validatePassword(password).hasNumber ? "text-gray-300" : "text-gray-400"}>Número</span>
                          </li>
                          <li className="flex items-center">
                            <span
                              className={`mr-2 inline-flex items-center justify-center w-3 h-3 rounded-full border border-gray-500 ${
                                validatePassword(password).hasSpecialChar ? "bg-gray-300 border-gray-300" : "bg-transparent"
                              }`}
                            >
                              {validatePassword(password).hasSpecialChar && <FaCheck className="text-black text-[8px]" />}
                            </span>
                            <span className={validatePassword(password).hasSpecialChar ? "text-gray-300" : "text-gray-400"}>Carácter Especial (e.g. !@#$%)</span>
                          </li>
                          <li className="flex items-center">
                            <span
                              className={`mr-2 inline-flex items-center justify-center w-3 h-3 rounded-full border border-gray-500 ${
                                validatePassword(password).isLongEnough ? "bg-gray-300 border-gray-300" : "bg-transparent"
                              }`}
                            >
                              {validatePassword(password).isLongEnough && <FaCheck className="text-black text-[8px]" />}
                            </span>
                            <span className={validatePassword(password).isLongEnough ? "text-gray-300" : "text-gray-400"}>8 Caracteres o Más</span>
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
                      className="block text-sm font-medium text-gray-300 mb-1"
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
                        className={`w-full px-4 py-2 bg-[#282c3c] text-white border rounded-lg pr-10
                          ${errors.confirmPassword ? "border-red-500" : "border-gray-600"}
                          focus:ring-[1.5px] focus:ring-[#ff9404] focus:outline-none focus:border-0`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        style={{ top: "50%", transform: "translateY(-50%)" }}
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={20} className="text-gray-400 hover:text-[#ff9400]" />
                        ) : (
                          <Eye size={20} className="text-gray-400 hover:text-[#ff9400]" />
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
                    className="w-full py-2 px-4 bg-[#ff9400] text-white font-semibold rounded-lg hover:bg-[#FF9500] disabled:bg-gray-500"
                  >
                    Actualizar Contraseña
                  </button>
                </form>
              )}
            <p className="mt-4 text-center text-gray-400">
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