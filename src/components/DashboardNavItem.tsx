import React from 'react';
import { Link } from 'react-router-dom';

interface DashboardNavItemProps {
  to: string;
  icon: React.ReactNode;
}

const DashboardNavItem: React.FC<DashboardNavItemProps> = ({ to, icon }) => {
  return (
    <Link to={to} className="flex flex-col items-center text-[#1C1C1E] hover:text-[#FF3B30]">
      {icon}
    </Link>
  );
};

export default DashboardNavItem;
