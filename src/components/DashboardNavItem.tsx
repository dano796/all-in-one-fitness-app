import React from "react";
import { Link } from "react-router-dom";

interface DashboardNavItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  showLabel: boolean;
  onClick?: () => void; // New optional onClick prop
}

const DashboardNavItem: React.FC<DashboardNavItemProps> = ({
  to,
  label,
  icon,
  showLabel,
  onClick,
}) => {
  return (
    <Link
      to={to}
      className={`flex items-center text-white hover:text-[#ff9404] transition-all duration-300 ${
        showLabel ? "justify-start pl-6" : "justify-center"
      } w-full`}
      onClick={onClick} // Add the onClick handler
    >
      {icon}
      {showLabel && <span className="ml-3">{label}</span>}
    </Link>
  );
};

export default DashboardNavItem;
