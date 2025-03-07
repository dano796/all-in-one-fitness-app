import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dumbbell, Home, User, Calendar, Droplets, Activity, Settings, LogOut } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { supabase } from "../supabaseClient";
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
    <aside className="w-20 bg-black flex flex-col items-center py-8">
      <Link to="/" className="mb-8">
        <Dumbbell className="h-8 w-8 text-white" />
      </Link>

      <nav className="flex-1 space-y-8">
        <DashboardNavItem to="/dashboard" icon={<Home className="h-6 w-6" />} />
        <DashboardNavItem to="/profile" icon={<User className="h-6 w-6" />} />
        <DashboardNavItem to="/workouts" icon={<Calendar className="h-6 w-6" />} />
        <DashboardNavItem to="/water" icon={<Droplets className="h-6 w-6" />} />
        <DashboardNavItem to="/activity" icon={<Activity className="h-6 w-6" />} />
      </nav>

      <div className="mt-auto space-y-8">
        <DashboardNavItem to="/settings" icon={<Settings className="h-6 w-6" />} />
        <button
          onClick={handleLogout}
          className="flex flex-col items-center text-gray-400 hover:text-white"
        >
          <LogOut className="h-6 w-6" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
