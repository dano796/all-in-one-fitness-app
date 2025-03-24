import React, { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface PasswordRecoveryProps {
  onClose: () => void;
}

const PasswordRecovery: React.FC<PasswordRecoveryProps> = ({ onClose }) => {
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
      className="fixed inset-0 flex items-center justify-center bg-[#282c3c] bg-opacity-80"
      onClick={onClose}
    >
      <div
        className="bg-[#282c3c] p-6 rounded-lg shadow-lg max-w-md w-full text-white"
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
            <p className="mt-2 font-semibold">{mensaje}</p>
          </div>
        )}

        <form onSubmit={handleRecovery} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#282c3c] text-white placeholder-gray-400"
              placeholder="tu@email.com"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-[#ff9404] text-white font-semibold rounded-lg hover:bg-[#FF9500] hover:text-[#282c3c] transition"
          >
            Enviar enlace de recuperación
          </button>
        </form>

        <button
          onClick={onClose}
          className="w-full mt-4 text-gray-400 text-sm hover:underline"
        >
          Volver al inicio de sesión
        </button>
      </div>
    </div>
  );
};

export default React.memo(PasswordRecovery);