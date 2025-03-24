import React from "react";
import WaterLayout from "../layouts/WaterLayout";
import WaterTracker from "../components/WaterTracker";

const WaterDashboard: React.FC = () => {
  return (
    <WaterLayout>
      <div className="space-y-6">
        <WaterTracker />
      </div>
    </WaterLayout>
  );
};

export default React.memo(WaterDashboard);