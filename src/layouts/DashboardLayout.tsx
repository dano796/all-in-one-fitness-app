import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Dumbbell,
  Home,
  User,
  Calendar,
  Droplets,
  Activity,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-20 bg-black flex flex-col items-center py-8">
        <Link to="/" className="mb-8">
          <Dumbbell className="h-8 w-8 text-white" />
        </Link>
        <nav className="flex-1 space-y-8">
          <Link
            to="/dashboard"
            className="flex flex-col items-center text-gray-400 hover:text-white"
          >
            <Home className="h-6 w-6" />
          </Link>
          <Link
            to="/profile"
            className="flex flex-col items-center text-gray-400 hover:text-white"
          >
            <User className="h-6 w-6" />
          </Link>
          <Link
            to="/workouts"
            className="flex flex-col items-center text-gray-400 hover:text-white"
          >
            <Calendar className="h-6 w-6" />
          </Link>
          <Link
            to="/water"
            className="flex flex-col items-center text-gray-400 hover:text-white"
          >
            <Droplets className="h-6 w-6" />
          </Link>
          <Link
            to="/activity"
            className="flex flex-col items-center text-gray-400 hover:text-white"
          >
            <Activity className="h-6 w-6" />
          </Link>
        </nav>
        <div className="mt-auto space-y-8">
          <Link
            to="/settings"
            className="flex flex-col items-center text-gray-400 hover:text-white"
          >
            <Settings className="h-6 w-6" />
          </Link>
          <button
            onClick={handleLogout}
            className="flex flex-col items-center text-gray-400 hover:text-white"
          >
            <LogOut className="h-6 w-6" />
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;