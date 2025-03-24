import React from "react";
import Sidebar from "../components/Sidebar";

interface FoodSearchLayoutProps {
  children: React.ReactNode;
}

const FoodSearchLayout: React.FC<FoodSearchLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-[#282c3c] text-white">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
};

export default React.memo(FoodSearchLayout);