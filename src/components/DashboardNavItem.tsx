import React from 'react';
import { Link } from 'react-router-dom';

interface DashboardNavItemProps {
  to: string;
  icon: React.ReactNode;
}

const DashboardNavItem: React.FC<DashboardNavItemProps> = ({ to, icon }) => {
  return (
    <Link to={to} className="flex flex-col items-center text-gray-400 hover:text-white">
      {icon}
    </Link>
  );
};

export default DashboardNavItem;
