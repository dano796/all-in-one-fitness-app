import React, { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { useTheme } from "../pages/ThemeContext";

interface PasswordRecoveryProps {
  onClose: () => void;
}

const PasswordRecovery: React.FC<PasswordRecoveryProps> = ({ onClose }) => {
  const { isDarkMode } = useTheme();
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState<"error" | "success" | "">("");

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + "/api/reset-password",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );
    const result = await response.json();

    if (result.error) {
      setMensaje(result.error);
      setTipoMensaje("error");
    } else if (result.success) {
      setMensaje(result.success);
      setTipoMensaje("success");
      setTimeout(() => onClose(), 2000);
    }
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-opacity-80 ${
        isDarkMode ? "bg-[#282c3c]" : "bg-gray-100"
      }`}
      onClick={onClose}
    >
      <div
        className={`p-6 rounded-lg shadow-lg max-w-md w-full ${
          isDarkMode ? "bg-[#282c3c] text-white" : "bg-white text-gray-900"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          Recuperar Contraseña
        </h2>

        {mensaje && (
          <div className="mb-4 text-center">
            {tipoMensaje === "success" ? (
              <CheckCircle
                className="w-12 h-12 mx-auto animate-bounce"
                style={{ color: "#FF9500" }}
              />
            ) : (
              <XCircle
                className="w-12 h-12 mx-auto animate-bounce"
                style={{ color: "#FF3B30" }}
              />
            )}
            <p
              className={`mt-2 font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {mensaje}
            </p>
          </div>
        )}

        <form onSubmit={handleRecovery} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className={`block text-sm font-medium mb-1 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full px-4 py-2 border rounded-lg ${
                isDarkMode
                  ? "border-gray-600 bg-[#282c3c] text-white placeholder-gray-400"
                  : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
              }`}
              placeholder="tu@email.com"
            />
          </div>

          <button
            type="submit"
            className={`w-full py-2 px-4 font-semibold rounded-lg transition ${
              isDarkMode
                ? "bg-[#ff9404] text-white hover:bg-[#FF9500] hover:text-[#282c3c]"
                : "bg-[#ff9404] text-white hover:bg-[#FF9500] hover:text-gray-900"
            }`}
          >
            Enviar enlace de recuperación
          </button>
        </form>

        <button
          onClick={onClose}
          className={`w-full mt-4 text-sm hover:underline ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Volver al inicio de sesión
        </button>
      </div>
    </div>
  );
};

export default React.memo(PasswordRecovery);