import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dumbbell, Home, User, Calendar, Droplets, Activity, Settings, LogOut } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { supabase } from "../lib/supabaseClient";
import DashboardNavItem from "./DashboardNavItem";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error al cerrar sesión:", error.message);
      return;
    }

    logout(); // Actualiza el estado de autenticación
    navigate("/"); // Redirige al login
  };

  return (
    <aside className="w-20 h-screen bg-[#1C1C1E] flex flex-col items-center py-8 shadow-xl">
      {/* Logo */}
      <Link to="/" className="mb-10">
        <Dumbbell className="h-9 w-9 text-[#ff9404]" />
      </Link>

      {/* Navegación principal */}
      <nav className="flex-1 space-y-6 mt-32  ">
        <DashboardNavItem to="/dashboard" icon={<Home className="h-6 w-6 hover:text-[#ff9404] transition-all duration-300" />} />
        <DashboardNavItem to="/profile" icon={<User className="h-6 w-6 hover:text-[#ff9404] transition-all duration-300" />} />
        <DashboardNavItem to="/workouts" icon={<Calendar className="h-6 w-6 hover:text-[#ff9404] transition-all duration-300" />} />
        <DashboardNavItem to="/water" icon={<Droplets className="h-6 w-6 hover:text-[#ff9404] transition-all duration-300" />} />
        <DashboardNavItem to="/activity" icon={<Activity className="h-6 w-6 hover:text-[#ff9404] transition-all duration-300" />} />
      </nav>

      {/* Configuración y logout */}
      <div className="space-y-6">
        <DashboardNavItem to="/settings" icon={<Settings className="h-6 w-6 hover:text-[#ff9404] transition-all duration-300" />} />
        <button
          onClick={handleLogout}
          className="flex flex-col items-center text-white hover:text-red-500 transition-all duration-300 ml-2"
        >
          <LogOut className="h-6 w-6" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
