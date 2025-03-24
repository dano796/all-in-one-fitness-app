import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Swal from "sweetalert2";
import "../index.css";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const getHashParams = () => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    return {
      accessToken: params.get("access_token"),
      refreshToken: params.get("refresh_token"),
      type: params.get("type"),
    };
  };

  useEffect(() => {
    const params = getHashParams();
    console.log("Parámetros extraídos:", params);

    const { accessToken, type, refreshToken } = params;

    if (type !== "recovery" || !accessToken || !refreshToken) {
      setMessage(
        "El enlace de recuperación es inválido o no contiene un token válido."
      );
      setIsLoading(false);
      setTimeout(() => {
        window.location.href = "https://www.google.com";
      }, 2000);
      return;
    }

    const verifyTokenAndSetSession = async () => {
      try {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error("Error al establecer la sesión:", error.message);
          setMessage(`Error al verificar el enlace: ${error.message}`);
          setIsLoading(false);
          setTimeout(() => {
            window.location.href = "https://www.google.com";
          }, 2000);
          return;
        }

        if (data.user) {
          console.log("Usuario verificado y sesión establecida:", data.user);
          setMessage("Enlace verificado. Ingresa tu nueva contraseña.");
        } else {
          setMessage("No se pudo verificar el usuario asociado al token.");
          setTimeout(() => {
            window.location.href = "https://www.google.com";
          }, 2000);
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Excepción inesperada:", err);
        setMessage("Ocurrió un error inesperado al verificar el enlace.");
        setIsLoading(false);
        setTimeout(() => {
          window.location.href = "https://www.google.com";
        }, 2000);
      }
    };

    verifyTokenAndSetSession();
  }, []);

  const updatePasswordInDatabase = async (
    userEmail: string,
    newPassword: string
  ) => {
    try {
      const { data, error } = await supabase
        .from("Inicio Sesion")
        .update({ Contraseña: newPassword })
        .eq("Correo", userEmail);

      if (error) {
        console.error(
          "Error al actualizar la contraseña en la base de datos:",
          error.message
        );
        throw new Error(
          `Error al actualizar la contraseña en la base de datos: ${error.message}`
        );
      }

      console.log("Contraseña actualizada en la base de datos:", data);
      return data;
    } catch (err) {
      console.error("Excepción al actualizar en la base de datos:", err);
      throw err;
    }
  };

  const handleResetPassword = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
      setIsLoading(false);
      return;
    }

    if (!password || password.length < 6) {
      setMessage("La contraseña debe tener al menos 6 caracteres.");
      setIsLoading(false);
      return;
    }

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        console.error("Error al obtener el usuario:", userError?.message);
        setMessage("No se pudo obtener la información del usuario.");
        setIsLoading(false);
        return;
      }

      const userEmail = userData.user.email;
      if (!userEmail) {
        setMessage("No se pudo obtener el correo del usuario.");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        console.error(
          "Error al actualizar la contraseña en Supabase Auth:",
          error.message
        );
        setMessage(`Error al actualizar la contraseña: ${error.message}`);
        setIsLoading(false);
        return;
      }

      await updatePasswordInDatabase(userEmail, password);

      console.log("Contraseña actualizada en Supabase Auth:", data);

      await Swal.fire({
        title: "¡Éxito!",
        text: "Tu contraseña ha sido actualizada correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#ff9400",
        customClass: {
          popup: "custom-swal-background",
          icon: "custom-swal-icon",
          title: "custom-swal-title",
          htmlContainer: "custom-swal-text",
        },
      });

      await supabase.auth.signOut();

      navigate("/Dashboard", { replace: true });
    } catch (err) {
      console.error("Excepción al actualizar:", err);
      setMessage("Ocurrió un error inesperado al actualizar la contraseña.");
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 bg-[#282c3c] text-white">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Restablecer Contraseña
        </h1>

        {isLoading ? (
          <p className="text-center">Procesando enlace de recuperación...</p>
        ) : (
          <div className="bg-[#3B4252] rounded-xl p-8">
            {message && <p className="text-center mb-4">{message}</p>}
            {!message.includes("Error") &&
              !message.includes("inválido") &&
              !message.includes("verificar") && (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#282c3c] text-white"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Confirmar Contraseña
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#282c3c] text-white"
                      placeholder="••••••••"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 px-4 bg-[#ff9400] text-white rounded-lg disabled:bg-gray-500"
                  >
                    Actualizar Contraseña
                  </button>
                </form>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ResetPassword);