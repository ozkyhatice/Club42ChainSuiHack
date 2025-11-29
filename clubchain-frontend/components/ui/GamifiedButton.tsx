"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface GamifiedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "success" | "danger" | "gradient";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
}

export default function GamifiedButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconRight: IconRight,
  disabled = false,
  loading = false,
  className = "",
  fullWidth = false,
  type = "button",
}: GamifiedButtonProps) {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all group hover-lift disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none";
  
  const variantStyles = {
    primary: "bg-primary text-white hover:bg-primary-hover shadow-elevation-2 hover-glow",
    secondary: "bg-secondary text-foreground hover:bg-secondary-hover border border-border",
    success: "bg-success text-white hover:bg-success-light shadow-elevation-2",
    danger: "bg-error text-white hover:bg-error-light shadow-elevation-2",
    gradient: "bg-gradient-to-r from-primary via-accent to-primary-light text-white hover:from-primary-hover hover:via-accent-hover hover:to-primary shadow-elevation-3 animate-gradient",
  };
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          {Icon && <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />}
          {children}
          {IconRight && <IconRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
        </>
      )}
    </button>
  );
}

