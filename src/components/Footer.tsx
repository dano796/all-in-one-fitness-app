import { Dumbbell } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full py-6 bg-[#282c3c] border-t border-[#3B4252]">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4">
        <p className="px-4 text-sm text-gray-400">
          &copy; 2025 All In One Fitness. Todos los derechos reservados.
        </p>

        <div className="flex items-center space-x-2">
          <Dumbbell className="h-6 w-6 text-[#ff9404]" />
          <span className="text-lg font-semibold pr-2">
            All In One Fitness App
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
