"use client";

import { Crown } from "lucide-react";

interface OwnerBadgeProps {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animate?: boolean;
  className?: string;
}

export default function OwnerBadge({ 
  size = "md", 
  showLabel = true,
  animate = true,
  className = "" 
}: OwnerBadgeProps) {
  const sizeStyles = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };
  
  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };
  
  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 font-semibold rounded-full
        bg-gradient-to-r from-primary via-primary-light to-primary-hover
        text-white shadow-elevation-2
        ${sizeStyles[size]}
        ${animate ? "animate-icon-pulse" : ""}
        ${className}
      `}
    >
      <Crown className={`${iconSizes[size]} fill-current`} />
      {showLabel && <span>Owner</span>}
    </span>
  );
}


