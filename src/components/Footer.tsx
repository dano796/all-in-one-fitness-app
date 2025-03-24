import React from "react";
import { Dumbbell } from "lucide-react";

const COPYRIGHT_TEXT = "© 2025 All In One Fitness App. Todos los derechos reservados.";
const APP_NAME = "All In One Fitness App";

const Footer = () => {
  return (
    <footer className="w-full py-6 bg-[#282c3c] border-t border-[#3B4252]">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4">
        <p className="px-4 text-sm text-gray-400 text-center my-4 md:my-1 md:text-left">
          {COPYRIGHT_TEXT}
        </p>

        <div className="flex items-center space-x-2 my-4 md:my-1 px-4">
          <Dumbbell className="h-6 w-6 text-[#ff9404]" />
          <span className="text-lg font-semibold">{APP_NAME}</span>
        </div>
      </div>
    </footer>
  );
};

export default React.memo(Footer);