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
  LineChart,
  Menu,
  Search, // Añadido para FoodSearchIA
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { supabase } from "../lib/supabaseClient";
import DashboardNavItem from "./DashboardNavItem";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error al cerrar sesión:", error.message);
      return;
    }
    logout();
    navigate("/");
    if (isExpanded) {
      setIsExpanded(false);
    }
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const toggleMobile = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const handleNavItemClick = () => {
    if (isExpanded) {
      setIsExpanded(false);
    }
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={toggleMobile}
        className="fixed z-50 top-4 left-4 sm:hidden bg-[#ff9404] text-white p-2 rounded-lg shadow-lg"
      >
        <Menu className="h-6 w-6" />
      </button>

      <aside
        className={`h-screen bg-[#1C1C1E] flex flex-col items-center py-4 sm:py-6 shadow-xl fixed top-0 z-40 transition-all duration-300 
        ${isExpanded ? "sm:w-56" : "sm:w-20"} 
        ${isMobileOpen ? "w-56 translate-x-0" : "w-20 -translate-x-full"} 
        sm:translate-x-0 overflow-hidden`}
      >
        <div className="flex flex-col items-center w-full h-full">
          <Link
            to="/"
            className="flex items-center justify-center mb-6 sm:mb-4"
            onClick={handleNavItemClick}
          >
            <Dumbbell className="h-8 w-8 sm:h-9 sm:w-9 text-[#ff9404]" />
            {isExpanded && (
              <span className="ml-3 font-bold text-white hidden sm:block">
                All In One Fitness
              </span>
            )}
          </Link>

          <button
            onClick={toggleExpand}
            className="text-white p-1 rounded-md hidden sm:flex justify-center items-center mb-6"
          >
            {isExpanded ? (
              <ChevronLeft className="h-5 w-5 text-[#ff9404]" />
            ) : (
              <ChevronRight className="h-5 w-5 text-[#ff9404]" />
            )}
          </button>

          <nav className="flex flex-col justify-center space-y-5 sm:space-y-6 w-full">
            <DashboardNavItem
              to="/dashboard"
              label="Dashboard"
              showLabel={isExpanded || isMobileOpen}
              icon={
                <Home className="h-5 w-5 sm:h-6 sm:w-6 hover:text-[#ff9404] transition-all duration-300" />
              }
              onClick={handleNavItemClick}
            />
            <DashboardNavItem
              to="/routines"
              label="Routines"
              showLabel={isExpanded || isMobileOpen}
              icon={
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 hover:text-[#ff9404] transition-all duration-300" />
              }
              onClick={handleNavItemClick}
            />
            <DashboardNavItem
              to="/foodDashboard"
              label="Food"
              showLabel={isExpanded || isMobileOpen}
              icon={
                <Utensils className="h-5 w-5 sm:h-6 sm:w-6 hover:text-[#ff9404] transition-all duration-300" />
              }
              onClick={handleNavItemClick}
            />
            <DashboardNavItem
              to="/water"
              label="Water"
              showLabel={isExpanded || isMobileOpen}
              icon={
                <Droplets className="h-5 w-5 sm:h-6 sm:w-6 hover:text-[#ff9404] transition-all duration-300" />
              }
              onClick={handleNavItemClick}
            />
            <DashboardNavItem
              to="/activity"
              label="Activity"
              showLabel={isExpanded || isMobileOpen}
              icon={
                <Activity className="h-5 w-5 sm:h-6 sm:w-6 hover:text-[#ff9404] transition-all duration-300" />
              }
              onClick={handleNavItemClick}
            />
            <DashboardNavItem
              to="/calorie-calculator"
              label="Calorie Calculator"
              showLabel={isExpanded || isMobileOpen}
              icon={
                <Calculator className="h-5 w-5 sm:h-6 sm:w-6 hover:text-[#ff9404] transition-all duration-300" />
              }
              onClick={handleNavItemClick}
            />
            <DashboardNavItem
              to="/onerm-calculator"
              label="1RM Calculator"
              showLabel={isExpanded || isMobileOpen}
              icon={
                <Weight className="h-5 w-5 sm:h-6 sm:w-6 hover:text-[#ff9404] transition-all duration-300" />
              }
              onClick={handleNavItemClick}
            />
            <DashboardNavItem
              to="/rm-progress"
              label="RM Progress"
              showLabel={isExpanded || isMobileOpen}
              icon={
                <LineChart className="h-5 w-5 sm:h-6 sm:w-6 hover:text-[#ff9404] transition-all duration-300" />
              }
              onClick={handleNavItemClick}
            />
            
            <DashboardNavItem
              to="/foodsearchia"
              label="FoodSearchIA"
              showLabel={isExpanded || isMobileOpen}
              icon={
                <Search className="h-5 w-5 sm:h-6 sm:w-6 hover:text-[#ff9404] transition-all duration-300" />
              }
              onClick={handleNavItemClick}
            />
          </nav>

          <div className="space-y-5 sm:space-y-6 pb-6 sm:pb-8 mt-auto w-full">
            <DashboardNavItem
              to="/settings"
              label="Settings"
              showLabel={isExpanded || isMobileOpen}
              icon={
                <Settings className="h-5 w-5 sm:h-6 sm:w-6 hover:text-[#ff9404] transition-all duration-300" />
              }
              onClick={handleNavItemClick}
            />
            <div
              className={`flex ${
                isExpanded || isMobileOpen
                  ? "justify-start pl-6"
                  : "justify-center"
              } w-full`}
            >
              <button
                onClick={handleLogout}
                className="flex items-center text-white hover:text-red-500 transition-all duration-300"
              >
                <LogOut className="h-5 w-5 sm:h-6 sm:w-6" />
                {(isExpanded || isMobileOpen) && (
                  <span className="ml-3">Logout</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default React.memo(Sidebar);