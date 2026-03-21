// src/pages/AnatomyViewerPage.tsx
import React from "react";
import AnatomyViewer from "../components/AnatomyViewer";
import { User } from "@supabase/supabase-js";

interface AnatomyViewerPageProps {
  user?: User | null;
}

// The user prop is included to match the interface pattern used in other protected pages
const AnatomyViewerPage: React.FC<AnatomyViewerPageProps> = () => {
  return <AnatomyViewer />;
};

export default React.memo(AnatomyViewerPage);
