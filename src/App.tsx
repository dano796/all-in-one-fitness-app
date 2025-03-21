import React, { useEffect, useState, Suspense } from "react";
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
import FoodQuantityAdjust from "./components/FoodQuantityAdjust";
import Loader from "./components/Loader";
import OneRMCalculator from "./components/OneRepMaxCalculator";
import OneRMCalculatorLayout from "./layouts/OneRMCalculatorLayout";

// Protected Route Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  user: unknown;
}> = ({ children, user }) => {
  return user ? <>{children}</> : <Navigate to="/login" />;
};

// Food Search Protected Route Component
const FoodSearchProtectedRoute: React.FC<{
  children: React.ReactNode;
  user: unknown;
}> = ({ children, user }) => {
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" />;
  }

  const fromAddButton = location.state?.fromAddButton || false;
  if (!fromAddButton) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

function App() {
  const [user, setUser] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserWithDelay = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Simular retraso de 2 segundos (2000ms) para todas las rutas
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setUser(user);
      setIsLoading(false);
    };
    fetchUserWithDelay();

    // Escuchar cambios en la autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user ?? null);
      }
    );

    // Limpiar el listener al desmontar
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const renderRoutes = () => (
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
          <ProtectedRoute user={user}>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/foodsearch"
        element={
          <FoodSearchProtectedRoute user={user}>
            <FoodSearchLayout>
              <FoodSearch />
            </FoodSearchLayout>
          </FoodSearchProtectedRoute>
        }
      />
      <Route
        path="/food-quantity-adjust"
        element={
          <FoodSearchLayout>
            <FoodQuantityAdjust />
          </FoodSearchLayout>
        }
      />
      <Route
        path="/water"
        element={
          <ProtectedRoute user={user}>
            <WaterLayout>
              <WaterTracker />
            </WaterLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/comidas"
        element={
          <ProtectedRoute user={user}>
            <FoodSearchLayout>
              <ComidasRegistro />
            </FoodSearchLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calorie-calculator"
        element={
          <ProtectedRoute user={user}>
            <CalorieCalculatorLayout>
              <CalorieCalculator />
            </CalorieCalculatorLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/onerm-calculator"
        element={
          <ProtectedRoute user={user}>
            <OneRMCalculatorLayout>
              <OneRMCalculator />
            </OneRMCalculatorLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );

  return (
    <Router>
      <Suspense fallback={<Loader />}>
        <div className="relative min-h-screen">
          {renderRoutes()}
          {isLoading && <Loader />}
        </div>
      </Suspense>
    </Router>
  );
}

export default App;
