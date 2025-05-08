import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { supabase } from "../lib/supabaseClient";
import { useTheme } from "./ThemeContext";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const hasProcessed = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (hasProcessed.current) {
        console.log('[AuthCallback] Callback ya procesado, omitiendo');
        return;
      }

      hasProcessed.current = true;
      console.log('[AuthCallback] Iniciando procesamiento del callback de OAuth');

      try {
        // Verificar configuración del entorno
        console.log('[AuthCallback] Verificando variables de entorno', {
          backendUrl: import.meta.env.VITE_BACKEND_URL,
        });
        if (!import.meta.env.VITE_BACKEND_URL) {
          console.error('[AuthCallback] Error: VITE_BACKEND_URL no está definido');
          throw new Error('URL del backend no configurada');
        }

        // Obtener la sesión después del callback de OAuth
        console.log('[AuthCallback] Obteniendo sesión de Supabase');
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          console.error('[AuthCallback] Error al obtener la sesión', {
            error: error?.message,
            code: error?.code,
            details: error?.details,
          });
          throw new Error('No se pudo obtener la sesión.');
        }

        const accessToken = data.session.access_token;
        console.log('[AuthCallback] Access token obtenido', { accessToken: accessToken ? 'Provided' : 'Missing' });
        if (!accessToken) {
          console.error('[AuthCallback] Error: No se encontró access_token');
          throw new Error('No se encontró el token de acceso.');
        }

        // Enviar el token al backend para procesar el login/registro
        const endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/google-auth`;
        console.log('[AuthCallback] Enviando token al backend', { endpoint });
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ access_token: accessToken }),
        });

        console.log('[AuthCallback] Estado de la respuesta del backend', {
          status: response.status,
          statusText: response.statusText,
        });

        const result = await response.json();
        console.log('[AuthCallback] Respuesta del backend', { result });

        if (!response.ok || result.error) {
          console.error('[AuthCallback] Error en la respuesta del backend', {
            status: response.status,
            error: result.error || 'Error desconocido',
          });
          throw new Error(result.error || 'Error al procesar la autenticación en el backend.');
        }

        // Verificar que el usuario está autenticado
        console.log('[AuthCallback] Verificando usuario autenticado');
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
          console.error('[AuthCallback] Error al verificar usuario autenticado', {
            error: userError?.message,
            code: userError?.code,
            details: userError?.details,
          });
          throw new Error('No se pudo verificar el usuario autenticado.');
        }

        console.log('[AuthCallback] Usuario autenticado correctamente', { userId: userData.user.id });
        await Swal.fire({
          title: '¡Éxito!',
          text: 'Sesión iniciada correctamente con Google.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#ff9400',
          background: isDarkMode ? '#282c3c' : '#ffffff',
          customClass: {
            popup: isDarkMode ? 'custom-dark-swal' : 'custom-light-swal',
            icon: 'custom-swal-icon',
            title: isDarkMode ? 'text-white' : 'text-gray-900',
            htmlContainer: isDarkMode ? 'text-gray-400' : 'text-gray-600',
          },
        });

        navigate('/Dashboard', { replace: true });
      } catch (err) {
        console.error('[AuthCallback] Error en el callback de autenticación', {
          message: err.message,
          stack: err.stack,
        });
        await Swal.fire({
          title: '¡Error!',
          text: 'Ocurrió un error al procesar la autenticación con Google: ' + err.message,
          icon: 'error',
          iconColor: '#ff9400',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#ff9400',
          background: isDarkMode ? '#282c3c' : '#ffffff',
          customClass: {
            popup: isDarkMode ? 'custom-dark-swal' : 'custom-light-swal',
            icon: 'custom-swal-icon',
            title: isDarkMode ? 'text-white' : 'text-gray-900',
            htmlContainer: isDarkMode ? 'text-gray-400' : 'text-gray-600',
          },
        });
        navigate('/login', { replace: true });
      }
    };

    console.log('[AuthCallback] Ejecutando useEffect para handleCallback');
    handleCallback();
  }, [navigate, isDarkMode]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Procesando autenticación...</h1>
      </div>
    </div>
  );
};

export default AuthCallback;