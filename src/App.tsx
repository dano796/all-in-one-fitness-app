import React, { useEffect, useState, Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { supabase } from "./lib/supabaseClient";
import Loader from "./components/Loader";
import { User } from "@supabase/supabase-js"; // Importamos el tipo User de Supabase

// Lazy-loaded components
const LandingPage = lazy(() => import("./pages/LandingPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ModulesPage = lazy(() => import("./pages/ModulesPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const FoodSearch = lazy(() => import("./components/FoodSearch"));
const WaterTracker = lazy(() => import("./components/WaterTracker"));
const ComidasRegistro = lazy(() => import("./pages/RegisteredFoods"));
const CalorieCalculator = lazy(() => import("./components/CalorieCalculator"));
const FoodQuantityAdjust = lazy(() => import("./components/FoodQuantityAdjust"));
const OneRMCalculator = lazy(() => import("./components/OneRepMaxCalculator"));

// Layouts
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import FoodSearchLayout from "./layouts/FoodSearchLayout";
import WaterLayout from "./layouts/WaterLayout";
import CalorieCalculatorLayout from "./layouts/CalorieCalculatorLayout";
import OneRMCalculatorLayout from "./layouts/OneRMCalculatorLayout";

// Protected Route Component
const ProtectedRoute = ({ children, user }: { children: React.ReactNode; user: User | null }) =>
  user ? children : <Navigate to="/login" />;

// Food Search Protected Route Component
const FoodSearchProtectedRoute = ({ children, user }: { children: React.ReactNode; user: User | null }) => {
  const location = useLocation();
  const fromAddButton = location.state?.fromAddButton || false;

  if (!user) return <Navigate to="/login" />;
  if (!fromAddButton) return <Navigate to="/dashboard" />;
  return children;
};

// Route configurations
const publicRoutes = [
  { path: "/", component: LandingPage },
  { path: "/nosotros", component: AboutPage },
  { path: "/modulos", component: ModulesPage },
  { path: "/contacto", component: ContactPage },
  { path: "/login", component: LoginPage },
  { path: "/registro", component: RegisterPage },
  { path: "/reset-password", component: ResetPassword },
];

const protectedRoutes = [
  {
    path: "/dashboard",
    layout: DashboardLayout,
    component: Dashboard,
  },
  {
    path: "/water",
    layout: WaterLayout,
    component: WaterTracker,
  },
  {
    path: "/comidas",
    layout: FoodSearchLayout,
    component: ComidasRegistro,
  },
  {
    path: "/calorie-calculator",
    layout: CalorieCalculatorLayout,
    component: CalorieCalculator,
  },
  {
    path: "/onerm-calculator",
    layout: OneRMCalculatorLayout,
    component: OneRMCalculator,
  },
];

function App() {
  const [user, setUser] = useState<User | null>(null); // Tipamos explícitamente el estado como User | null
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (mounted) {
        setUser(user); // Ahora TypeScript sabe que setUser acepta User | null
        setIsLoading(false);
      }
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, session) => setUser(session?.user ?? null)
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const renderRoutes = () => (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        {publicRoutes.map(({ path, component: Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
      </Route>

      {/* Protected Routes */}
      {protectedRoutes.map(({ path, layout: Layout, component: Component }) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute user={user}>
              <Layout>
                <Component />
              </Layout>
            </ProtectedRoute>
          }
        />
      ))}

      {/* Food Search Routes */}
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