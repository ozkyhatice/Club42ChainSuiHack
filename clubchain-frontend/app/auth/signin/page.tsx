"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/register");
    }
  }, [session, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">ClubChain</h1>
          <p className="text-gray-600">42 Campus Event Management</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => signIn("42-school", { callbackUrl: "/register" })}
            disabled={status === "loading"}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {status === "loading" ? "Loading..." : "Sign in with 42"}
          </button>

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

