"use client";

import { useRouter } from "next/navigation";
import { ConnectButton } from "@mysten/dapp-kit";
import Button from "@/components/ui/Button";
import { GraduationCap, ArrowRight, Sparkles } from "lucide-react";

export default function CTASection() {
  const router = useRouter();
  
  return (
    <div className="relative z-10 flex flex-col items-center gap-6 animate-slideUp animation-delay-600 px-4">
      {/* Main CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Button
          variant="primary"
          size="lg"
          onClick={() => router.push("/auth/signin")}
          className="w-full sm:min-w-[200px] group shadow-elevation-2 hover-lift bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent/80"
        >
          <GraduationCap className="w-5 h-5 group-hover:scale-110 transition-transform animate-icon-pulse" />
          Sign In with 42
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
        
        <div className="flex items-center justify-center w-full sm:w-auto hover-lift">
          <ConnectButton />
        </div>
      </div>
      
      {/* Secondary actions */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={() => router.push("/events")}
          className="text-gray-400 hover:text-foreground font-medium underline underline-offset-4 transition-colors flex items-center gap-1 group"
        >
          <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
          Browse Events
        </button>
        <span className="text-gray-500">•</span>
        <button
          onClick={() => {
            const featuresSection = document.getElementById("features");
            featuresSection?.scrollIntoView({ behavior: "smooth" });
          }}
          className="text-gray-400 hover:text-foreground font-medium underline underline-offset-4 transition-colors flex items-center gap-1 group"
        >
          Learn More
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
      
      {/* Info text */}
      <p className="text-sm text-gray-400 max-w-md text-center mt-4 flex items-center gap-2 justify-center">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Connect your wallet and 42 account to access exclusive club features
      </p>
    </div>
  );
}

