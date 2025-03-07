import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Dumbbell, UserCircle } from "lucide-react";
import { supabase } from "../supabaseClient";

const Navbar: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
    };

    fetchUser();

    // Escuchar cambios en la autenticación
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="bg-white border-b border-gray-200">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-6 h-6" />
          <Link to="/" className="text-xl font-semibold">
            All In One Fitness App
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link to="/" className="nav-link">Inicio</Link>
          <Link to="/nosotros" className="nav-link">Nosotros</Link>
          <Link to="/modulos" className="nav-link">Módulos</Link>
          <Link to="/contacto" className="nav-link">Contacto</Link>

          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <button className="relative group">
                <UserCircle className="w-8 h-8 text-gray-700" />
                <div className="hidden absolute right-0 mt-2 w-48 bg-white border rounded shadow-md p-2 group-hover:block">
                  <p className="text-sm font-medium text-gray-700">{user.email}</p>
                  <button 
                    onClick={async () => {
                      await supabase.auth.signOut();
                      setUser(null);
                    }} 
                    className="w-full mt-2 text-left text-sm text-red-500 hover:bg-gray-100 p-2 rounded"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">Iniciar Sesión</Link>
              <Link to="/registro" className="btn btn-primary">Registrarse</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
