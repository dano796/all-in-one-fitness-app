import { supabase } from "../lib/supabaseClient";

export const loginUser = async (input: string, password: string) => {
  let email = input;
  const inputLower = input.toLowerCase();

  try {
    if (!input.includes("@")) {
      const { data, error } = await supabase
        .from("Inicio Sesion")
        .select("Correo")
        .eq("Usuario", inputLower)
        .single();

      if (error || !data) {
        return { error: "Usuario no encontrado." };
      }

      email = data.Correo;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      let mensajeError = error.message.includes("Invalid login credentials")
        ? "Credenciales incorrectas."
        : error.message;
      return { error: mensajeError };
    }

    return { success: "Inicio de sesión exitoso" };
  } catch (err) {
    return { error: "Ocurrió un error inesperado. Inténtalo de nuevo." };
  }
};
export const resetPasswordForEmail = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:5174/reset-password' 
    });

    if (error) {
      return { error: error.message };
    }

    return { success: "Se ha enviado un correo para restablecer tu contraseña" };
  } catch (err) {
    return { error: "Ocurrió un error inesperado. Inténtalo de nuevo." };
  }
};