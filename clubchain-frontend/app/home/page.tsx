"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import FloatingElements from "@/components/landing/FloatingElements";
import AnimatedHero from "@/components/landing/AnimatedHero";
import CTASection from "@/components/landing/CTASection";
import FeatureCards from "./FeatureCards";
import { ClubList } from "@/src/modules/clubs/ClubList";
import Button from "@/components/ui/Button";
import { Building2, ArrowRight } from "lucide-react";
import { getClubs } from "@/src/services/blockchain/getClubs";

export default function Home() {
  const router = useRouter();
  
  // Fetch clubs for preview
  const { data: clubs = [] } = useQuery({
    queryKey: ["home-clubs"],
    queryFn: getClubs,
    staleTime: 60000,
  });

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <FloatingElements />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-8">
        <AnimatedHero />
        <CTASection />
      </div>
      
      {/* Features section */}
      <div id="features" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-20">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Why 42 Clubs?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            A modern platform built for the 42 community, leveraging blockchain for transparency and security
          </p>
        </div>
        <FeatureCards />
      </div>
      
      {/* Clubs section */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-20 bg-white/80 backdrop-blur-sm">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Active Clubs
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-6">
            Discover and join clubs across campus
          </p>
          <Link href="/clubs">
            <Button variant="primary" size="lg" className="gap-2 group">
              <Building2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              View All Clubs
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
        <ClubList clubs={clubs.slice(0, 6)} />
      </div>
    </main>
  );
}

