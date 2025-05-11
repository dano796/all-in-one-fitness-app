import { useEffect, useState, Suspense, lazy } from "react";
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
import { ThemeProvider } from "./pages/ThemeContext";
import ChatBot from "./components/ChatBot";
import { useNotificationStore } from "./store/notificationStore";
import ToastContainer from "./components/ToastContainer";
import { ServiceWorkerUpdate } from "./components/pwa/ServiceWorkerUpdate";
import axios from "axios";
import { registerServiceWorker } from "./utils/serviceWorkerRegistration";
import { offlineSyncManager } from "./utils/offlineSync";

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
const RoutineDetails = lazy(() => import("./pages/RoutineDetails"));
const RMProgressPage = lazy(() => import("./pages/RMProgressPage"));
const Settings = lazy(() => import("./pages/Settings"));
const FoodSearchIAPage = lazy(() => import("./pages/FoodSearchIAPage"));
const SearchRecipes = lazy(() => import("./components/SearchRecipes"));
const SubscriptionPlans = lazy(() => import("./components/SubscriptionPlans"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const Terms = lazy(() => import("./components/terms")); // Nueva ruta para Terms

// Layouts
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import FoodSearchLayout from "./layouts/FoodSearchLayout";
import WaterLayout from "./layouts/WaterLayout";
import CalorieCalculatorLayout from "./layouts/CalorieCalculatorLayout";
import OneRMCalculatorLayout from "./layouts/OneRMCalculatorLayout";
import ExerciseList from "./components/ExerciseList";
import FoodDashboard from "./pages/FoodDashboard";
import RecipeSearchLayout from "./layouts/RecipeLayout";

// Protected Route Component
const ProtectedRoute = ({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User | null;
}) => (user ? children : <Navigate to="/login" />);

// Food Search Protected Route Component
const FoodSearchProtectedRoute = ({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User | null;
}) => {
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
    path: "/foodDashboard",
    layout: DashboardLayout,
    component: FoodDashboard,
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
    component: RoutineDetails,
  },
  {
    path: "/ejercicios",
    layout: DashboardLayout,
    component: ExerciseList,
  },
  {
    path: "/rm-progress",
    layout: DashboardLayout,
    component: RMProgressPage,
  },
  {
    path: "/settings",
    layout: DashboardLayout,
    component: Settings,
  },
  {
    path: "/foodsearchia",
    layout: DashboardLayout,
    component: FoodSearchIAPage,
  },
  {
    path: "/search-recipes",
    layout: RecipeSearchLayout,
    component: SearchRecipes,
  },
  {
    path: "/subscription-plans",
    layout: DashboardLayout,
    component: SubscriptionPlans,
  },
];

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addNotification, setSessionId } = useNotificationStore();

  useEffect(() => {
    let mounted = true;

    const checkCalorieGoal = async (email: string) => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/get-calorie-goal`,
          { params: { email } }
        );
        const hasCalorieGoal = response.data.calorieGoal !== null;

        if (!hasCalorieGoal) {
          addNotification(
            "⚠️ Límite de Calorías no Establecido",
            "Es importante establecer tu límite diario de calorías para un mejor seguimiento de tu dieta. Haz clic aquí para configurarlo ahora.",
            "warning",
            true,
            "calorie-goal",
            true,
            async () => {
              const { data } = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/get-calorie-goal`,
                { params: { email } }
              );
              return data.calorieGoal !== null;
            }
          );
        }
      } catch (error) {
        console.error("Error checking calorie goal:", error);
      }
    };

    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        await new Promise((resolve) => setTimeout(resolve, 2000));

        if (mounted) {
          setUser(user);
          setSessionId(user?.id || null);
          setIsLoading(false);

          if (user?.email) {
            checkCalorieGoal(user.email);
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        // Intentar obtener datos offline si hay error
        const offlineUser = await offlineSyncManager.getData("user");
        if (offlineUser) {
          setUser(offlineUser);
          setSessionId(offlineUser.id);
          setIsLoading(false);
        }
      }
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user;

        setUser(currentUser || null);
        setSessionId(currentUser?.id || null);
        setIsLoading(false);

        if (event === "SIGNED_IN") {
          addNotification(
            "✅ Sesión iniciada",
            "🔐 Has iniciado sesión correctamente.",
            "success"
          );

          if (currentUser?.email) {
            checkCalorieGoal(currentUser.email);
          }

          setTimeout(() => {
            addNotification(
              "💧 Recordatorio",
              "🚰 No olvides registrar tu consumo de agua de hoy.",
              "info"
            );
          }, 3000);
        } else if (event === "SIGNED_OUT") {
          addNotification(
            "👋 Sesión cerrada",
            "🔒 Has cerrado sesión correctamente.",
            "info"
          );
        }
      }
    );

    // Verificar estado de conexión
    const handleOnline = () => {
      addNotification(
        "✅ Conexión Restaurada",
        "Se ha restaurado la conexión a internet. Los datos offline se sincronizarán automáticamente.",
        "success"
      );
    };

    const handleOffline = () => {
      addNotification(
        "⚠️ Sin Conexión",
        "Estás trabajando en modo offline. Los cambios se guardarán localmente y se sincronizarán cuando vuelvas a estar en línea.",
        "warning"
      );
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [addNotification, setSessionId]);

  useEffect(() => {
    registerServiceWorker();
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
        <Route path="/terms" element={<Terms />} /> {/* Nueva ruta para Terms */}
      </Route>

      {/* Protected Routes */}
      {protectedRoutes.map(({ path, layout: Layout, component: Component }) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute user={user}>
              <Layout>
                <Component user={user} />
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

      {/* 404 Route - Siempre debe ser la última ruta */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );

  return (
    <ThemeProvider>
      <Router>
        <Suspense fallback={<Loader />}>
          <div className="relative min-h-screen bg-background text-foreground transition-colors duration-300">
            {renderRoutes()}
            {isLoading && <Loader />}
            <ChatBot user={user} />
            <ToastContainer />
            <ServiceWorkerUpdate />
          </div>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
}

export default App;