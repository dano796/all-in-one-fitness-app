import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Dumbbell,
  Home,
  Calendar,
  Droplets,
  Activity,
  Settings,
  LogOut,
  Utensils,
  Calculator,
  Weight,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { supabase } from "../lib/supabaseClient";
import DashboardNavItem from "./DashboardNavItem";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error al cerrar sesión:", error.message);
      return;
    }
    logout();
    navigate("/");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <aside
      className={`w-20 h-screen bg-[#1C1C1E] flex flex-col items-center py-4 sm:py-6 shadow-xl fixed top-0 z-40 transform transition-transform duration-300 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } sm:translate-x-0`}
    >
      <button
        onClick={toggleSidebar}
        className="absolute -right-10 top-4 sm:hidden bg-[#ff9404] text-white p-2 rounded-r-lg shadow-lg"
      >
        {isSidebarOpen ? (
          <ChevronLeft className="h-6 w-6" />
        ) : (
          <ChevronRight className="h-6 w-6" />
        )}
      </button>

      <Link to="/" className="mb-6 sm:mb-8">
        <Dumbbell className="h-8 w-8 sm:h-9 sm:w-9 text-[#ff9404]" />
      </Link>

      <nav className="flex-1 flex flex-col justify-center space-y-4 sm:space-y-6">
        <DashboardNavItem
          to="/dashboard"
          icon={
            <Home className="h-5 w-5 sm:h-6 sm:w-6 hover:text-[#ff9404] transition-all duration-300" />
          }
        />
        <DashboardNavItem
          to="/foodsearch"
          icon={
            <Utensils className="h-5 w-5 sm:h-6 sm:w-6 hover:text-[#ff9404] transition-all duration-300" />
          }
        />
        <DashboardNavItem
          to="/workouts"
          icon={
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6 hover:text-[#ff9404] transition-all duration-300" />
          }
        />
        <DashboardNavItem
          to="/water"
          icon={
            <Droplets className="h-5 w-5 sm:h-6 sm:w-6 hover:text-[#ff9404] transition-all duration-300" />
          }
        />
        <DashboardNavItem
          to="/activity"
          icon={
            <Activity className="h-5 w-5 sm:h-6 sm:w-6 hover:text-[#ff9404] transition-all duration-300" />
          }
        />
        <DashboardNavItem
          to="/calorie-calculator"
          icon={
            <Calculator className="h-5 w-5 sm:h-6 sm:w-6 hover:text-[#ff9404] transition-all duration-300" />
          }
        />
        <DashboardNavItem
          to="/onerm-calculator"
          icon={
            <Weight className="h-5 w-5 sm:h-6 sm:w-6 hover:text-[#ff9404] transition-all duration-300" />
          }
        />
      </nav>

      <div className="space-y-4 sm:space-y-6 mt-auto">
        <DashboardNavItem
          to="/settings"
          icon={
            <Settings className="h-5 w-5 sm:h-6 sm:w-6 hover:text-[#ff9404] transition-all duration-300" />
          }
        />
        <button
          onClick={handleLogout}
          className="flex flex-col items-center text-white hover:text-red-500 transition-all duration-300"
        >
          <LogOut className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>
    </aside>
  );
};

export default React.memo(Sidebar);