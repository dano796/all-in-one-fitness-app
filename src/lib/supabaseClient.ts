import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validar que las variables de entorno estén definidas
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Error: VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no están definidos");
  throw new Error("Faltan variables de entorno de Supabase");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true, // Refresca el token automáticamente
    persistSession: true, // Persiste la sesión en el navegador
    detectSessionInUrl: true, // Detecta sesiones en la URL (necesario para OAuth)
  },
  global: {
    headers: {
      Accept: "application/json", // Asegura que las respuestas sean JSON
      "Content-Type": "application/json", // Para solicitudes POST/PUT
    },
  },
});

// Log para verificar que el cliente se inicializó correctamente
console.log("Supabase client inicializado en el frontend:", {
  url: SUPABASE_URL,
  key: SUPABASE_ANON_KEY ? "Provided" : "Missing",
});