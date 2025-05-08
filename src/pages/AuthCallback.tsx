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
        console.log('AuthCallback - Callback ya procesado, omitiendo');
        return;
      }

      hasProcessed.current = true;
      console.log('AuthCallback - Iniciando procesamiento del callback de OAuth');

      try {
        // Obtener la sesión después del callback de OAuth
        console.log('AuthCallback - Obteniendo sesión de Supabase');
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          console.error('AuthCallback - Error al obtener la sesión', { error: error?.message });
          throw new Error("No se pudo obtener la sesión.");
        }

        const accessToken = data.session.access_token;
        console.log('AuthCallback - Access token obtenido', { accessToken: accessToken ? 'Provided' : 'Missing' });

        // Enviar el token al backend para procesar el login/registro
        console.log('AuthCallback - Enviando token al backend', { endpoint: `${import.meta.env.VITE_BACKEND_URL}/api/google-auth` });
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/google-auth`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_token: accessToken }),
          }
        );

        const result = await response.json();
        console.log('AuthCallback - Respuesta del backend', { result });

        if (result.error) {
          console.error('AuthCallback - Error en la respuesta del backend', { error: result.error });
          throw new Error(result.error);
        }

        // Verificar que el usuario está autenticado
        console.log('AuthCallback - Verificando usuario autenticado');
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          console.log('AuthCallback - Usuario autenticado correctamente', { userId: userData.user.id });
          await Swal.fire({
            title: "¡Éxito!",
            text: "Sesión iniciada correctamente con Google.",
            icon: "success",
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#ff9400",
            background: isDarkMode ? "#282c3c" : "#ffffff",
            customClass: {
              popup: isDarkMode ? "custom-dark-swal" : "custom-light-swal",
              icon: "custom-swal-icon",
              title: isDarkMode ? "text-white" : "text-gray-900",
              htmlContainer: isDarkMode ? "text-gray-400" : "text-gray-600",
            },
          });
          navigate("/Dashboard", { replace: true });
        } else {
          console.error('AuthCallback - No se encontró usuario autenticado');
          throw new Error("No se pudo verificar el usuario autenticado.");
        }
      } catch (err) {
        console.error('AuthCallback - Error en el callback de autenticación', { error: err.message });
        await Swal.fire({
          title: "¡Error!",
          text: "Ocurrió un error al procesar la autenticación con Google.",
          icon: "error",
          iconColor: "#ff9400",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#ff9400",
          customClass: {
            popup: isDarkMode
              ? "custom-swal-background"
              : "custom-swal-background-light",
            icon: "custom-swal-icon",
            title: isDarkMode ? "custom-swal-title" : "custom-swal-title-light",
            htmlContainer: isDarkMode
              ? "custom-swal-text"
              : "custom-swal-text-light",
          },
        });
        navigate("/login", { replace: true });
      }
    };

    console.log('AuthCallback - Ejecutando useEffect para handleCallback');
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