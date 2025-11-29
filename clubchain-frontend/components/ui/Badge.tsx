"use client";

import React from "react";

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "info" | "error" | "accent";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  icon?: React.ReactNode;
  animate?: boolean;
  className?: string;
}

const variantStyles = {
  default: "bg-secondary text-foreground border-secondary",
  success: "bg-success/15 text-success border-success/20",
  warning: "bg-warning/15 text-warning border-warning/20",
  info: "bg-primary/15 text-primary border-primary/20",
  error: "bg-error/15 text-error border-error/20",
  accent: "bg-accent/15 text-accent border-accent/20",
};

const sizeStyles = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-1.5 text-sm",
  lg: "px-4 py-2 text-base",
};

export default function Badge({
  variant = "default",
  size = "md",
  children,
  icon,
  animate = false,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-semibold rounded-full border
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${animate ? "animate-icon-pulse" : ""}
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}


