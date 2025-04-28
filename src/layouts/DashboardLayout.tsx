// src/layouts/DashboardLayout.tsx
import React from "react";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../pages/ThemeContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`flex h-screen ${
        isDarkMode ? "bg-[#282c3c] text-white" : "bg-[#F8F9FA] text-[#212529]"
      } transition-colors duration-300`}
    >
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
};

export default React.memo(DashboardLayout);
