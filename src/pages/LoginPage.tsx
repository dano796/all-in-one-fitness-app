import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Eye, EyeOff } from "lucide-react";
import PasswordRecovery from "../components/PasswordRecovery";
import { supabase } from "../lib/supabaseClient";

const LoginPage = () => {
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
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#ff9400",
          customClass: {
            popup: "custom-swal-background",
            title: "custom-swal-title",
            htmlContainer: "custom-swal-text",
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
          text: "Inicio de sesión exitoso.",
          icon: "success",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#ff9404",
          customClass: {
            popup: "custom-swal-background",
            icon: "custom-swal-icon",
            title: "custom-swal-title",
            htmlContainer: "custom-swal-text",
          },
        });
      }
    } catch (err) {
      console.log("Error al iniciar sesión:", err);
      await Swal.fire({
        title: "¡Error!",
        text: "Ocurrió un error inesperado.",
        icon: "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#ff9400",
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="container mx-auto px-8 py-16 relative bg-[#282c3c] text-white">
      {recoveryModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            e.stopPropagation();
            setRecoveryModalOpen(false);
          }}
        >
          <div
            className="bg-[#3B4252] rounded-xl p-6 shadow-lg w-full max-w-md"
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

        <div className="bg-[#3B4252] rounded-xl p-8 shadow-sm">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="input"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Usuario o Correo
              </label>
              <input
                type="text"
                id="input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#282c3c] text-white placeholder-gray-400
                focus:ring-[1.5px] focus:ring-[#ff9404] focus:outline-none focus:border-0"
                placeholder="Usuario o tu@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-1"
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
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#282c3c] text-white placeholder-gray-400
                  focus:ring-[1.5px] focus:ring-[#ff9404] focus:outline-none focus:border-0"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-[#ff9404]"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-[#ff9404] text-white font-semibold rounded-lg hover:bg-[#ff9404] hover:text-[#282c3c] transition"
            >
              Iniciar Sesión
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400 space-y-2">
            <div>
              ¿No tienes una cuenta?{" "}
              <Link
                to="/registro"
                className="text-[#ff9404] font-medium hover:underline"
              >
                Regístrate aquí
              </Link>
            </div>
            <div className="text-gray-400">o</div>
            <div>
              <button
                onClick={() => setRecoveryModalOpen(true)}
                className="text-[#ff9404] font-medium hover:underline"
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