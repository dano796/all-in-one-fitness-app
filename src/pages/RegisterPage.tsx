// src/pages/RegisterPage.tsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";
import { supabase } from "../lib/supabaseClient";
import { FaCheck } from "react-icons/fa";
import { useTheme } from "./ThemeContext";

const RegisterPage = () => {
  const { isDarkMode } = useTheme();
  const [usuario, setUsuario] = useState("");
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [contador, setContador] = useState(60);
  const [puedeReenviar, setPuedeReenviar] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState({
    usuario: "",
    correo: "",
    contraseña: "",
    confirmarContraseña: "",
    terms: "",
  });
  const passwordContainerRef = useRef<HTMLDivElement>(null);
  const confirmPasswordContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (!puedeReenviar && contador > 0) {
      timer = setTimeout(() => setContador(contador - 1), 1000);
    } else {
      setPuedeReenviar(true);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [contador, puedeReenviar]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) return;
        if (user) navigate("/Dashboard", { replace: true });
      } catch (err) {
        console.error("Excepción al verificar la sesión:", err);
      }
    };
    checkSession();
  }, [navigate]);

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
      isValid:
        hasUpperCase &&
        hasLowerCase &&
        hasNumber &&
        hasSpecialChar &&
        isLongEnough,
    };
  };

  const resetForm = () => {
    setUsuario("");
    setCorreo("");
    setContraseña("");
    setConfirmarContraseña("");
    setAcceptedTerms(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setErrors({
      usuario: "",
      correo: "",
      contraseña: "",
      confirmarContraseña: "",
      terms: "",
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({
      usuario: "",
      correo: "",
      contraseña: "",
      confirmarContraseña: "",
      terms: "",
    });

    let hasError = false;

    if (!usuario) {
      setErrors((prev) => ({ ...prev, usuario: "required" }));
      hasError = true;
    }

    if (!correo) {
      setErrors((prev) => ({ ...prev, correo: "required" }));
      hasError = true;
    }

    if (!contraseña) {
      setErrors((prev) => ({ ...prev, contraseña: "required" }));
      hasError = true;
    } else if (!validatePassword(contraseña).isValid) {
      setErrors((prev) => ({
        ...prev,
        contraseña: "La contraseña no cumple con los requisitos",
      }));
      hasError = true;
    }

    if (!confirmarContraseña) {
      setErrors((prev) => ({ ...prev, confirmarContraseña: "required" }));
      hasError = true;
    } else if (contraseña !== confirmarContraseña) {
      setErrors((prev) => ({
        ...prev,
        confirmarContraseña: "Las contraseñas no coinciden",
      }));
      hasError = true;
    }

    if (!acceptedTerms) {
      setErrors((prev) => ({
        ...prev,
        terms: "Debes aceptar los términos y condiciones",
      }));
      hasError = true;
    }

    if (hasError) return;

    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL + "/api/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usuario, correo, contraseña }),
        }
      );
      const result = await response.json();
      if (result.error) {
        if (result.error.toLowerCase().includes("usuario")) {
          setErrors((prev) => ({ ...prev, usuario: result.error }));
        } else if (result.error.toLowerCase().includes("correo")) {
          setErrors((prev) => ({ ...prev, correo: result.error }));
        } else {
          setErrors((prev) => ({ ...prev, correo: result.error }));
        }
      } else {
        await Swal.fire({
          title: "¡Registro exitoso!",
          text: "Tu cuenta ha sido creada correctamente.",
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
        setContador(60);
        setPuedeReenviar(false);
        resetForm();
        navigate("/login", { replace: true });
      }
    } catch (err) {
      console.error("Error durante el registro:", err);
      setErrors((prev) => ({ ...prev, correo: "Ocurrió un error inesperado" }));
    }
  };

  const togglePasswordVisibility = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleFocus = () => {
    if (!validatePassword(contraseña).isValid) {
      setIsPasswordFocused(true);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (
      passwordContainerRef.current &&
      e.relatedTarget instanceof Node &&
      passwordContainerRef.current.contains(e.relatedTarget)
    )
      return;
    setIsPasswordFocused(false);
  };

  const handleConfirmPasswordBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (
      confirmPasswordContainerRef.current &&
      e.relatedTarget instanceof Node &&
      confirmPasswordContainerRef.current.contains(e.relatedTarget)
    )
      return;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setContraseña(newPassword);
    setIsPasswordFocused(!validatePassword(newPassword).isValid);
  };

  return (
    <div
      className={`container mx-auto px-8 py-16 transition-colors duration-300 ${
        isDarkMode ? "bg-[#282c3c] text-white" : "bg-[#F8F9FA] text-[#212529]"
      }`}
    >
      <div className="max-w-md mx-auto">
        <h1 className="text-5xl font-bold mb-8 pb-3 text-center">
          Crear Cuenta
        </h1>
        <div
          className={`rounded-xl p-8 shadow-sm ${
            isDarkMode ? "bg-[#3B4252]" : "bg-[#E9ECEF]"
          }`}
        >
          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="NombreUsuario"
                className={`w-full px-4 py-2 rounded-lg border focus:ring-[1.5px] focus:ring-[#ff9404] focus:outline-none focus:border-0 transition-colors duration-300 ${
                  isDarkMode
                    ? `bg-[#282c3c] text-white ${
                        errors.usuario ? "border-red-500" : "border-gray-600"
                      }`
                    : `bg-white text-gray-900 ${
                        errors.usuario ? "border-red-500" : "border-gray-300"
                      }`
                }`}
                required
              />
              {errors.usuario && errors.usuario !== "required" && (
                <p className="text-red-500 text-sm mt-1">{errors.usuario}</p>
              )}
            </div>
            <div>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="example@email.com"
                className={`w-full px-4 py-2 rounded-lg border focus:ring-[1.5px] focus:ring-[#ff9404] focus:outline-none focus:border-0 transition-colors duration-300 ${
                  isDarkMode
                    ? `bg-[#282c3c] text-white ${
                        errors.correo ? "border-red-500" : "border-gray-600"
                      }`
                    : `bg-white text-gray-900 ${
                        errors.correo ? "border-red-500" : "border-gray-300"
                      }`
                }`}
                required
              />
              {errors.correo && errors.correo !== "required" && (
                <p className="text-red-500 text-sm mt-1">{errors.correo}</p>
              )}
            </div>
            <div>
              <div
                className="relative"
                ref={passwordContainerRef}
                onFocus={handleFocus}
                onBlur={handleBlur}
                tabIndex={-1}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  value={contraseña}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2 rounded-lg border pr-10 focus:ring-[1.5px] focus:ring-[#ff9404] focus:outline-none focus:border-0 transition-colors duration-300 ${
                    isDarkMode
                      ? `bg-[#282c3c] text-white ${
                          errors.contraseña
                            ? "border-red-500"
                            : "border-gray-600"
                        }`
                      : `bg-white text-gray-900 ${
                          errors.contraseña
                            ? "border-red-500"
                            : "border-gray-300"
                        }`
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  style={{ top: "50%", transform: "translateY(-50%)" }}
                >
                  {showPassword ? (
                    <EyeOff
                      size={20}
                      className={`hover:text-[#ff9400] ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                  ) : (
                    <Eye
                      size={20}
                      className={`hover:text-[#ff9400] ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                  )}
                </button>
                <div
                  className={`absolute top-full left-0 mt-2 text-sm w-full transition-all duration-300 ease-in-out z-10 ${
                    isPasswordFocused
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 -translate-y-2 pointer-events-none"
                  }`}
                >
                  <ul
                    className={`list-none pl-2 space-y-1 p-4 rounded-lg shadow-md ${
                      isDarkMode ? "bg-[#3B4252]" : "bg-white"
                    }`}
                  >
                    <li className="flex items-center">
                      <span
                        className={`mr-2 inline-flex items-center justify-center w-3 h-3 rounded-full border ${
                          isDarkMode ? "border-gray-500" : "border-gray-400"
                        } ${
                          validatePassword(contraseña).hasUpperCase
                            ? isDarkMode
                              ? "bg-gray-300 border-gray-300"
                              : "bg-gray-200 border-gray-200"
                            : "bg-transparent"
                        }`}
                      >
                        {validatePassword(contraseña).hasUpperCase && (
                          <FaCheck
                            className={`${
                              isDarkMode ? "text-black" : "text-gray-900"
                            } text-[8px]`}
                          />
                        )}
                      </span>
                      <span
                        className={
                          validatePassword(contraseña).hasUpperCase
                            ? isDarkMode
                              ? "text-gray-300"
                              : "text-gray-700"
                            : isDarkMode
                            ? "text-gray-400"
                            : "text-gray-500"
                        }
                      >
                        Letra Mayúscula
                      </span>
                    </li>
                    <li className="flex items-center">
                      <span
                        className={`mr-2 inline-flex items-center justify-center w-3 h-3 rounded-full border ${
                          isDarkMode ? "border-gray-500" : "border-gray-400"
                        } ${
                          validatePassword(contraseña).hasLowerCase
                            ? isDarkMode
                              ? "bg-gray-300 border-gray-300"
                              : "bg-gray-200 border-gray-200"
                            : "bg-transparent"
                        }`}
                      >
                        {validatePassword(contraseña).hasLowerCase && (
                          <FaCheck
                            className={`${
                              isDarkMode ? "text-black" : "text-gray-900"
                            } text-[8px]`}
                          />
                        )}
                      </span>
                      <span
                        className={
                          validatePassword(contraseña).hasLowerCase
                            ? isDarkMode
                              ? "text-gray-300"
                              : "text-gray-700"
                            : isDarkMode
                            ? "text-gray-400"
                            : "text-gray-500"
                        }
                      >
                        Letra Minúscula
                      </span>
                    </li>
                    <li className="flex items-center">
                      <span
                        className={`mr-2 inline-flex items-center justify-center w-3 h-3 rounded-full border ${
                          isDarkMode ? "border-gray-500" : "border-gray-400"
                        } ${
                          validatePassword(contraseña).hasNumber
                            ? isDarkMode
                              ? "bg-gray-300 border-gray-300"
                              : "bg-gray-200 border-gray-200"
                            : "bg-transparent"
                        }`}
                      >
                        {validatePassword(contraseña).hasNumber && (
                          <FaCheck
                            className={`${
                              isDarkMode ? "text-black" : "text-gray-900"
                            } text-[8px]`}
                          />
                        )}
                      </span>
                      <span
                        className={
                          validatePassword(contraseña).hasNumber
                            ? isDarkMode
                              ? "text-gray-300"
                              : "text-gray-700"
                            : isDarkMode
                            ? "text-gray-400"
                            : "text-gray-500"
                        }
                      >
                        Número
                      </span>
                    </li>
                    <li className="flex items-center">
                      <span
                        className={`mr-2 inline-flex items-center justify-center w-3 h-3 rounded-full border ${
                          isDarkMode ? "border-gray-500" : "border-gray-400"
                        } ${
                          validatePassword(contraseña).hasSpecialChar
                            ? isDarkMode
                              ? "bg-gray-300 border-gray-300"
                              : "bg-gray-200 border-gray-200"
                            : "bg-transparent"
                        }`}
                      >
                        {validatePassword(contraseña).hasSpecialChar && (
                          <FaCheck
                            className={`${
                              isDarkMode ? "text-black" : "text-gray-900"
                            } text-[8px]`}
                          />
                        )}
                      </span>
                      <span
                        className={
                          validatePassword(contraseña).hasSpecialChar
                            ? isDarkMode
                              ? "text-gray-300"
                              : "text-gray-700"
                            : isDarkMode
                            ? "text-gray-400"
                            : "text-gray-500"
                        }
                      >
                        Carácter Especial (e.g. !@#$%)
                      </span>
                    </li>
                    <li className="flex items-center">
                      <span
                        className={`mr-2 inline-flex items-center justify-center w-3 h-3 rounded-full border ${
                          isDarkMode ? "border-gray-500" : "border-gray-400"
                        } ${
                          validatePassword(contraseña).isLongEnough
                            ? isDarkMode
                              ? "bg-gray-300 border-gray-300"
                              : "bg-gray-200 border-gray-200"
                            : "bg-transparent"
                        }`}
                      >
                        {validatePassword(contraseña).isLongEnough && (
                          <FaCheck
                            className={`${
                              isDarkMode ? "text-black" : "text-gray-900"
                            } text-[8px]`}
                          />
                        )}
                      </span>
                      <span
                        className={
                          validatePassword(contraseña).isLongEnough
                            ? isDarkMode
                              ? "text-gray-300"
                              : "text-gray-700"
                            : isDarkMode
                            ? "text-gray-400"
                            : "text-gray-500"
                        }
                      >
                        8 Caracteres o Más
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
              {errors.contraseña && errors.contraseña !== "required" && (
                <p className="text-red-500 text-sm mt-1">{errors.contraseña}</p>
              )}
            </div>
            <div>
              <div
                className="relative"
                ref={confirmPasswordContainerRef}
                onBlur={handleConfirmPasswordBlur}
                tabIndex={-1}
              >
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmarContraseña}
                  onChange={(e) => setConfirmarContraseña(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2 rounded-lg border pr-10 focus:ring-[1.5px] focus:ring-[#ff9404] focus:outline-none focus:border-0 transition-colors duration-300 ${
                    isDarkMode
                      ? `bg-[#282c3c] text-white ${
                          errors.confirmarContraseña
                            ? "border-red-500"
                            : "border-gray-600"
                        }`
                      : `bg-white text-gray-900 ${
                          errors.confirmarContraseña
                            ? "border-red-500"
                            : "border-gray-300"
                        }`
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  style={{ top: "50%", transform: "translateY(-50%)" }}
                >
                  {showConfirmPassword ? (
                    <EyeOff
                      size={20}
                      className={`hover:text-[#ff9400] ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                  ) : (
                    <Eye
                      size={20}
                      className={`hover:text-[#ff9400] ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                  )}
                </button>
              </div>
              {errors.confirmarContraseña &&
                errors.confirmarContraseña !== "required" && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmarContraseña}
                  </p>
                )}
            </div>
            <div className="flex items-center text-sm">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="hidden"
              />
              <label
                htmlFor="terms"
                className="flex items-center cursor-pointer"
              >
                <span
                  className={`w-4 h-4 mr-2 rounded border flex items-center justify-center transition-all duration-200 ${
                    isDarkMode
                      ? `${
                          acceptedTerms
                            ? "bg-[#ff9400] border-[#ff9400]"
                            : "bg-[#282c3c] border-gray-500"
                        }`
                      : `${
                          acceptedTerms
                            ? "bg-[#ff9400] border-[#ff9400]"
                            : "bg-white border-gray-400"
                        }`
                  }`}
                >
                  {acceptedTerms && (
                    <FaCheck
                      className={`${
                        isDarkMode ? "text-[#282c3c]" : "text-white"
                      } text-[10px]`}
                    />
                  )}
                </span>
                <span
                  className={`${
                    errors.terms
                      ? "text-red-500"
                      : acceptedTerms
                      ? isDarkMode
                        ? "text-gray-300"
                        : "text-gray-700"
                      : isDarkMode
                      ? "text-gray-400"
                      : "text-gray-500"
                  } hover:text-[#ff9400] transition-colors duration-200`}
                >
                  Aceptar términos y condiciones
                </span>
              </label>
              {errors.terms && (
                <p className="text-red-500 text-sm mt-1 ml-6">{errors.terms}</p>
              )}
            </div>
            <button
              type="submit"
              className={`w-full py-2 font-semibold rounded-lg text-white transition-all duration-300 ${
                isDarkMode
                  ? "bg-[#ff9400] hover:bg-[#e68900]"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              Crear Cuenta
            </button>
          </form>
          <p
            className={`mt-4 text-center ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="text-[#ff9400] hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(RegisterPage);
