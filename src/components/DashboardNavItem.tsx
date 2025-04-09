import React from "react";
import { Link } from "react-router-dom";

interface DashboardNavItemProps {
  to: string;
  icon: React.ReactNode;
  label?: string;
  showLabel?: boolean;
}

const DashboardNavItem: React.FC<DashboardNavItemProps> = ({
  to,
  icon,
  label = "",
  showLabel = false,
}) => {
  return (
    <Link
      to={to}
      className={`flex items-center text-gray-300 hover:text-[#ff9404] transition-all duration-300 w-full ${
        showLabel ? "justify-start pl-6" : "justify-center"
      }`}
    >
      {icon}
      {showLabel && label && <span className="ml-3">{label}</span>}
    </Link>
  );
};

export default DashboardNavItem;
