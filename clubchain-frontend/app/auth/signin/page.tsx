"use client";

import { signIn, useSession, getProviders } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import Button from "@/components/ui/Button";
import Card, { CardBody } from "@/components/ui/Card";
import FloatingElements from "@/components/landing/FloatingElements";
import { GraduationCap, Rocket, AlertTriangle, Info, ArrowRight } from "lucide-react";
import { useIsRegistered } from "@/hooks/useRegistrationStatus";
import { useBadgeAuth } from "@/hooks/useBadgeAuth";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const account = useCurrentAccount();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [providers, setProviders] = useState<Record<string, any> | null>(null);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: isRegistered, isLoading: isCheckingRegistration } = useIsRegistered();
  const { isSuperAdmin, isClubOwner, isLoading: isCheckingBadges } = useBadgeAuth();

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(errorParam);
      console.error("Auth error:", errorParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const providersList = await getProviders();
        setProviders(providersList);
      } catch (error) {
        console.error("Error loading providers:", error);
      } finally {
        setIsLoadingProviders(false);
      }
    };
    loadProviders();
  }, []);

  useEffect(() => {
    if (session && account) {
      // If user has session and wallet connected, check registration status and badges
      if (!isCheckingRegistration && !isCheckingBadges) {
        // If user has badges (SuperAdmin or ClubOwner), go to dashboard even without UserProfile
        if (isSuperAdmin || isClubOwner) {
          router.push("/dashboard");
        } else if (isRegistered) {
          // User is already registered (has UserProfile), go to dashboard
          router.push("/dashboard");
        } else {
          // User is not registered and has no badges, go to registration page
          router.push("/register");
        }
      }
    } else if (session && !account) {
      // User has session but no wallet, go to registration to connect wallet
      router.push("/register");
    }
  }, [session, account, isRegistered, isCheckingRegistration, isCheckingBadges, isSuperAdmin, isClubOwner, router]);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signIn("42-school", { 
        callbackUrl: "/register",
        redirect: true 
      });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsSigningIn(false);
    }
  };

  const has42Provider = providers && "42-school" in providers;

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 sm:p-8">
      {/* Animated background */}
      <FloatingElements />
      
      {/* Sign in card */}
      <div className="relative z-10 max-w-md w-full animate-scaleUp">
        <Card className="overflow-visible">
          <CardBody className="p-8">
            {/* Header */}
            <div className="text-center mb-8 animate-fadeIn">
              <div className="inline-flex p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl mb-4 shadow-elevation-1 animate-icon-pulse border border-primary/20">
                <GraduationCap className="w-16 h-16 text-primary" strokeWidth={1.5} />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-400">Sign in to access 42 Clubs</p>
            </div>

            {/* Sign in options */}
            <div className="space-y-4 animate-slideUp animation-delay-200">
              {isLoadingProviders ? (
                <Button
                  disabled
                  isLoading
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  Loading...
                </Button>
              ) : has42Provider ? (
                <Button
                  onClick={handleSignIn}
                  disabled={status === "loading" || isSigningIn}
                  isLoading={isSigningIn}
                  variant="primary"
                  size="lg"
                  className="w-full group"
                >
                  <Rocket className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {isSigningIn ? "Redirecting to 42..." : "Sign in with 42"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <div className="w-full bg-warning/20 border border-warning/30 text-warning py-4 px-4 rounded-lg text-sm">
                  <p className="font-semibold mb-1 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    42 OAuth Not Configured
                  </p>
                  <p className="text-xs">
                    Please set FORTYTWO_CLIENT_ID and FORTYTWO_CLIENT_SECRET environment variables.
                  </p>
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-secondary"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-gray-400">or</span>
                </div>
              </div>

              <Button
                onClick={() => router.push("/")}
                variant="outline"
                size="lg"
                className="w-full"
              >
                Continue as Guest
              </Button>
            </div>

            {/* Error message */}
            {error && (
              <div className="mt-6 p-4 bg-error/20 border border-error/30 rounded-lg animate-slideUp">
                <p className="text-sm text-error flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Authentication Error:</strong> {error}</span>
                </p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-xs text-error hover:text-error/80 underline transition-colors"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Info note */}
            <div className="mt-8 p-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg border border-primary/30 animate-slideUp animation-delay-400">
              <p className="text-xs text-gray-300 text-center flex items-center gap-2 justify-center">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span><strong>Note:</strong> You must be a 42 student to create events and use club features.</span>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

