// src/layouts/FoodSearchLayout.tsx
import React from "react";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../pages/ThemeContext";

interface FoodSearchLayoutProps {
  children: React.ReactNode;
}

const FoodSearchLayout: React.FC<FoodSearchLayoutProps> = ({ children }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`flex h-screen transition-colors duration-300 ${isDarkMode ? "bg-[#282c3c] text-white" : "bg-white-100 text-gray-900"}`}>
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className={`max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 ${isDarkMode ? "bg-[#282c3c]" : "bg-white"}`}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default React.memo(FoodSearchLayout);