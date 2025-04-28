import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../pages/ThemeContext";

interface DashboardNavItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  showLabel: boolean;
  onClick?: () => void;
  isActive?: boolean;
}

const DashboardNavItem: React.FC<DashboardNavItemProps> = ({
  to,
  label,
  icon,
  showLabel,
  onClick,
  isActive = false,
}) => {
  const { isDarkMode } = useTheme();

  return (
    <Link
      to={to}
      className={`flex items-center w-full transition-all duration-300 ${
        showLabel ? "justify-start pl-6" : "justify-center"
      } ${
        isActive
          ? "text-[#ff9404]" // Solo cambia el color del texto/icono
          : isDarkMode
          ? "text-white hover:text-[#ff9404]" // Estilo para dark mode
          : "text-[#212529] hover:text-[#ff9404]" // Estilo para light mode con nuevo color
      }`}
      onClick={onClick}
    >
      {icon}
      {showLabel && <span className="ml-3">{label}</span>}
    </Link>
  );
};

export default DashboardNavItem;
