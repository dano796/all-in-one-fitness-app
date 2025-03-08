import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { CheckCircle, XCircle } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const [usuario, setUsuario] = useState('');
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [confirmarContraseña, setConfirmarContraseña] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState<'error' | 'success' | ''>('');
  const [contador, setContador] = useState(60);
  const [puedeReenviar, setPuedeReenviar] = useState(false);
  const [verificandoCorreo, setVerificandoCorreo] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!puedeReenviar && contador > 0) {
      timer = setTimeout(() => setContador(contador - 1), 1000);
    } else {
      setPuedeReenviar(true);
    }
    return () => clearTimeout(timer);
  }, [contador, puedeReenviar]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (contraseña !== confirmarContraseña) {
      setMensaje('Las contraseñas no coinciden.');
      setTipoMensaje('error');
      setModalAbierto(true);
      return;
    }

    const usuarioLower = usuario.toLowerCase();

    const { data, error } = await supabase.auth.signUp({
      email: correo,
      password: contraseña,
      options: { 
        data: { usuario: usuarioLower },
        emailRedirectTo: "http://localhost:5173/login",
      },
    });

    if (error) {
      if (error.message.includes("Password should be at least 6 characters.")) {
        setMensaje("La contraseña debe tener al menos 6 caracteres.");
      } else {
        setMensaje("Error al registrar: " + error.message);
      }      
      setModalAbierto(true);
    } else {
      await supabase.from('Inicio Sesion').insert({
        Usuario: usuarioLower,
        Correo: correo,
        Contraseña: contraseña, 
      });

      setMensaje(`Registro exitoso. Verifica el correo enviado a ${correo}`);
      setTipoMensaje('success');
      setContador(60);
      setPuedeReenviar(false);
      setModalAbierto(true);
      setUsuario('');
      setCorreo('');
      setContraseña('');
      setConfirmarContraseña('');
    }
  };

  const reenviarCorreo = async () => {
    await supabase.auth.resend({ email: correo, type: 'signup' });
    setMensaje('Correo de verificación reenviado. Revisa tu bandeja de entrada.');
    setTipoMensaje('success');
    setContador(60);
    setPuedeReenviar(false);
  };

  return (
    <div className="container mx-auto px-4 py-16 relative bg-[#282c3c] text-white">
      {mensaje && modalAbierto && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-[#282c3c] bg-opacity-80" 
          onClick={() => setModalAbierto(false)}
        >
          <div 
            className="bg-[#2C2C2E] p-6 rounded-lg shadow-lg text-center max-w-md text-white" 
            onClick={(e) => e.stopPropagation()}
          >
            {tipoMensaje === 'success' ? (
              <CheckCircle className="w-16 h-16 mx-auto animate-bounce" style={{ color: "#FFCC00" }} />
            ) : (
              <XCircle className="w-16 h-16 mx-auto animate-bounce" style={{ color: "#FF3B30" }} />
            )}
            <p className="mt-4 font-semibold">{mensaje}</p>
            {tipoMensaje === 'success' && verificandoCorreo && (
              !puedeReenviar ? (
                <p className="mt-2 text-sm text-gray-400">Puedes reenviar en {contador}s</p>
              ) : (
                <button 
                  onClick={reenviarCorreo} 
                  className="mt-4 px-4 py-2 bg-[#ff9404] text-white rounded-lg shadow-md hover:bg-[#ff9404]"
                >
                  Reenviar correo de verificación
                </button>
              )
            )}
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Crear Cuenta</h1>

        <div className="bg-[#3B4252] rounded-xl p-8 shadow-sm">
          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nombre de Usuario</label>
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#282c3c] text-white placeholder-gray-400"
                placeholder="NombreUsuario"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Correo</label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#282c3c] text-white placeholder-gray-400"
                placeholder="example@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Contraseña</label>
              <input
                type="password"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#282c3c] text-white placeholder-gray-400"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Confirmar Contraseña</label>
              <input
                type="password"
                value={confirmarContraseña} 
                onChange={(e) => setConfirmarContraseña(e.target.value)}
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#282c3c] text-white placeholder-gray-400"
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="w-full py-2 px-4 bg-[#ff9404] text-white font-semibold rounded-lg hover:bg-[#ff9404] hover:text-[#282c3c] transition">
              Crear Cuenta
            </button>
          </form>

          <p className="mt-4 text-center text-gray-400">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="text-[#ff9404] hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
