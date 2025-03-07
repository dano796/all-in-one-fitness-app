import { Dumbbell } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full border-t border-gray-300 py-6 bg-gray-100">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4">
        <p className="text-sm text-gray-600">&copy; 2025 All In One Fitness. Todos los derechos reservados.</p>

        <div className="flex items-center space-x-2">
          <Dumbbell className="h-6 w-6 text-gray-900" />
          <span className="text-lg font-semibold pr-2">All In One Fitness</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
