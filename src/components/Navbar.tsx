import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Dumbbell, UserCircle, LogOut, Menu, X } from "lucide-react";
import { supabase } from "../supabaseClient";

const Navbar: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        if (data.user.email) {
          fetchUserData(data.user.email);
        }
      }
    };

    const fetchUserData = async (email: string) => {
      const { data } = await supabase
        .from("Inicio Sesion")
        .select("Usuario")
        .eq("Correo", email)
        .single();

      if (data) {
        setUserData(data.Usuario);
      }
    };

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        if (session.user.email) {
          fetchUserData(session.user.email);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="bg-white border-b border-gray-200">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Dumbbell className="w-6 h-6" />
          <Link to="/" className="text-xl font-semibold">
            All In One Fitness App
          </Link>
        </div>

        {/* Menú para pantallas grandes */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/" className="nav-link">Inicio</Link>
          <Link to="/nosotros" className="nav-link">Nosotros</Link>
          <Link to="/modulos" className="nav-link">Módulos</Link>
          <Link to="/contacto" className="nav-link">Contacto</Link>

          {user && <Link to="/dashboard" className="nav-link">Dashboard</Link>} {/* Agregado */}

          {user ? (
            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2">
                <UserCircle className="w-8 h-8 text-gray-700" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg p-4 z-10">
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <UserCircle className="w-10 h-10 text-gray-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{userData || "Usuario"}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={async () => {
                      await supabase.auth.signOut();
                      setUser(null);
                      setUserData(null);
                      setMenuOpen(false);
                    }}
                    className="flex items-center w-full mt-3 text-sm text-red-500 hover:bg-gray-100 p-2 rounded"
                  >
                    <LogOut className="w-5 h-5 mr-2" />Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">Iniciar Sesión</Link>
              <Link to="/registro" className="btn btn-primary">Registrarse</Link>
            </>
          )}
        </div>

        {/* Botón menú hamburguesa */}
        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Menú para móviles */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 p-4">
          <Link to="/" className="block py-2">Inicio</Link>
          <Link to="/nosotros" className="block py-2">Nosotros</Link>
          <Link to="/modulos" className="block py-2">Módulos</Link>
          <Link to="/contacto" className="block py-2">Contacto</Link>

          {user && <Link to="/dashboard" className="block py-2">Dashboard</Link>} {/* Agregado */}

          {user ? (
            <>
              <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                  setUser(null);
                  setUserData(null);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left text-red-500 py-2"
              >
                <LogOut className="w-5 h-5 inline-block mr-2" />Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block py-2 text-black underline">Iniciar Sesión</Link>
              <Link to="/registro" className="block py-2 text-black underline">Registrarse</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
