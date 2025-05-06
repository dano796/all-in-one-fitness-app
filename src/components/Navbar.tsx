import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Dumbbell, UserCircle, LogOut, Menu, X } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useTheme } from "../pages/ThemeContext";
import NotificationCenter from "./NotificationCenter";

type User = SupabaseUser;

const DesktopMenu: React.FC<{
  user: User | null;
  userData: string | null;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  menuRef: React.RefObject<HTMLDivElement>;
}> = ({ user, userData, menuOpen, setMenuOpen, menuRef }) => {
  const { isDarkMode } = useTheme();
  return (
    <div className="hidden md:flex items-center space-x-4">
      <div className="flex-1 flex justify-center">
        <ul className="flex space-x-6">
          <li>
            <Link
              to="/"
              className={`hover:text-[#FF9500] font-semibold transition ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Inicio
            </Link>
          </li>
          <li>
            <Link
              to="/nosotros"
              className={`hover:text-[#FF9500] font-semibold transition ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Nosotros
            </Link>
          </li>
          <li>
            <Link
              to="/modulos"
              className={`hover:text-[#FF9500] font-semibold transition ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Módulos
            </Link>
          </li>
          <li>
            <Link
              to="/contacto"
              className={`hover:text-[#FF9500] font-semibold transition ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Contacto
            </Link>
          </li>
        </ul>
      </div>
      <div className="flex items-center space-x-4">
        {user && (
          <>
            <Link
              to="/dashboard"
              className={`hover:text-[#FF9500] transition font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Dashboard
            </Link>
            <NotificationCenter />
          </>
        )}
        {user ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2"
            >
              <UserCircle
                className={`w-8 h-8 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              />
            </button>
            {menuOpen && (
              <div
                className={`absolute right-0 mt-2 w-56 ${
                  isDarkMode
                    ? "bg-[#2C2C2E] border-gray-600"
                    : "bg-white border-gray-300"
                } border rounded-lg shadow-lg p-4 z-10`}
              >
                <div
                  className={`flex items-center gap-3 pb-3 border-b ${
                    isDarkMode ? "border-gray-500" : "border-gray-300"
                  }`}
                >
                  <UserCircle
                    className={`w-10 h-10 ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  />
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {userData || "Usuario"}
                    </p>
                    <p
                      className={`text-xs ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {user.email || ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setMenuOpen(false);
                  }}
                  className={`flex items-center w-full mt-3 text-sm ${
                    isDarkMode
                      ? "text-red-500 hover:bg-gray-800"
                      : "text-red-600 hover:bg-gray-100"
                  } p-2 rounded transition`}
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
              className={`border border-[#FF9500] font-semibold text-[#FF9500] py-2 px-4 rounded-lg hover:bg-[#FF9500] hover:text-${
                isDarkMode ? "white" : "gray-900"
              } transition`}
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/registro"
              className={`bg-[#FF9500] border border-transparent font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              } py-2 px-4 rounded-lg hover:bg-transparent hover:border-[#FF9500] hover:text-[#FF9500] transition`}
            >
              Registrarse
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

const MobileMenu: React.FC<{
  user: User | null;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}> = ({ user, mobileMenuOpen, setMobileMenuOpen }) => {
  const { isDarkMode } = useTheme();
  return mobileMenuOpen ? (
    <div
      className={`md:hidden ${
        isDarkMode ? "bg-[#282c3c] border-gray-700" : "bg-white border-gray-300"
      } font-medium border-t px-2 py-2`}
    >
      <Link
        to="/"
        className={`block py-2 hover:text-[#FF9500] transition ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        Inicio
      </Link>
      <Link
        to="/nosotros"
        className={`block py-2 hover:text-[#FF9500] transition ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        Nosotros
      </Link>
      <Link
        to="/modulos"
        className={`block py-2 hover:text-[#FF9500] transition ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        Módulos
      </Link>
      <Link
        to="/contacto"
        className={`block py-2 hover:text-[#FF9500] transition ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        Contacto
      </Link>
      {user && (
        <>
          <Link
            to="/dashboard"
            className={`block py-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            } hover:text-[#FF9500] transition`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          <div className="py-2">
            <NotificationCenter />
          </div>
        </>
      )}
      {user ? (
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            setMobileMenuOpen(false);
          }}
          className={`w-full text-left py-2 ${
            isDarkMode
              ? "text-red-500 hover:bg-gray-800"
              : "text-red-600 hover:bg-gray-100"
          } p-2 rounded transition`}
        >
          <LogOut className="w-5 h-5 inline-block mr-2" />
          Cerrar sesión
        </button>
      ) : (
        <>
          <Link
            to="/login"
            className={`block py-2 hover:text-[#FF9500] transition ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Iniciar Sesión
          </Link>
          <Link
            to="/registro"
            className={`block py-2 hover:text-[#FF9500] transition ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Registrarse
          </Link>
        </>
      )}
    </div>
  ) : null;
};

const Navbar: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        menuOpen
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const fetchUser = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data?.user ?? null);
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
    <header
      className={`px-4 ${
        isDarkMode
          ? "bg-[#282c3c] border-[#3B4252]"
          : "bg-white border-gray-300"
      } border-b`}
    >
      <nav className="container mx-auto my-2 px-4 h-16 flex items-center justify-between md:my-4 lg:my-0">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-6 h-6 text-[#ff9404]" />
          <Link
            to="/"
            className={`text-xl font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
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
          className={`md:hidden ${isDarkMode ? "text-white" : "text-gray-900"}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
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
