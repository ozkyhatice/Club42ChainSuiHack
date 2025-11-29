"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useIsSuperAdmin } from "@/hooks/useSuperAdmin";
import { AlertTriangle, Shield } from "lucide-react";
import GamifiedButton from "@/components/ui/GamifiedButton";

interface SuperAdminGuardProps {
  children: ReactNode;
}

export function SuperAdminGuard({ children }: SuperAdminGuardProps) {
  const account = useCurrentAccount();
  const { data: isSuperAdmin, isLoading } = useIsSuperAdmin();
  const router = useRouter();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Wallet not connected
  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-elevation-2 p-8 text-center">
          <div className="inline-flex p-6 bg-orange-50 rounded-2xl mb-6">
            <AlertTriangle className="w-16 h-16 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Wallet Required</h1>
          <p className="text-gray-600 mb-6">
            Please connect your Sui wallet to verify Super Admin privileges.
          </p>
          <GamifiedButton
            variant="primary"
            onClick={() => router.push("/dashboard")}
          >
            Go to Dashboard
          </GamifiedButton>
        </div>
      </div>
    );
  }

  // Not super admin
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-elevation-2 p-8 text-center">
          <div className="inline-flex p-6 bg-red-50 rounded-2xl mb-6">
            <Shield className="w-16 h-16 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Super Admin Only</h1>
          <p className="text-gray-600 mb-6">
            This page is restricted to Super Admin access only. You must hold the SuperAdminCap NFT to access this area.
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Super Admin is assigned during contract deployment and cannot be changed through the UI.
            </p>
          </div>
          <GamifiedButton
            variant="secondary"
            onClick={() => router.push("/dashboard")}
          >
            Back to Dashboard
          </GamifiedButton>
        </div>
      </div>
    );
  }

  // Is super admin - show content
  return <>{children}</>;
}

