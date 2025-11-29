"use client";

import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { PACKAGE_ID } from "@/lib/constants";

/**
 * Hook to check if current user is the Super Admin
 * Super Admin holds the SuperAdminCap NFT
 */
export function useIsSuperAdmin() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();

  return useQuery({
    queryKey: ["is-super-admin", account?.address],
    queryFn: async () => {
      if (!account?.address || !PACKAGE_ID) return false;

      try {
        // Check if user owns SuperAdminCap
        const objects = await suiClient.getOwnedObjects({
          owner: account.address,
          filter: {
            StructType: `${PACKAGE_ID}::super_admin::SuperAdminCap`,
          },
          options: {
            showContent: true,
          },
        });

        return objects.data.length > 0;
      } catch (error) {
        console.error("Error checking super admin status:", error);
        return false;
      }
    },
    enabled: !!account?.address && !!PACKAGE_ID,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to get the SuperAdminCap object ID
 */
export function useSuperAdminCapId() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();

  return useQuery({
    queryKey: ["super-admin-cap-id", account?.address],
    queryFn: async () => {
      if (!account?.address || !PACKAGE_ID) return null;

      try {
        const objects = await suiClient.getOwnedObjects({
          owner: account.address,
          filter: {
            StructType: `${PACKAGE_ID}::super_admin::SuperAdminCap`,
          },
          options: {
            showContent: true,
          },
        });

        if (objects.data.length === 0) return null;
        
        return objects.data[0].data?.objectId || null;
      } catch (error) {
        console.error("Error getting super admin cap ID:", error);
        return null;
      }
    },
    enabled: !!account?.address && !!PACKAGE_ID,
    staleTime: 60000,
  });
}


