import React from "react";
import { Link } from "react-router-dom";

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
  return (
    <Link
      to={to}
      className={`flex items-center w-full transition-all duration-300 ${
        showLabel ? "justify-start pl-6" : "justify-center"
      } ${
        isActive
          ? "text-[#ff9404]" // Solo cambia el color del texto/icono
          : "text-white hover:text-[#ff9404]" // Estilos originales para item no activo
      }`}
      onClick={onClick}
    >
      {icon}
      {showLabel && <span className="ml-3">{label}</span>}
    </Link>
  );
};

export default DashboardNavItem;