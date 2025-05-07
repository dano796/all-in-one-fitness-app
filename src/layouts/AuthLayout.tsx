// src/layouts/AuthLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import NotificationCenter from "../components/NotificationCenter";
import ImportantAlert from "../components/ImportantAlert";
import { useTheme } from "../pages/ThemeContext";

const AuthLayout: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-[#282c3c] text-white' : 'bg-[#F8F9FA] text-[#212529]'}`}>
      <ImportantAlert />
      <div className="absolute top-4 right-4 z-50">
        <NotificationCenter />
      </div>
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default React.memo(AuthLayout);
