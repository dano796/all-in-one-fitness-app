// src/pages/WaterDashboard.tsx
import React from "react";
import WaterLayout from "../layouts/WaterLayout";
import WaterTracker from "../components/WaterTracker";
import { useTheme } from "./ThemeContext";

const WaterDashboard: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <WaterLayout>
      <div
        className={`space-y-6 ${isDarkMode ? "bg-[#282c3c]" : "bg-[#F8F9FA]"}`}
      >
        <WaterTracker />
      </div>
    </WaterLayout>
  );
};

export default React.memo(WaterDashboard);
