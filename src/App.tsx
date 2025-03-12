import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AboutPage from "./pages/AboutPage";
import ModulesPage from "./pages/ModulesPage";
import ContactPage from "./pages/ContactPage";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { supabase } from "../backend/lib/supabaseClient";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) return <p>Cargando...</p>;

  return user ? <>{children}</> : <Navigate to="/login" />;
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
          <Route path="/login" element={<LoginPage/>} />
          <Route path="/registro" element={<RegisterPage />} />
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
      </Routes>
    </Router>
  );
}

export default App;
