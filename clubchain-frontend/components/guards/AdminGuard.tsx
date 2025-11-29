"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { useIsClubAdmin } from "@/modules/admin/useAdminCap";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AdminGuardProps {
  clubId?: string;
  children: React.ReactNode;
  redirectTo?: string;
  showError?: boolean;
}

/**
 * AdminGuard Component
 * Protects routes and UI elements that require admin privileges
 * 
 * Usage:
 * - Wrap admin-only content with this component
 * - Provide clubId to check admin status for a specific club
 * - If no clubId is provided, checks if user has any admin caps
 */
export function AdminGuard({
  clubId,
  children,
  redirectTo = "/",
  showError = true,
}: AdminGuardProps) {
  const account = useCurrentAccount();
  const router = useRouter();
  const { isAdmin, loading } = useIsClubAdmin(clubId);

  useEffect(() => {
    // Redirect if not connected
    if (!account && !loading) {
      router.push("/auth/signin");
    }

    // Redirect if not admin
    if (account && !loading && !isAdmin && redirectTo) {
      router.push(redirectTo);
    }
  }, [account, isAdmin, loading, redirectTo, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Show error if not connected
  if (!account) {
    if (showError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Access Denied
            </h2>
            <p className="text-gray-700 mb-6">
              You must connect your wallet to access this page.
            </p>
            <button
              onClick={() => router.push("/auth/signin")}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  // Show error if not admin
  if (!isAdmin) {
    if (showError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Access Denied
            </h2>
            <p className="text-gray-700 mb-6">
              You do not have admin privileges for this club.
              {clubId && (
                <>
                  <br />
                  <span className="text-sm text-gray-500">
                    Club ID: {clubId}
                  </span>
                </>
              )}
            </p>
            <button
              onClick={() => router.push(redirectTo)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  // Render children if admin
  return <>{children}</>;
}

/**
 * Inline AdminGuard for conditional rendering without full page protection
 */
interface InlineAdminGuardProps {
  clubId?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function InlineAdminGuard({
  clubId,
  children,
  fallback = null,
}: InlineAdminGuardProps) {
  const account = useCurrentAccount();
  const { isAdmin, loading } = useIsClubAdmin(clubId);

  if (loading) {
    return <>{fallback}</>;
  }

  if (!account || !isAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

