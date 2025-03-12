import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";
import { loginUser } from "../../backend/auths/authService";

const LoginPage = () => {
  const [input, setInput] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState<"error" | "success" | "">("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await loginUser(input, password);
  
    if (result.error) {
      setMensaje(result.error);
      setTipoMensaje("error");
    } else if (result.success) { 
      setMensaje(result.success);
      setTipoMensaje("success");
      setTimeout(() => navigate("/Dashboard"), 2000);
    }
  
    setModalAbierto(true);
  };
  
  return (
    <div className="container mx-auto px-4 py-16 relative bg-[#282c3c] text-white">
      {mensaje && modalAbierto && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-[#282c3c] bg-opacity-80" 
          onClick={() => setModalAbierto(false)}
        >
          <div 
            className="bg-[#1F2937] p-6 rounded-lg shadow-lg text-center max-w-md text-white" 
            onClick={(e) => e.stopPropagation()}
          >
            {tipoMensaje === "success" ? (
              <CheckCircle className="w-16 h-16 mx-auto animate-bounce" style={{ color: "#FF9500" }} />
            ) : (
              <XCircle className="w-16 h-16 mx-auto animate-bounce" style={{ color: "#FF3B30" }} />
            )}
            <p className="mt-4 font-semibold">{mensaje}</p>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Iniciar Sesión</h1>
        
        <div className="bg-[#3B4252] rounded-xl p-8 shadow-sm">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="input" className="block text-sm font-medium text-gray-300 mb-1">
                Usuario o Correo
              </label>
              <input
                type="text"
                id="input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#282c3c] text-white placeholder-gray-400"
                placeholder="Usuario o tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#282c3c] text-white placeholder-gray-400"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="w-full py-2 px-4 bg-[#ff9404] text-white font-semibold rounded-lg hover:bg-[#ff9404] hover:text-[#282c3c] transition">
              Iniciar Sesión
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            ¿No tienes una cuenta?{" "}
            <Link to="/registro" className="text-[#ff9404] font-medium hover:underline">
              Regístrate aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
