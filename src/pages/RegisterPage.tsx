import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";
import { supabase } from "../lib/supabaseClient";
import { FaCheck } from "react-icons/fa";

const RegisterPage = () => {
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
  const [highlightTerms, setHighlightTerms] = useState(false);
  const passwordContainerRef = useRef<HTMLDivElement>(null);
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
    if (!acceptedTerms) {
      setHighlightTerms(true);
      await Swal.fire({
        title: "¡Error!",
        text: "Debes aceptar los términos y condiciones.",
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
        setAcceptedTerms(false);
        setHighlightTerms(false);
        const { data } = await supabase.auth.getUser();
        if (data.user) navigate("/Dashboard", { replace: true });
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
    // Mostrar el cuadro si la contraseña no es válida al enfocar
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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setContraseña(newPassword);
    // Mostrar el cuadro si la contraseña no es válida, ocultarlo si lo es
    setIsPasswordFocused(!validatePassword(newPassword).isValid);
  };

  return (
    <div className="container mx-auto px-4 py-16 bg-[#282c3c] text-white">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold mb-8 pb-3 text-center">
          Crear Cuenta
        </h1>
        <div className="bg-[#3B4252] rounded-xl p-8 shadow-sm">
          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="NombreUsuario"
                className="w-full px-4 py-2 bg-[#282c3c] text-white border border-gray-600 rounded-lg focus:outline-none"
                required
              />
            </div>
            <div>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="example@email.com"
                className="w-full px-4 py-2 bg-[#282c3c] text-white border border-gray-600 rounded-lg focus:outline-none"
                required
              />
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
                  onChange={handlePasswordChange} // Cambiamos el manejador aquí
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-[#282c3c] text-white border border-gray-600 rounded-lg focus:outline-none pr-10"
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
                      className="text-gray-400 hover:text-[#ff9400]"
                    />
                  ) : (
                    <Eye
                      size={20}
                      className="text-gray-400 hover:text-[#ff9400]"
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
                  <ul className="list-none pl-2 space-y-1 bg-[#3B4252] p-4 rounded-lg shadow-md">
                    <li className="flex items-center">
                      <span
                        className={`mr-2 inline-flex items-center justify-center w-3 h-3 rounded-full border border-gray-500 ${
                          validatePassword(contraseña).hasUpperCase
                            ? "bg-gray-300 border-gray-300"
                            : "bg-transparent"
                        }`}
                      >
                        {validatePassword(contraseña).hasUpperCase && (
                          <FaCheck className="text-black text-[8px]" />
                        )}
                      </span>
                      <span
                        className={
                          validatePassword(contraseña).hasUpperCase
                            ? "text-gray-300"
                            : "text-gray-400"
                        }
                      >
                        Letra Mayúscula
                      </span>
                    </li>
                    <li className="flex items-center">
                      <span
                        className={`mr-2 inline-flex items-center justify-center w-3 h-3 rounded-full border border-gray-500 ${
                          validatePassword(contraseña).hasLowerCase
                            ? "bg-gray-300 border-gray-300"
                            : "bg-transparent"
                        }`}
                      >
                        {validatePassword(contraseña).hasLowerCase && (
                          <FaCheck className="text-black text-[8px]" />
                        )}
                      </span>
                      <span
                        className={
                          validatePassword(contraseña).hasLowerCase
                            ? "text-gray-300"
                            : "text-gray-400"
                        }
                      >
                        Letra Minúscula
                      </span>
                    </li>
                    <li className="flex items-center">
                      <span
                        className={`mr-2 inline-flex items-center justify-center w-3 h-3 rounded-full border border-gray-500 ${
                          validatePassword(contraseña).hasNumber
                            ? "bg-gray-300 border-gray-300"
                            : "bg-transparent"
                        }`}
                      >
                        {validatePassword(contraseña).hasNumber && (
                          <FaCheck className="text-black text-[8px]" />
                        )}
                      </span>
                      <span
                        className={
                          validatePassword(contraseña).hasNumber
                            ? "text-gray-300"
                            : "text-gray-400"
                        }
                      >
                        Número
                      </span>
                    </li>
                    <li className="flex items-center">
                      <span
                        className={`mr-2 inline-flex items-center justify-center w-3 h-3 rounded-full border border-gray-500 ${
                          validatePassword(contraseña).hasSpecialChar
                            ? "bg-gray-300 border-gray-300"
                            : "bg-transparent"
                        }`}
                      >
                        {validatePassword(contraseña).hasSpecialChar && (
                          <FaCheck className="text-black text-[8px]" />
                        )}
                      </span>
                      <span
                        className={
                          validatePassword(contraseña).hasSpecialChar
                            ? "text-gray-300"
                            : "text-gray-400"
                        }
                      >
                        Carácter Especial (e.g. !@#$%)
                      </span>
                    </li>
                    <li className="flex items-center">
                      <span
                        className={`mr-2 inline-flex items-center justify-center w-3 h-3 rounded-full border border-gray-500 ${
                          validatePassword(contraseña).isLongEnough
                            ? "bg-gray-300 border-gray-300"
                            : "bg-transparent"
                        }`}
                      >
                        {validatePassword(contraseña).isLongEnough && (
                          <FaCheck className="text-black text-[8px]" />
                        )}
                      </span>
                      <span
                        className={
                          validatePassword(contraseña).isLongEnough
                            ? "text-gray-300"
                            : "text-gray-400"
                        }
                      >
                        8 Caracteres o Más
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmarContraseña}
                onChange={(e) => setConfirmarContraseña(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-[#282c3c] text-white border border-gray-600 rounded-lg focus:outline-none pr-10"
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
                    className="text-gray-400 hover:text-[#ff9400]"
                  />
                ) : (
                  <Eye
                    size={20}
                    className="text-gray-400 hover:text-[#ff9400]"
                  />
                )}
              </button>
            </div>
            <div className="flex items-center text-sm">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => {
                  setAcceptedTerms(e.target.checked);
                  setHighlightTerms(false);
                }}
                className="hidden"
              />
              <label
                htmlFor="terms"
                className="flex items-center cursor-pointer"
              >
                <span
                  className={`w-4 h-4 mr-2 rounded border border-gray-500 flex items-center justify-center transition-all duration-200 ${
                    acceptedTerms
                      ? "bg-[#ff9400] border-[#ff9400]"
                      : "bg-[#282c3c]"
                  }`}
                >
                  {acceptedTerms && (
                    <FaCheck className="text-[#282c3c] text-[10px]" />
                  )}
                </span>
                <span
                  className={`${
                    highlightTerms
                      ? "text-[#ff9400]"
                      : acceptedTerms
                      ? "text-gray-300"
                      : "text-gray-400"
                  } hover:text-[#ff9400] transition-colors duration-200`}
                >
                  Aceptar términos y condiciones
                </span>
              </label>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-[#ff9400] text-white font-semibold rounded-lg hover:bg-[#ff9400]"
            >
              Crear Cuenta
            </button>
          </form>
          <p className="mt-4 text-center text-gray-400">
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

export default RegisterPage;
