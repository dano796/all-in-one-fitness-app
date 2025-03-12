import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { registrarUsuario } from '../../backend/auths/auth';

const RegisterPage: React.FC = () => {
  const [usuario, setUsuario] = useState('');
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [confirmarContraseña, setConfirmarContraseña] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState<'error' | 'success' | ''>('');
  const [contador, setContador] = useState(60);
  const [puedeReenviar, setPuedeReenviar] = useState(false);

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
      return;
    }
  
    const response = await registrarUsuario(usuario, correo, contraseña);
  
    if (response.error) {
      setMensaje(response.error);
      setTipoMensaje('error');
    } else {
      setMensaje(response.success || "Registro exitoso.");
      setTipoMensaje('success');
      setContador(60);
      setPuedeReenviar(false);
      setUsuario('');
      setCorreo('');
      setContraseña('');
      setConfirmarContraseña('');
    }
  };
  

  return (
    <div className="container mx-auto px-4 py-16 bg-[#282c3c] text-white">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Crear Cuenta</h1>

        <div className="bg-[#3B4252] rounded-xl p-8 shadow-sm">
          {mensaje && (
            <p className={`text-center font-semibold ${tipoMensaje === 'success' ? 'text-green-400' : 'text-red-400'}`}>{mensaje}</p>
          )}
          <form className="space-y-6" onSubmit={handleRegister}>
            <input type="text" value={usuario} onChange={(e) => setUsuario(e.target.value)} placeholder="NombreUsuario" className="w-full px-4 py-2 bg-[#282c3c] text-white border border-gray-600 rounded-lg" required />
            <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="example@email.com" className="w-full px-4 py-2 bg-[#282c3c] text-white border border-gray-600 rounded-lg" required />
            <input type="password" value={contraseña} onChange={(e) => setContraseña(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2 bg-[#282c3c] text-white border border-gray-600 rounded-lg" required />
            <input type="password" value={confirmarContraseña} onChange={(e) => setConfirmarContraseña(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2 bg-[#282c3c] text-white border border-gray-600 rounded-lg" required />
            <button type="submit" className="w-full py-2 bg-[#ff9404] text-white font-semibold rounded-lg hover:bg-[#ff9404]">Crear Cuenta</button>
          </form>
          <p className="mt-4 text-center text-gray-400">¿Ya tienes una cuenta? <Link to="/login" className="text-[#ff9404] hover:underline">Inicia sesión aquí</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;