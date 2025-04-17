import React, { useState, useEffect, useRef } from "react";
import { Info } from "lucide-react";

// InfoTooltip Component
interface InfoTooltipProps {
  content: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ content }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close tooltip when clicking outside
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
        className="text-gray-400 hover:text-white transition-colors duration-300 focus:outline-none mt-2"
        onClick={() => setIsVisible(!isVisible)}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        <Info size={17} />
      </button>
      {isVisible && (
        <div
          ref={tooltipRef}
          className="absolute z-50 w-64 p-3 bg-[#2D3242] border border-[#4B5563] rounded-md shadow-lg text-xs text-gray-300 top-full left-1/2 transform -translate-x-1/2 mt-2"
        >
          {content}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45 bg-[#2D3242] border-t border-l border-[#4B5563]"></div>
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;
