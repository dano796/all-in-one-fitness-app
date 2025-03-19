import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AboutPage from "./pages/AboutPage";
import ModulesPage from "./pages/ModulesPage";
import ContactPage from "./pages/ContactPage";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPassword from "./pages/ResetPassword";
import { supabase } from "./lib/supabaseClient";
import FoodSearch from "./components/FoodSearch";
import FoodSearchLayout from "./layouts/FoodSearchLayout";
import WaterLayout from "./layouts/WaterLayout";
import WaterTracker from "./components/WaterTracker";
import ComidasRegistro from "./pages/RegisteredFoods";
import CalorieCalculator from "./components/CalorieCalculator";
import CalorieCalculatorLayout from "./layouts/CalorieCalculatorLayout";

// Componente de protección para rutas generales
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#282c3c]">
        <div className="text-6xl font-bold text-[#FF9500] flex space-x-4">
          <span className="inline-block animate-accordion">All</span>
          <span className="inline-block animate-accordion animation-delay-200">
            In
          </span>
          <span className="inline-block animate-accordion animation-delay-400">
            One
          </span>
        </div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

// Componente de protección específico para la ruta /foodsearch
const FoodSearchProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#282c3c]">
        <div className="text-6xl font-bold text-[#FF9500] flex space-x-4">
          <span className="inline-block animate-accordion">All</span>
          <span className="inline-block animate-accordion animation-delay-200">
            In
          </span>
          <span className="inline-block animate-accordion animation-delay-400">
            One
          </span>
        </div>
      </div>
    );
  }

  // Verificar si el usuario está autenticado
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Verificar si la navegación proviene del botón + (mirando el estado)
  const fromAddButton = location.state?.fromAddButton || false;
  if (!fromAddButton) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route element={<AuthLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/nosotros" element={<AboutPage />} />
          <Route path="/modulos" element={<ModulesPage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/foodsearch"
          element={
            <FoodSearchProtectedRoute>
              <FoodSearchLayout>
                <FoodSearch />
              </FoodSearchLayout>
            </FoodSearchProtectedRoute>
          }
        />
        <Route
          path="/water"
          element={
            <ProtectedRoute>
              <WaterLayout>
                <WaterTracker />
              </WaterLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/comidas"
          element={
            <ProtectedRoute>
              <FoodSearchLayout>
                <ComidasRegistro />
              </FoodSearchLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/calorie-calculator"
          element={
            <ProtectedRoute>
              <CalorieCalculatorLayout>
                <CalorieCalculator />
              </CalorieCalculatorLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;