import React from "react";
import { Dumbbell } from "lucide-react";
import { useTheme } from "../pages/ThemeContext";

const COPYRIGHT_TEXT = "© 2025 All In One Fitness App. Todos los derechos reservados.";
const APP_NAME = "All In One Fitness App";

const Footer = () => {
  const { isDarkMode } = useTheme();
  return (
    <footer className={`w-full py-6 ${isDarkMode ? 'bg-[#282c3c] border-[#3B4252]' : 'bg-white border-gray-300'} border-t`}>
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4">
        <p className={`px-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-center my-4 md:my-1 md:text-left`}>
          {COPYRIGHT_TEXT}
        </p>

        <div className="flex items-center space-x-2 my-4 md:my-1 px-4">
          <Dumbbell className="h-6 w-6 text-[#ff9404]" />
          <span className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{APP_NAME}</span>
        </div>
      </div>
    </footer>
  );
};

export default React.memo(Footer);