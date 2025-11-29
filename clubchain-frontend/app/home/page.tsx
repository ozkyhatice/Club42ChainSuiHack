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
import ScrollSection from "@/components/landing/ScrollSection";
import { Building2, ArrowRight, Shield, Zap } from "lucide-react";
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
      
      {/* Hero Section - Full Screen */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-8">
        <AnimatedHero />
        <CTASection />
      </section>
      
      {/* Features section - Modern Cards */}
      <ScrollSection direction="up" delay={200}>
        <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
          <ScrollSection direction="up" delay={100}>
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary uppercase tracking-wider">Features</span>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground mb-6">
                Why <span className="text-primary">42 Clubs</span>?
              </h2>
              <p className="text-lg sm:text-xl text-text-muted max-w-3xl mx-auto">
                A modern platform built for the 42 community, leveraging blockchain for transparency and security
              </p>
            </div>
          </ScrollSection>
          <FeatureCards />
        </section>
      </ScrollSection>
      
      
      {/* CTA Section - Final */}
      <ScrollSection direction="up" delay={400}>
        <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
          <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl p-12 border border-primary/30 text-center backdrop-blur-sm">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-text-muted mb-8 max-w-2xl mx-auto">
              Join the decentralized future of campus club management. Connect your wallet and start exploring today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push("/auth/signin")}
                className="group shadow-elevation-2 hover:shadow-elevation-3"
              >
                Connect with 42
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
            </div>
          </div>
        </section>
      </ScrollSection>
    </main>
  );
}

