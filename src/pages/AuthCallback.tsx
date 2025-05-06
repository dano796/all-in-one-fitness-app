import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Swal from "sweetalert2";
import Loader from "../components/Loader.tsx";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        console.error("Error en la autenticación:", error);
        await Swal.fire({
          title: "¡Error!",
          text: "Ocurrió un error al autenticarse con Google.",
          icon: "error",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#ff9400",
          background: "#282c3c",
          customClass: {
            popup: "custom-dark-swal",
            icon: "custom-swal-icon",
            title: "text-white",
            htmlContainer: "text-gray-400",
          },
        });
        navigate("/login");
        return;
      }

      const { user } = data.session;
      if (user) {
        // Check if the user already exists in the "Inicio Sesion" table
        const { data: existingUser, error: fetchError } = await supabase
          .from("Inicio Sesion")
          .select("idusuario, Correo")
          .eq("Correo", user.email)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("Error al verificar el usuario existente:", fetchError);
          await Swal.fire({
            title: "¡Error!",
            text: "Ocurrió un error al verificar los datos.",
            icon: "error",
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#ff9400",
            background: "#282c3c",
            customClass: {
              popup: "custom-dark-swal",
              icon: "custom-swal-icon",
              title: "text-white",
              htmlContainer: "text-gray-400",
            },
          });
          navigate("/login");
          return;
        }

        let idusuario;

        // If user doesn't exist, insert into "Inicio Sesion" table
        if (!existingUser) {
          const { data: newUser, error: insertError } = await supabase
            .from("Inicio Sesion")
            .insert({
              Correo: user.email,
              Usuario: null,
              Contraseña: null,
            })
            .select("idusuario")
            .single();

          if (insertError) {
            console.error("Error al guardar en la base de datos:", insertError);
            await Swal.fire({
              title: "¡Error!",
              text: "Ocurrió un error al guardar los datos.",
              icon: "error",
              confirmButtonText: "Aceptar",
              confirmButtonColor: "#ff9400",
              background: "#282c3c",
              customClass: {
                popup: "custom-dark-swal",
                icon: "custom-swal-icon",
                title: "text-white",
                htmlContainer: "text-gray-400",
              },
            });
            navigate("/login");
            return;
          }
          idusuario = newUser.idusuario;
        } else {
          idusuario = existingUser.idusuario;
        }

        // Store idusuario in local storage or session for later use
        localStorage.setItem("idusuario", idusuario.toString());

        await Swal.fire({
          title: "¡Éxito!",
          text: "Registro o inicio de sesión con Google exitoso.",
          icon: "success",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#ff9400",
          background: "#282c3c",
          customClass: {
            popup: "custom-dark-swal",
            icon: "custom-swal-icon",
            title: "text-white",
            htmlContainer: "text-gray-400",
          },
        });
        navigate("/dashboard", { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return <Loader />;
};

export default AuthCallback;
