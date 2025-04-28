// src/components/InfoTooltip.tsx
import React, { useState, useEffect, useRef } from "react";
import { Info } from "lucide-react";
import { useTheme } from "../pages/ThemeContext";

interface InfoTooltipProps {
  content: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ content }) => {
  const { isDarkMode } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block">
      <button
        className={`transition-colors duration-300 focus:outline-none mt-2 ${
          isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
        }`}
        onClick={() => setIsVisible(!isVisible)}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        <Info size={17} />
      </button>
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 w-64 p-3 rounded-md shadow-lg text-xs top-full left-1/2 transform -translate-x-1/2 mt-2 ${
            isDarkMode
              ? "bg-[#2D3242] text-gray-300 border-[#4B5563]"
              : "bg-gray-100 text-gray-700 border-gray-300"
          }`}
        >
          {content}
          <div
            className={`absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45 border-t border-l ${
              isDarkMode
                ? "bg-[#2D3242] border-[#4B5563]"
                : "bg-gray-100 border-gray-300"
            }`}
          ></div>
        </div>
      )}
    </div>
  );
};

export default React.memo(InfoTooltip);