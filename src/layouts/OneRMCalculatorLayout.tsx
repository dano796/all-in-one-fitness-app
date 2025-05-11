// src/layouts/OneRMCalculatorLayout.tsx
import React from "react";
import Sidebar from "../components/Sidebar";
import NotificationCenter from "../components/NotificationCenter";
import ImportantAlert from "../components/ImportantAlert";
import { useTheme } from "../pages/ThemeContext";

interface OneRMCalculatorLayoutProps {
  children: React.ReactNode;
}

const OneRMCalculatorLayout: React.FC<OneRMCalculatorLayoutProps> = ({
  children,
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`flex h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-[#282c3c] text-white" : "bg-[#F8F9FA] text-gray-900"
      }`}
    >
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <ImportantAlert />
        <div
          className={`max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 ${
            isDarkMode ? "bg-[#282c3c]" : "bg-[#F8F9FA]"
          }`}
        >
          {children}
          <div className="absolute top-4 right-4 z-50">
            <NotificationCenter />
          </div>
        </div>
      </main>
    </div>
  );
};

export default React.memo(OneRMCalculatorLayout);
