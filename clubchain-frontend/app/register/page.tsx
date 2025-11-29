"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect } from "react";
import Link from "next/link";
import RegistrationFlow from "./RegistrationFlow";
import RegistrationSteps from "./RegistrationSteps";
import { useIsRegistered } from "@/hooks/useRegistrationStatus";

export default function RegisterPage() {
  const { data: session, status } = useSession();
  const account = useCurrentAccount();
  const router = useRouter();
  const { data: isRegistered, isLoading: isCheckingRegistration } = useIsRegistered();

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  // Redirect to dashboard if user is already registered
  useEffect(() => {
    if (account && !isCheckingRegistration) {
      if (isRegistered) {
        // User is already registered (has MemberBadge), go to dashboard
        console.log("User is already registered, redirecting to dashboard...");
        router.push("/dashboard");
      }
    }
  }, [account, isRegistered, isCheckingRegistration, router]);

  if (status === "loading" || isCheckingRegistration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  // Show loading while checking registration status
  if (account && isCheckingRegistration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Checking registration status...</p>
        </div>
      </div>
    );
  }

  // Redirect if already registered (this is a fallback, useEffect should handle it)
  if (account && isRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate current step for progress indicator (only 2 steps: 42 account and wallet)
  const currentStep = !session ? 1 : !account ? 2 : 2;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with back link */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary-hover transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-card rounded-2xl shadow-elevation-3 border border-border-light p-6 sm:p-8 lg:p-10">
          {/* Title Section */}
          <div className="mb-8 text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Complete Registration
            </h1>
            <p className="text-text-muted text-sm sm:text-base">
              Link your 42 account with your Sui wallet to access all features
            </p>
          </div>

          {/* Progress Steps */}
          <RegistrationSteps currentStep={currentStep} />

          {/* Registration Flow */}
          <div className="mt-8">
            <RegistrationFlow />
          </div>

          {/* Benefits Section */}
          <div className="mt-8 p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 rounded-xl border border-primary/20">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Why register?
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-success text-xs">✓</span>
                </div>
                <p className="text-sm text-text-muted">Create and manage campus events</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-success text-xs">✓</span>
                </div>
                <p className="text-sm text-text-muted">Join club fundraising pools</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-success text-xs">✓</span>
                </div>
                <p className="text-sm text-text-muted">Verify your identity on-chain</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-success text-xs">✓</span>
                </div>
                <p className="text-sm text-text-muted">Access exclusive club features</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

