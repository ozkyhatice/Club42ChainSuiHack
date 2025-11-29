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
  const baseStyles = "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none";
  
  const variantStyles = {
    primary: "bg-primary/20 text-primary border border-primary/30 shadow-sm hover:bg-primary/30 hover:scale-105 active:scale-95",
    secondary: "bg-secondary text-foreground hover:bg-secondary-hover border border-border hover:scale-105 active:scale-95",
    success: "bg-success/20 text-success border border-success/30 shadow-sm hover:bg-success/30 hover:scale-105 active:scale-95",
    danger: "bg-error/20 text-error border border-error/30 shadow-sm hover:bg-error/30 hover:scale-105 active:scale-95",
    gradient: "bg-primary/20 text-primary border border-primary/30 shadow-sm hover:bg-primary/30 hover:scale-105 active:scale-95",
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

