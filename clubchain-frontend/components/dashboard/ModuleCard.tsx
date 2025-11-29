"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  stats?: {
    label: string;
    value: string | number;
  }[];
  actions?: {
    label: string;
    href: string;
    variant?: "primary" | "secondary";
  }[];
  badge?: {
    label: string;
    color: string;
  };
  onClick?: () => void;
}

export default function ModuleCard({
  title,
  description,
  icon: Icon,
  iconColor = "text-primary",
  stats,
  actions,
  badge,
  onClick,
}: ModuleCardProps) {
  return (
    <Card 
      className="card-interactive hover-lift animate-bounceIn group relative overflow-hidden"
      onClick={onClick}
    >
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 shimmer-effect opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      
      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Animated icon */}
            <div className={`p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 shadow-elevation-1 group-hover:shadow-elevation-2 transition-all duration-300`}>
              <Icon 
                className={`w-8 h-8 ${iconColor} group-hover:scale-110 transition-transform duration-300`} 
                strokeWidth={2}
              />
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                {title}
              </h3>
              {badge && (
                <span className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full ${badge.color}`}>
                  {badge.label}
                </span>
              )}
            </div>
          </div>
          
          {/* Hover indicator */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <svg 
              className="w-5 h-5 text-primary" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
        
        <p className="text-text-muted mt-3">{description}</p>
      </CardHeader>
      
      <CardBody>
        {/* Stats section */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="text-center p-3 bg-secondary rounded-lg group-hover:bg-primary/10 transition-colors"
              >
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
        
        {/* Actions section */}
        {actions && actions.length > 0 && (
          <div className="flex gap-2 mt-4">
            {actions.map((action, index) => (
              <Link 
                key={index}
                href={action.href}
                className={`flex-1 text-center px-4 py-2 rounded-lg font-medium transition-all ${
                  action.variant === "primary"
                    ? "bg-primary/20 text-primary border border-primary/30 shadow-sm hover:bg-primary/30 hover:scale-105 active:scale-95"
                    : "bg-secondary text-foreground hover:bg-secondary-hover hover:scale-105"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {action.label}
              </Link>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}


