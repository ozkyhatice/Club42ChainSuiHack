"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FloatingElements from "@/components/landing/FloatingElements";
import AnimatedHero from "@/components/landing/AnimatedHero";
import CTASection from "@/components/landing/CTASection";
import FeatureCards from "./FeatureCards";
import { ClubList } from "@/src/modules/clubs/ClubList";
import Button from "@/components/ui/Button";
import { Building2, ArrowRight } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  // Show loading state while checking auth
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

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
      
      {/* Clubs section - redirect if authenticated */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-20 bg-white/80 backdrop-blur-sm">
        {session ? (
          /* Authenticated users see CTA to clubs page */
          <div className="text-center py-16 animate-fadeIn">
            <div className="inline-flex p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl mb-6 shadow-elevation-2 animate-icon-pulse">
              <Building2 className="w-20 h-20 text-blue-600" strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Ready to Explore Clubs?
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              You're logged in! Discover all active clubs, join communities, and start connecting with fellow students.
            </p>
            <Link href="/clubs">
              <Button variant="primary" size="lg" className="gap-2 group">
                <Building2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                View All Clubs
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        ) : (
          /* Non-authenticated users see club preview */
          <>
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Active Clubs
              </h2>
              <p className="text-base sm:text-lg text-gray-600">
                Discover and join clubs across campus
              </p>
            </div>
            <ClubList />
          </>
        )}
      </div>
    </main>
  );
}

