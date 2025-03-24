import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Dumbbell, UserCircle, LogOut, Menu, X } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { User as SupabaseUser } from "@supabase/supabase-js"; // Usamos el tipo User de Supabase

// Usamos el tipo de Supabase en lugar de definir uno propio
type User = SupabaseUser;

const DesktopMenu: React.FC<{
  user: User | null;
  userData: string | null;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  menuRef: React.RefObject<HTMLDivElement>;
}> = ({ user, userData, menuOpen, setMenuOpen, menuRef }) => (
  <div className="hidden md:flex items-center space-x-4">
    <div className="flex-1 flex justify-center">
      <ul className="flex space-x-6">
        <li>
          <Link to="/" className="hover:text-[#FF9500] font-semibold transition">
            Inicio
          </Link>
        </li>
        <li>
          <Link
            to="/nosotros"
            className="hover:text-[#FF9500] font-semibold transition"
          >
            Nosotros
          </Link>
        </li>
        <li>
          <Link
            to="/modulos"
            className="hover:text-[#FF9500] font-semibold transition"
          >
            Módulos
          </Link>
        </li>
        <li>
          <Link
            to="/contacto"
            className="hover:text-[#FF9500] font-semibold transition"
          >
            Contacto
          </Link>
        </li>
      </ul>
    </div>
    <div className="flex items-center space-x-4">
      {user && (
        <Link
          to="/dashboard"
          className="hover:text-[#FF9500] transition font-semibold text-white"
        >
          Dashboard
        </Link>
      )}
      {user ? (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2"
          >
            <UserCircle className="w-8 h-8 text-gray-300" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#2C2C2E] border border-gray-600 rounded-lg shadow-lg p-4 z-10">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-500">
                <UserCircle className="w-10 h-10 text-gray-400" />
                <div>
                  <p className="text-sm font-semibold text-white">
                    {userData || "Usuario"}
                  </p>
                  <p className="text-xs text-gray-400">{user.email || ""}</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  setMenuOpen(false);
                }}
                className="flex items-center w-full mt-3 text-sm text-red-500 hover:bg-gray-800 p-2 rounded transition"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <Link
            to="/login"
            className="border border-[#FF9500] font-semibold text-[#FF9500] py-2 px-4 rounded-lg hover:bg-[#FF9500] hover:text-[#1C1C1E] transition"
          >
            Iniciar Sesión
          </Link>
          <Link
            to="/registro"
            className="bg-[#FF9500] font-semibold text-white py-2 px-4 rounded-lg hover:bg-[#FF9500] hover:text-[#1C1C1E] transition"
          >
            Registrarse
          </Link>
        </>
      )}
    </div>
  </div>
);

const MobileMenu: React.FC<{
  user: User | null;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}> = ({ user, mobileMenuOpen, setMobileMenuOpen }) =>
  mobileMenuOpen ? (
    <div className="md:hidden bg-[#282c3c] font-medium border-t border-gray-700 px-2 py-2">
      <Link
        to="/"
        className="block py-2 hover:text-[#FF9500] transition"
        onClick={() => setMobileMenuOpen(false)}
      >
        Inicio
      </Link>
      <Link
        to="/nosotros"
        className="block py-2 hover:text-[#FF9500] transition"
        onClick={() => setMobileMenuOpen(false)}
      >
        Nosotros
      </Link>
      <Link
        to="/modulos"
        className="block py-2 hover:text-[#FF9500] transition"
        onClick={() => setMobileMenuOpen(false)}
      >
        Módulos
      </Link>
      <Link
        to="/contacto"
        className="block py-2 hover:text-[#FF9500] transition"
        onClick={() => setMobileMenuOpen(false)}
      >
        Contacto
      </Link>
      {user && (
        <Link
          to="/dashboard"
          className="block py-2 text-gray-300 hover:text-[#FF9500] transition"
          onClick={() => setMobileMenuOpen(false)}
        >
          Dashboard
        </Link>
      )}
      {user ? (
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            setMobileMenuOpen(false);
          }}
          className="w-full text-left py-2 hover:bg-gray-800 p-2 rounded transition"
        >
          <LogOut className="w-5 h-5 inline-block mr-2" />
          Cerrar sesión
        </button>
      ) : (
        <>
          <Link
            to="/login"
            className="block py-2 hover:text-[#FF9500] transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            Iniciar Sesión
          </Link>
          <Link
            to="/registro"
            className="block py-2 hover:text-[#FF9500] transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            Registrarse
          </Link>
        </>
      )}
    </div>
  ) : null;

const Navbar: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchUser = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data?.user ?? null); // Aseguramos que sea User | null
    if (data?.user?.email) {
      fetchUserData(data.user.email);
    }
  }, []);

  const fetchUserData = useCallback(async (email: string) => {
    const { data } = await supabase
      .from("Inicio Sesion")
      .select("Usuario")
      .eq("Correo", email)
      .single();

    setUserData(data?.Usuario ?? null);
  }, []);

  useEffect(() => {
    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user?.email) {
          fetchUserData(session.user.email);
        } else {
          setUserData(null);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [fetchUser, fetchUserData]);

  return (
    <header className="px-4 bg-[#282c3c] border-b border-[#3B4252]">
      <nav className="container mx-auto my-2 px-4 h-16 flex items-center justify-between md:my-4 lg:my-2">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-6 h-6 text-[#ff9404]" />
          <Link to="/" className="text-xl font-semibold text-white">
            All In One Fitness App
          </Link>
        </div>
        <DesktopMenu
          user={user}
          userData={userData}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          menuRef={menuRef}
        />
        <button
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>
      <MobileMenu
        user={user}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
    </header>
  );
};

export default React.memo(Navbar);