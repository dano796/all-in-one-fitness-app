import React from "react";
import CalorieCalculatorLayout from "../layouts/CalorieCalculatorLayout";
import CalorieCalculator from "../components/CalorieCalculator";

const WaterDashboard: React.FC = () => {
  return (
    <CalorieCalculatorLayout>
      <div className="space-y-6">
        <CalorieCalculator />
      </div>
    </CalorieCalculatorLayout>
  );
};

export default WaterDashboard;
