import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();
  const [rippling, setRippling] = useState(false);

  const handleClick = (e) => {
    setRippling(true);
    setTimeout(() => setRippling(false), 850);
    toggleTheme(e);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 border focus:outline-none focus:ring-2 focus:ring-blue-500/30 active:scale-95 shadow-xs cursor-pointer select-none ${
        isDark
          ? 'bg-[#1E293B] border-[#334155] text-amber-400 hover:bg-[#172033] hover:border-amber-400/50'
          : 'bg-white border-slate-200 hover:bg-slate-50 text-amber-500 hover:border-amber-300'
      } ${className}`}
    >
      {/* Water Ripple Ring Wave on Click */}
      {rippling && (
        <span className="absolute inset-0 rounded-full border-2 border-blue-500 dark:border-teal-400 animate-ping pointer-events-none opacity-75" />
      )}

      {/* Sun / Moon Icons with Smooth Rotation & Scale */}
      <div className="relative w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
        {isDark ? (
          <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 transition-all duration-500 ease-out transform rotate-0 scale-100" />
        ) : (
          <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 transition-all duration-500 ease-out transform rotate-0 scale-100" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;
