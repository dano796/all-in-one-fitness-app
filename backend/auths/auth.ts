import { supabase } from "../lib/supabaseClient";

export const registrarUsuario = async (usuario: string, correo: string, contraseña: string) => {
  const usuarioLower = usuario.toLowerCase();

  // Verificar si el usuario ya existe en la base de datos
  const { data: usuarioExistente } = await supabase
    .from("Inicio Sesion")
    .select("Usuario")
    .eq("Usuario", usuarioLower)
    .single();

  if (usuarioExistente) {
    return { error: "El nombre de usuario ya está en uso." };
  }

  // Verificar si el correo ya existe en la base de datos
  const { data: correoExistente } = await supabase
    .from("Inicio Sesion")
    .select("Correo")
    .eq("Correo", correo)
    .single();

  if (correoExistente) {
    return { error: "El correo ya está registrado." };
  }

  // Intentar iniciar sesión con el correo (para verificar si ya está en Supabase Auth)
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: correo,
    password: contraseña,
  });

  // Si el error es diferente de "Invalid login credentials", significa que el correo ya existe en Auth
  if (authError && authError.message !== "Invalid login credentials") {
    return { error: "El correo ya está registrado en el sistema." };
  }

  // Registrar al usuario en Supabase Auth
  const { error: signUpError } = await supabase.auth.signUp({
    email: correo,
    password: contraseña,
    options: {
      data: { usuario: usuarioLower },
      emailRedirectTo: "http://localhost:5173/login",
    },
  });

  if (signUpError) {
    return { error: "El correo ya esta registrado pero no autenticado"};
  }

  // Insertar usuario en la base de datos
  await supabase.from("Inicio Sesion").insert({
    Usuario: usuarioLower,
    Correo: correo,
    Contraseña: contraseña,
  });

  return { success: `Registro exitoso. Verifica el correo enviado a ${correo}` };
};
