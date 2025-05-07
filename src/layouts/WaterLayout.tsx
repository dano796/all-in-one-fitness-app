// src/layouts/WaterLayout.tsx
import React from "react";
import Sidebar from "../components/Sidebar";
import NotificationCenter from "../components/NotificationCenter";
import ImportantAlert from "../components/ImportantAlert";
import { useTheme } from "../pages/ThemeContext";

interface WaterLayoutProps {
  children: React.ReactNode;
}

const WaterLayout: React.FC<WaterLayoutProps> = ({ children }) => {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`flex h-screen ${
        isDarkMode ? "bg-[#282c3c] text-white" : "bg-[#F8F9FA] text-[#212529]"
      } transition-colors duration-300`}
    >
      <Sidebar />
      <main className="flex-1 overflow-auto relative">
        <ImportantAlert />
        <div className="absolute top-4 right-4 z-50">
          <NotificationCenter />
        </div>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
};

export default React.memo(WaterLayout);
