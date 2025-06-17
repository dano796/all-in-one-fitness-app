// src/pages/WaterDashboard.tsx
import React from "react";
import { motion } from "framer-motion";
import WaterLayout from "../layouts/WaterLayout";
import WaterTracker from "../components/WaterTracker";
import PersonalizedSuggestions from "../components/PersonalizedSuggestions";
import { useUserData } from "../hooks/useUserData";
import { useTheme } from "./ThemeContext";

const WaterDashboard: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { userData, loading: userDataLoading } = useUserData();

  return (
    <WaterLayout>
      <div className="space-y-6">
        {/* Water Tracker */}
        <WaterTracker />

        {/* Personalized Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-4xl mx-auto px-4 mt-6 pb-8"
        >
          <PersonalizedSuggestions
            userProfile={userData?.profile || null}
            context="water"
            maxSuggestions={3}
            showCategories={true}
            userData={userData || undefined}
          />
        </motion.div>
      </div>
    </WaterLayout>
  );
};

export default React.memo(WaterDashboard);
