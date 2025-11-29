"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect } from "react";
import Link from "next/link";
import RegistrationFlow from "./RegistrationFlow";
import RegistrationSteps from "./RegistrationSteps";

export default function RegisterPage() {
  const { data: session, status } = useSession();
  const account = useCurrentAccount();
  const router = useRouter();

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Redirecting to sign in...</p>
      </div>
    );
  }

  // Calculate current step for progress indicator
  const currentStep = !session ? 1 : !account ? 2 : 3;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Complete Registration</h1>

          <RegistrationSteps currentStep={currentStep} />

          <RegistrationFlow />

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Why register?</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>✓ Create and manage campus events</li>
              <li>✓ Join club fundraising pools</li>
              <li>✓ Verify your identity on-chain</li>
              <li>✓ Access exclusive club features</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

