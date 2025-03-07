import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { CheckCircle, XCircle } from "lucide-react";

const LoginPage = () => {
  const [input, setInput] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState<'error' | 'success' | ''>("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    let email = input;
    const inputLower = input.toLowerCase();
    
    try {
      if (!input.includes("@")) {
        console.log("Buscando correo para el usuario:", inputLower);
        const { data, error } = await supabase
          .from("Inicio Sesion")
          .select("Correo")
          .eq("Usuario", inputLower)
          .single();
        
        if (error || !data) {
          console.error("Error al obtener correo o usuario no encontrado:", error);
          setMensaje("Usuario no encontrado.");
          setTipoMensaje("error");
          setModalAbierto(true);
          return;
        }
        
        email = data.Correo;
        console.log("Correo encontrado:", email);
      }

      console.log("Intentando iniciar sesión con:", email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Error en inicio de sesión:", error);
        let mensajeError = error.message;
        if (mensajeError.includes("Invalid login credentials")) {
          mensajeError = "Credenciales incorrectas.";
        }
        setMensaje("Error al iniciar sesión: " + mensajeError);
        setTipoMensaje("error");
        setModalAbierto(true);
      } else {
        console.log("Inicio de sesión exitoso");
        setMensaje("Inicio de sesión exitoso");
        setTipoMensaje("success");
        setModalAbierto(true);
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (err) {
      console.error("Error inesperado:", err);
      setMensaje("Ocurrió un error inesperado. Inténtalo de nuevo.");
      setTipoMensaje("error");
      setModalAbierto(true);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 relative bg-[#111827] text-white">
      {mensaje && modalAbierto && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-[#111827] bg-opacity-80" 
          onClick={() => setModalAbierto(false)}
        >
          <div 
            className="bg-[#1F2937] p-6 rounded-lg shadow-lg text-center max-w-md text-white" 
            onClick={(e) => e.stopPropagation()}
          >
            {tipoMensaje === "success" ? (
              <CheckCircle className="w-16 h-16 mx-auto animate-bounce" style={{ color: "#FFCC00" }} />
            ) : (
              <XCircle className="w-16 h-16 mx-auto animate-bounce" style={{ color: "#FF3B30" }} />
            )}
            <p className="mt-4 font-semibold">{mensaje}</p>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Iniciar Sesión</h1>
        
        <div className="bg-[#0B101A] rounded-xl p-8 shadow-sm">
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
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#111827] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF3B30] focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#111827] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF3B30] focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="w-full py-2 px-4 bg-[#FF9500] text-white font-semibold rounded-lg hover:bg-[#FF9500] hover:text-[#1C1C1E] transition">
              Iniciar Sesión
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            ¿No tienes una cuenta?{' '}
            <Link to="/registro" className="text-[#FF9500] font-medium hover:underline">
              Regístrate aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
