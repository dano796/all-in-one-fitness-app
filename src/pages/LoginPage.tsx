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
    <div className="container mx-auto px-4 py-16 relative">
      {mensaje && modalAbierto && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60" onClick={() => setModalAbierto(false)}>
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-md text-black" onClick={(e) => e.stopPropagation()}>
            {tipoMensaje === "success" ? (
              <CheckCircle className="text-green-500 w-16 h-16 mx-auto animate-bounce" />
            ) : (
              <XCircle className="text-red-500 w-16 h-16 mx-auto animate-bounce" />
            )}
            <p className="mt-4 font-semibold">{mensaje}</p>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Iniciar Sesión</h1>
        
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="input" className="block text-sm font-medium text-gray-700 mb-1">
                Usuario o Correo
              </label>
              <input
                type="text"
                id="input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Usuario o tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Iniciar Sesión
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            ¿No tienes una cuenta?{' '}
            <Link to="/registro" className="text-black font-medium hover:underline">
              Regístrate aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;