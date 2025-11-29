"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  onClick?: () => void;
  className?: string;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  iconColor = "text-primary",
  iconBgColor = "bg-primary/10",
  trend,
  onClick,
  className = "",
}: StatCardProps) {
  const isClickable = !!onClick;
  
  return (
    <div
      onClick={onClick}
      className={`
        bg-card rounded-xl p-6 shadow-elevation-2 border border-border
        ${isClickable ? "hover-lift cursor-pointer card-interactive" : ""}
        ${className}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-text-muted mb-1">{label}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <p className={`text-sm font-medium mt-2 flex items-center gap-1 ${trend.isPositive ? "text-success" : "text-error"}`}>
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              {trend.value}
            </p>
          )}
        </div>
        <div className={`p-4 rounded-xl ${iconBgColor} hover-scale`}>
          <Icon className={`w-8 h-8 ${iconColor}`} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}


