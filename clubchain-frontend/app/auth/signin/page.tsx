"use client";

import { signIn, useSession, getProviders } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [providers, setProviders] = useState<Record<string, any> | null>(null);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);

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
    if (session) {
      router.push("/register");
    }
  }, [session, router]);

  const has42Provider = providers && "42-school" in providers;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">ClubChain</h1>
          <p className="text-gray-600">42 Campus Event Management</p>
        </div>

        <div className="space-y-4">
          {isLoadingProviders ? (
            <button
              disabled
              className="w-full bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold cursor-not-allowed"
            >
              Loading...
            </button>
          ) : has42Provider ? (
            <button
              onClick={() => signIn("42-school", { callbackUrl: "/register" })}
              disabled={status === "loading"}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              {status === "loading" ? "Loading..." : "Sign in with 42"}
            </button>
          ) : (
            <div className="w-full bg-yellow-50 border border-yellow-200 text-yellow-800 py-3 px-4 rounded-lg text-sm">
              <p className="font-semibold mb-1">42 OAuth Not Configured</p>
              <p className="text-xs">
                Please set FORTYTWO_CLIENT_ID and FORTYTWO_CLIENT_SECRET environment variables.
              </p>
            </div>
          )}

          <div className="text-center text-sm text-gray-500">
            <p>or</p>
          </div>

          <button
            onClick={() => router.push("/")}
            className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Continue as Guest
          </button>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            <strong>Note:</strong> You must be a 42 student to create events and use club features.
          </p>
        </div>
      </div>
    </div>
  );
}

