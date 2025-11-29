"use client";

import { GraduationCap, Rocket, Target, Zap, Users, Calendar } from "lucide-react";

export default function FloatingElements() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 animate-gradient"></div>
      
      {/* Floating circles */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute top-40 right-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-float animation-delay-400"></div>
      <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl animate-float animation-delay-200"></div>
      
      {/* Floating icons */}
      <div className="absolute top-1/4 left-1/4 opacity-10 animate-float animation-delay-200">
        <GraduationCap className="w-16 h-16 text-blue-600" strokeWidth={1.5} />
      </div>
      <div className="absolute top-1/3 right-1/4 opacity-10 animate-float animation-delay-400">
        <Rocket className="w-14 h-14 text-purple-600" strokeWidth={1.5} />
      </div>
      <div className="absolute bottom-1/4 left-1/2 opacity-10 animate-float animation-delay-600">
        <Target className="w-20 h-20 text-pink-600" strokeWidth={1.5} />
      </div>
      <div className="absolute top-1/2 right-1/3 opacity-10 animate-float">
        <Zap className="w-16 h-16 text-yellow-600" strokeWidth={1.5} />
      </div>
      <div className="absolute bottom-1/3 right-1/4 opacity-10 animate-float animation-delay-200">
        <Users className="w-14 h-14 text-indigo-600" strokeWidth={1.5} />
      </div>
      <div className="absolute top-2/3 left-1/4 opacity-10 animate-float animation-delay-400">
        <Calendar className="w-16 h-16 text-green-600" strokeWidth={1.5} />
      </div>
    </div>
  );
}

