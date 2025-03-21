import React from "react";
import { Link } from "react-router-dom";

interface DashboardNavItemProps {
  to: string;
  icon: React.ReactNode;
}

const DashboardNavItem: React.FC<DashboardNavItemProps> = ({ to, icon }) => {
  return (
    <Link
      to={to}
      className="flex flex-col items-center text-[#FFFFFF] hover:text-[#ff9404] bg-[#282c3c] p-2 rounded-lg"
    >
      {icon}
    </Link>
  );
};

export default DashboardNavItem;
