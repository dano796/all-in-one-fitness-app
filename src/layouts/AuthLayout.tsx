import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-6 h-6" />
            <Link to="/" className="text-xl font-semibold">
              All In One Fitness App
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/" className="nav-link">Inicio</Link>
            <Link to="/nosotros" className="nav-link">Nosotros</Link>
            <Link to="/modulos" className="nav-link">Módulos</Link>
            <Link to="/contacto" className="nav-link">Contacto</Link>
            <Link to="/login" className="btn btn-outline">Iniciar Sesión</Link>
            <Link to="/registro" className="btn btn-primary">Registrarse</Link>
          </div>
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-4 text-center text-sm text-gray-600">
        <p>Copyright © 2025 All In One Fitness App. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default AuthLayout;