"use client";

import { ReactNode } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface ScrollSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "fade";
}

export default function ScrollSection({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: ScrollSectionProps) {
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px",
    triggerOnce: true,
  });

  const directionClasses = {
    up: "translate-y-8",
    down: "-translate-y-8",
    left: "translate-x-8",
    right: "-translate-x-8",
    fade: "",
  };

  const getTransformClass = () => {
    if (isVisible) {
      return "opacity-100 translate-y-0 translate-x-0";
    }
    return `opacity-0 ${directionClasses[direction]}`;
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${getTransformClass()} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

