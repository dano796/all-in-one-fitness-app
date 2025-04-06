import React from "react";
import { Link } from "react-router-dom";

interface DashboardNavItemProps {
  to: string;
  icon: React.ReactNode;
  title?: string; 
  className?: string; 
}

const DashboardNavItem: React.FC<DashboardNavItemProps> = ({
  to,
  icon,
  title,
  className = "",
}) => {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center text-[#FFFFFF] hover:text-[#ff9404] bg-[#282c3c] p-2 rounded-lg ${className}`}
    >
      {icon}
      {title && <span className="text-xs mt-1">{title}</span>}
    </Link>
  );
};

export default React.memo(DashboardNavItem);