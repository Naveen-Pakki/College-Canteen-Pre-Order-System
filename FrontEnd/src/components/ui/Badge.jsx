import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const base = "inline-flex items-center font-bold rounded-full transition-colors";
  
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm"
  };

  const variants = {
    default: "bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-[#CBD5E1] border border-slate-200 dark:border-[#334155]",
    primary: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50",
    accent: "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/50",
    success: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50",
    warning: "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50",
    danger: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50"
  };

  return (
    <span className={`${base} ${sizeStyles[size]} ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  switch (status) {
    case 'Confirmed':
    case 'Order Placed':
      return (
        <Badge variant="primary" className="gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
          <span>Confirmed</span>
        </Badge>
      );
    case 'Preparing':
      return (
        <Badge variant="warning" className="gap-1.5 border-amber-300 dark:border-amber-700">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>Preparing</span>
        </Badge>
      );
    case 'Ready':
    case 'Ready For Pickup':
    case 'Ready for Pickup':
      return (
        <Badge variant="success" className="gap-1.5 border-emerald-400 dark:border-emerald-600 font-extrabold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Ready For Pickup</span>
        </Badge>
      );
    case 'Completed':
      return (
        <Badge variant="default" className="gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
          <span>Completed</span>
        </Badge>
      );
    default:
      return <Badge variant="default">{status}</Badge>;
  }
};

/**
 * Pure Veg & Non-Veg Dietary Badges
 * Strictly calibrated for optimal readability in both Light and Dark modes:
 * - Pure Veg:
 *   Light: bg #DCFCE7, text #166534, border #10B981
 *   Dark:  bg #064E3B, text #BBF7D0, border #10B981
 * - Non-Veg:
 *   Light: bg #FEE2E2, text #991B1B, border #F87171
 *   Dark:  bg #7F1D1D, text #FECACA, border #F87171
 */
export const DietaryBadge = ({ isVeg, showText = true, className = '' }) => {
  return isVeg ? (
    <div
      className={`badge-pure-veg inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-extrabold tracking-wide select-none shadow-xs ${className}`}
      title="Pure Veg (Vegetarian)"
    >
      <span className="w-3.5 h-3.5 rounded-xs flex items-center justify-center border border-[#10B981] bg-white/40 dark:bg-black/20 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
      </span>
      {showText && <span>Pure Veg</span>}
    </div>
  ) : (
    <div
      className={`badge-non-veg inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-extrabold tracking-wide select-none shadow-xs ${className}`}
      title="Non-Vegetarian"
    >
      <span className="w-3.5 h-3.5 rounded-xs flex items-center justify-center border border-[#F87171] bg-white/40 dark:bg-black/20 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-[#F87171]" />
      </span>
      {showText && <span>Non-Veg</span>}
    </div>
  );
};
