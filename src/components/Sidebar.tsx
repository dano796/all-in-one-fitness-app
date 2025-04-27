import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Agregamos useLocation
import { GiGymBag } from "react-icons/gi";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { MdNoFood } from "react-icons/md";
import { FaGlassWater } from "react-icons/fa6";
import { IoFootstepsSharp } from "react-icons/io5";
import { BiSolidFoodMenu } from "react-icons/bi";
import { GiProgression } from "react-icons/gi";
import {
  Dumbbell,
  Settings,
  LogOut,
  Calculator,
  Weight,
  ChevronRight,
  ChevronLeft,
  Menu,
  Camera,
  X,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { supabase } from "../lib/supabaseClient";
import DashboardNavItem from "./DashboardNavItem";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Hook para obtener la ruta actual
  const logout = useAuthStore((state) => state.logout);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

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

  // Cerrar sidebar al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        isMobileOpen
      ) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileOpen]);

  return (
    <>
      {/* Overlay para bloquear interacciones cuando el sidebar está abierto en móvil */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <button
        onClick={toggleMobile}
        className="fixed z-50 top-4 left-4 sm:hidden bg-[#ff9404] text-white p-2 rounded-lg shadow-lg"
        aria-label={isMobileOpen ? "Cerrar menú" : "Abrir menú"}
      >
        {isMobileOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      <aside
        ref={sidebarRef}
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
                <MdOutlineSpaceDashboard  className="h-5 w-5 sm:h-6 sm:w-6 hover:text-[#ff9404] transition-all duration-300" />
              }
              onClick={handleNavItemClick}
              isActive={location.pathname === "/dashboard"} // Verificamos si la ruta es activa
            />
            <DashboardNavItem
              to="/routines"
              label="Rutinas"
              showLabel={isExpanded || isMobileOpen}
              icon={
                <GiGymBag className="h-5 w-5 sm:h-6 sm:w-6 hover:text-[#ff9404] transition-all duration-300" />
              }
              onClick={handleNavItemClick}
              isActive={location.pathname === "/routines"}
            />
            <DashboardNavItem
              to="/foodDashboard"
              label="Ingesta Calórica"
              showLabel={isExpanded || isMobileOpen}
              icon={
                <MdNoFood  className="h-5 w-5 sm:h-6 sm:w-6 hover:text-[#ff9404] transition-all duration-300" />
              }
              onClick={handleNavItemClick}
              isActive={location.pathname === "/foodDashboard"}
            />
            <DashboardNavItem
              to="/water"
              label="Hidratación"
              showLabel={isExpanded || isMobileOpen}
              icon={
                <FaGlassWater  className="h-5 w-5 sm:h-6 sm:w-6 hover:text-[#ff9404] transition-all duration-300" />
              }
              onClick={handleNavItemClick}
              isActive={location.pathname === "/water"}
            />
            <DashboardNavItem
              to="/activity"
              label="Actividad"
              showLabel={isExpanded || isMobileOpen}
              icon={
                <IoFootstepsSharp  className="h-5 w-5 sm:h-6 sm:w-6 hover:text-[#ff9404] transition-all duration-300" />
              }
              onClick={handleNavItemClick}
              isActive={location.pathname === "/activity"}
            />
            <DashboardNavItem
              to="/calorie-calculator"
              label="Calculadora de Calorías"
              showLabel={isExpanded || isMobileOpen}
              icon={
                <Calculator className="h-5 w-5 sm:h-6 sm:w-6 hover:text-[#ff9404] transition-all duration-300" />
              }
              onClick={handleNavItemClick}
              isActive={location.pathname === "/calorie-calculator"}
            />
            <DashboardNavItem
              to="/onerm-calculator"
              label="Calculadora RM"
              showLabel={isExpanded || isMobileOpen}
              icon={
                <Weight className="h-5 w-5 sm:h-6 sm:w-6 hover:text-[#ff9404] transition-all duration-300" />
              }
              onClick={handleNavItemClick}
              isActive={location.pathname === "/onerm-calculator"}
            />
            <DashboardNavItem
              to="/rm-progress"
              label="Progreso RM"
              showLabel={isExpanded || isMobileOpen}
              icon={
                <GiProgression  className="h-5 w-5 sm:h-6 sm:w-6 hover:text-[#ff9404] transition-all duration-300" />
              }
              onClick={handleNavItemClick}
              isActive={location.pathname === "/rm-progress"}
            />
            <DashboardNavItem
              to="/foodsearchia"
              label="Registro con IA"
              showLabel={isExpanded || isMobileOpen}
              icon={
                <Camera className="h-5 w-5 sm:h-6 sm:w-6 hover:text-[#ff9404] transition-all duration-300" />
              }
              onClick={handleNavItemClick}
              isActive={location.pathname === "/foodsearchia"}
            />
            <DashboardNavItem
              to="/search-recipes"
              label="Buscar Recetas"
              showLabel={isExpanded || isMobileOpen}
              icon={
                <BiSolidFoodMenu className="h-5 w-5 sm:h-6 sm:w-6 hover:text-[#ff9404] transition-all duration-300" />
              }
              onClick={handleNavItemClick}
              isActive={location.pathname === "/search-recipes"}
            />
          </nav>

          <div className="space-y-5 sm:space-y-6 pb-6 sm:pb-8 mt-auto w-full">
            <DashboardNavItem
              to="/settings"
              label="Ajustes"
              showLabel={isExpanded || isMobileOpen}
              icon={
                <Settings className="h-5 w-5 sm:h-6 sm:w-6 hover:text-[#ff9404] transition-all duration-300" />
              }
              onClick={handleNavItemClick}
              isActive={location.pathname === "/settings"}
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
                  <span className="ml-3">Salir</span>
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