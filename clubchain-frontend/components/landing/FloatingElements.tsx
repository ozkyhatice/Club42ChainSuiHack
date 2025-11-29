"use client";

import { GraduationCap, Rocket, Target, Zap, Users, Calendar } from "lucide-react";

export default function FloatingElements() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/15 via-secondary/10 to-secondary/15 animate-gradient"></div>
      
      {/* Floating circles */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float"></div>
      <div className="absolute top-40 right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float animation-delay-400"></div>
      <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-float animation-delay-200"></div>
      
      {/* Floating icons */}
      <div className="absolute top-1/4 left-1/4 opacity-10 animate-float animation-delay-200">
        <GraduationCap className="w-16 h-16 text-primary" strokeWidth={1.5} />
      </div>
      <div className="absolute top-1/3 right-1/4 opacity-10 animate-float animation-delay-400">
        <Rocket className="w-14 h-14 text-accent" strokeWidth={1.5} />
      </div>
      <div className="absolute bottom-1/4 left-1/2 opacity-10 animate-float animation-delay-600">
        <Target className="w-20 h-20 text-warning" strokeWidth={1.5} />
      </div>
      <div className="absolute top-1/2 right-1/3 opacity-10 animate-float">
        <Zap className="w-16 h-16 text-yellow-600" strokeWidth={1.5} />
      </div>
      <div className="absolute bottom-1/3 right-1/4 opacity-10 animate-float animation-delay-200">
        <Users className="w-14 h-14 text-[#6b5b95]" strokeWidth={1.5} />
      </div>
      <div className="absolute top-2/3 left-1/4 opacity-10 animate-float animation-delay-400">
        <Calendar className="w-16 h-16 text-green-600" strokeWidth={1.5} />
      </div>
    </div>
  );
}

