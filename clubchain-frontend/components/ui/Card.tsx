import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = "", hover = false, onClick }: CardProps) {
  const baseStyles = "bg-card border border-border rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.12)] overflow-hidden transition-all duration-300";
  const hoverStyles = hover ? "hover:shadow-[0_4px_12px_rgba(0,0,0,0.18)] hover:scale-[1.02] hover:border-border-light cursor-pointer" : "";
  const clickableStyles = onClick ? "cursor-pointer hover:bg-card-hover" : "";
  
  return (
    <div 
      className={`${baseStyles} ${hoverStyles} ${clickableStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return (
    <div className={`px-6 py-4 border-b border-border ${className}`}>
      {children}
    </div>
  );
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className = "" }: CardBodyProps) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return (
    <div className={`px-6 py-4 border-t border-border bg-card ${className}`}>
      {children}
    </div>
  );
}


