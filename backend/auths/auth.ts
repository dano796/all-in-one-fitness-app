import { supabase } from "../lib/supabaseClient";

export const registrarUsuario = async (usuario: string, correo: string, contraseña: string) => {
  const usuarioLower = usuario.toLowerCase();


  if (contraseña.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }


  const { data: usuarioExistente, error: usuarioError } = await supabase
    .from("Inicio Sesion")
    .select("Usuario")
    .eq("Usuario", usuarioLower)
    .single();

  if (usuarioError && usuarioError.code !== "PGRST116") {
    return { error: "Error al verificar el usuario. Intenta de nuevo." };
  }
  if (usuarioExistente) {
    return { error: "El nombre de usuario ya está en uso." };
  }

  const { data: correoExistente, error: correoError } = await supabase
    .from("Inicio Sesion")
    .select("Correo")
    .eq("Correo", correo)
    .single();

  if (correoError && correoError.code !== "PGRST116") {
    return { error: "Error al verificar el correo. Intenta de nuevo." };
  }
  if (correoExistente) {
    return { error: "El correo ya está registrado." };
  }


  const { error: signUpError } = await supabase.auth.signUp({
    email: correo,
    password: contraseña,
    options: {
      data: { usuario: usuarioLower },
      emailRedirectTo: "http://localhost:5174/login",
    },
  });

  if (signUpError) {
    if (signUpError.message.includes("User already registered")) {
      return { error: "El correo ya está registrado pero no autenticado." };
    }
    return { error: `Error al registrar: ${signUpError.message}` };
  }


  await supabase.from("Inicio Sesion").insert({
    Usuario: usuarioLower,
    Correo: correo,
    Contraseña: contraseña,
  });

  return { success: `Registro exitoso. Verifica el correo enviado a ${correo}` };
};