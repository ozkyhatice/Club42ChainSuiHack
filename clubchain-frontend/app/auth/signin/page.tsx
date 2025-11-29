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
      // If user has session and wallet connected, check registration status
      if (!isCheckingRegistration) {
        if (isRegistered) {
          // User is already registered, go to dashboard
          router.push("/dashboard");
        } else {
          // User is not registered, go to registration page
          router.push("/register");
        }
      }
    } else if (session && !account) {
      // User has session but no wallet, go to registration to connect wallet
      router.push("/register");
    }
  }, [session, account, isRegistered, isCheckingRegistration, router]);

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
              <div className="inline-flex p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl mb-4 shadow-elevation-1 animate-icon-pulse">
                <GraduationCap className="w-16 h-16 text-blue-600" strokeWidth={1.5} />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600">Sign in to access 42 Clubs</p>
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
                <div className="w-full bg-yellow-50 border border-yellow-200 text-yellow-800 py-4 px-4 rounded-lg text-sm">
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
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
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
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-slideUp">
                <p className="text-sm text-red-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Authentication Error:</strong> {error}</span>
                </p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-xs text-red-600 hover:text-red-800 underline transition-colors"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Info note */}
            <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100 animate-slideUp animation-delay-400">
              <p className="text-xs text-gray-700 text-center flex items-center gap-2 justify-center">
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

