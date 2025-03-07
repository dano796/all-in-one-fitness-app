import { Dumbbell } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full border-t border-[#FF9500] py-6 bg-[#111827]">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4">
        <p className="text-sm text-gray-400">
          &copy; 2025 All In One Fitness. Todos los derechos reservados.
        </p>

        <div className="flex items-center space-x-2">
          <Dumbbell className="h-6 w-6 text-[#FF9500]" />
          <span className="text-lg font-semibold text-white pr-2">All In One Fitness</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
