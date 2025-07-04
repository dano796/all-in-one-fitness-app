import React, { useState, useEffect } from "react";
import FoodSearchIA from "../components/FoodSearchIA";
import GalaxyBackground from "../components/GalaxyBackground";
import PersonalizedSuggestions from "../components/PersonalizedSuggestions";
import { useUserData } from "../hooks/useUserData";
import { FaArrowLeft } from "react-icons/fa";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../pages/ThemeContext";
import axios from "axios";
import { Lock } from "lucide-react";
import { User } from '@supabase/supabase-js';

interface FoodSearchIAPageProps {
  user: User | null;
}

const FoodSearchIAPage: React.FC<FoodSearchIAPageProps> = ({ user }) => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const foodType = searchParams.get("type") || "desayuno";
  const date =
    searchParams.get("date") ||
    new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [isIdLoading, setIsIdLoading] = useState<boolean>(false);

  // Get user data for personalized suggestions
  const { userData, loading: userDataLoading } = useUserData();

  // Fetch user subscription status
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setHasSubscription(null);
        setIsIdLoading(false);
        //console.log('No user provided, resetting hasSubscription');
        return;
      }

      setIsIdLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/get-user-subscription`, {
          params: { email: user.email },
        });

        const data = response.data;
        //console.log('User data fetched:', data);
        setHasSubscription(data.Suscripcion);
        //console.log('hasSubscription set to:', data.Suscripcion);
      } catch (error) {
        //console.error('Error fetching user data:', error);
        setHasSubscription(null);
      } finally {
        setIsIdLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  // If still loading, show a loading state
  if (isIdLoading) {
    return (
      <div
        className={`relative min-h-screen w-full ${
          isDarkMode ? "bg-[#282c3c]" : "bg-[#F8F9FA]"
        } flex items-center justify-center transition-colors duration-300`}
      >
        <div
          className={`p-4 rounded-xl text-sm sm:text-base ${
            isDarkMode ? "bg-[#4B5563] text-gray-400" : "bg-gray-100 text-gray-600"
          } shadow-sm text-center`}
        >
          Cargando información de suscripción...
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative min-h-screen w-full ${
        isDarkMode ? "bg-[#282c3c]" : "bg-[#F8F9FA]"
      } overflow-hidden transition-colors duration-300`}
    >
      {/* GalaxyBackground always full-screen in the background */}
      <div className="absolute inset-0 z-0">
        <GalaxyBackground />
      </div>

      {/* Page content with conditional blur */}
      <div className={`${hasSubscription === false ? "blur-sm" : ""}`}>
        <div className="relative z-10 p-4 sm:p-6 space-y-4 sm:space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex items-center"
          >
            <Link to="/dashboard" className="inline-block">
              <button
                className={`flex items-center py-2 px-4 mt-4 sm:mt-6 mx-4 sm:mx-6 font-semibold rounded-full shadow-md transition-all duration-300 hover:-translate-y-1 ${
                  isDarkMode
                    ? "bg-gradient-to-r from-[#ff9404] to-[#FF6B35] text-white hover:shadow-lg hover:from-[#FF6B35] hover:to-[#ff9404]"
                    : "bg-orange-500 text-white hover:bg-orange-600 hover:shadow-lg"
                }`}
              >
                <FaArrowLeft className="mr-2 text-base sm:text-lg" />
                Volver
              </button>
            </Link>
          </motion.div>

          <div className="w-full px-4 py-4 sm:py-6">
            <div className="max-w-4xl mx-auto">
              <FoodSearchIA initialType={foodType} date={date} />
            </div>
          </div>

          {/* Personalized Suggestions */}
          {!userDataLoading && userData && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              className="w-full px-4 mt-6"
            >
              <div className="max-w-4xl mx-auto">
                <PersonalizedSuggestions
                  userProfile={userData.profile}
                  context="ai_food"
                  maxSuggestions={3}
                  userData={userData}
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Subscription locked modal (unblurred) */}
      {hasSubscription === false && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center z-30"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex flex-col items-center p-6 rounded-xl ${
              isDarkMode ? "bg-[#3B4252] text-white" : "bg-white text-gray-900"
            } shadow-lg`}
          >
            <Lock size={40} className="text-[#ff9404] mb-4" />
            <p className="text-center mb-4">Necesitas una suscripción Premium para acceder a esta funcionalidad.</p>
            <button
              onClick={() => navigate("/subscription-plans")}
              className="bg-[#ff9404] text-white px-4 py-2 rounded-lg hover:bg-[#e08503] transition-colors duration-300"
            >
              Ver planes
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default FoodSearchIAPage;