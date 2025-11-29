"use client";

import { Shield, Zap, Globe, Users, Calendar, Award } from "lucide-react";

export default function AnimatedHero() {
  return (
    <div className="relative z-10 text-center py-12 sm:py-20 animate-fadeIn px-4">
      {/* Floating icon decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Users className="absolute top-10 left-[10%] w-12 h-12 text-primary/20 animate-float" style={{ animationDelay: '0s' }} />
        <Calendar className="absolute top-20 right-[15%] w-10 h-10 text-accent/20 animate-float" style={{ animationDelay: '0.5s' }} />
        <Award className="absolute bottom-20 left-[20%] w-14 h-14 text-warning/20 animate-float" style={{ animationDelay: '1s' }} />
        <Shield className="absolute bottom-32 right-[10%] w-11 h-11 text-primary/20 animate-float" style={{ animationDelay: '1.5s' }} />
      </div>
      
      {/* Main title with scale-up animation */}
      <div className="relative">
        <h1 className="text-6xl sm:text-8xl md:text-9xl font-bold mb-6 animate-bounceIn">
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
            42 Clubs
          </span>
        </h1>
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-32 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl animate-pulse-glow"></div>
      </div>
      
      {/* Subtitle with slide-up animation */}
      <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-300 mb-4 animate-slideUp animation-delay-200">
        Connect. Organize. Thrive.
      </p>
      
      {/* Description */}
      <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 px-4 animate-slideUp animation-delay-400">
        The decentralized platform for 42 campus clubs and events, powered by blockchain technology
      </p>
      
      {/* Feature badges with gamified icons */}
      <div className="flex flex-wrap gap-4 justify-center mb-12 animate-slideUp animation-delay-600">
        <div className="bg-card/90 backdrop-blur-md px-5 py-3 rounded-full shadow-elevation-2 border border-primary/20 hover-lift hover-glow transition-all group">
          <span className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            Blockchain Verified
          </span>
        </div>
        <div className="bg-card/90 backdrop-blur-md px-5 py-3 rounded-full shadow-elevation-2 border border-warning/20 hover-lift hover-glow transition-all group">
          <span className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Zap className="w-5 h-5 text-warning group-hover:scale-110 transition-transform" />
            Instant Access
          </span>
        </div>
        <div className="bg-card/90 backdrop-blur-md px-5 py-3 rounded-full shadow-elevation-2 border border-success/20 hover-lift hover-glow transition-all group">
          <span className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Globe className="w-5 h-5 text-success group-hover:scale-110 transition-transform" />
            Decentralized
          </span>
        </div>
      </div>
    </div>
  );
}

