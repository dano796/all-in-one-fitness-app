import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Swal from "sweetalert2";
import { useNotificationStore } from "../store/notificationStore";
import Loader from "../components/Loader";

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useNotificationStore();
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    if (hasProcessed) return;

    const handleCallback = async () => {
      setHasProcessed(true);
      try {
        const query = new URLSearchParams(location.hash.substring(1));
        const accessToken = query.get("access_token");
        const refreshToken = query.get("refresh_token");

        if (!accessToken || !refreshToken) {
          throw new Error("Tokens no recibidos en el callback.");
        }

        console.log("[Frontend Google OAuth] Enviando tokens al backend:", {
          accessToken: accessToken.substring(0, 20) + "...",
          refreshToken: refreshToken.substring(0, 20) + "...",
        });

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/google-callback`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_token: accessToken, refresh_token: refreshToken }),
          }
        );

        const result = await response.json();
        console.log("[Frontend Google OAuth] Respuesta del backend:", result);

        if (!response.ok) {
          if (response.status === 409) {
            console.log("[Frontend Google OAuth] Solicitud duplicada ignorada");
            return; // Ignorar solicitudes duplicadas
          }
          throw new Error(result.error || "Error al procesar la autenticación con Google.");
        }

        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        console.log("[Frontend Google OAuth] Resultado de setSession:", { error: sessionError });
        if (sessionError) {
          throw new Error("Error al establecer la sesión en Supabase.");
        }

        const { data } = await supabase.auth.getUser();
        console.log("[Frontend Google OAuth] Usuario obtenido:", { user: !!data.user });
        if (data.user) {
          addNotification(
            "✅ Sesión iniciada con Google",
            "🔐 Has iniciado sesión correctamente con tu cuenta de Google.",
            "success"
          );
          navigate("/dashboard", { replace: true });
        } else {
          throw new Error("No se pudo obtener el usuario después de la autenticación.");
        }
      } catch (err) {
        console.error("[Frontend Google OAuth] Error en el callback:", {
          message: err.message,
        });
        Swal.fire({
          title: "¡Error!",
          text: err.message || "Ocurrió un error al procesar la autenticación con Google.",
          icon: "error",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#ff9400",
        });
        navigate("/login", { replace: true });
      }
    };

    handleCallback();
  }, [navigate, addNotification, location, hasProcessed]);

  return <Loader />;
};

export default AuthCallback;