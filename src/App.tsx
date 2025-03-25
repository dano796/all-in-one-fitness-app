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
import { User } from "@supabase/supabase-js";

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
const Routines = lazy(() => import("./pages/Routines"));
const RoutineDetails = lazy(() => import("./pages/RoutineDetails")); // Nueva página

// Layouts
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import FoodSearchLayout from "./layouts/FoodSearchLayout";
import WaterLayout from "./layouts/WaterLayout";
import CalorieCalculatorLayout from "./layouts/CalorieCalculatorLayout";
import OneRMCalculatorLayout from "./layouts/OneRMCalculatorLayout";
import ExerciseList from "./components/ExerciseList";

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

// Protected Routes
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
  {
    path: "/routines",
    layout: DashboardLayout,
    component: Routines,
  },
  {
    path: "/routine-details",
    layout: DashboardLayout,
    component: RoutineDetails, // Nueva ruta
  },
  {
    path: "/ejercicios",
    layout: DashboardLayout,
    component: ExerciseList,
  },
];

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (mounted) {
        setUser(user);
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
        <Route path="/" element={<LandingPage />} />
        <Route path="/nosotros" element={<AboutPage />} />
        <Route path="/modulos" element={<ModulesPage />} />
        <Route path="/contacto" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
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