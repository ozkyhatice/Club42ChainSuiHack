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
      if (!account?.address || !PACKAGE_ID) {
        console.log("useIsSuperAdmin: Missing account or PACKAGE_ID", { account: account?.address, PACKAGE_ID });
        return false;
      }

      try {
        console.log("useIsSuperAdmin: Starting check", {
          address: account.address,
          PACKAGE_ID,
          searchType: `${PACKAGE_ID}::super_admin::SuperAdminCap`,
        });
        
        // Check if user owns SuperAdminCap
        // Use pagination to ensure we get all objects
        let hasNextPage = true;
        let cursor: string | null = null;
        let found = false;

        while (hasNextPage && !found) {
          const result = await suiClient.getOwnedObjects({
            owner: account.address,
            filter: {
              StructType: `${PACKAGE_ID}::super_admin::SuperAdminCap`,
            },
            options: {
              showContent: true,
            },
            cursor: cursor || undefined,
            limit: 50,
          });

          console.log("useIsSuperAdmin: Query result", {
            address: account.address,
            cursor,
            hasNextPage: result.hasNextPage,
            dataLength: result.data.length,
            data: result.data,
          });

          if (result.data.length > 0) {
            found = true;
            console.log("useIsSuperAdmin: Found SuperAdminCap", {
              address: account.address,
              count: result.data.length,
              objects: result.data.map(obj => obj.data?.objectId),
            });
          }

          hasNextPage = result.hasNextPage;
          cursor = result.nextCursor || null;
        }

        console.log("useIsSuperAdmin: Final result", {
          address: account.address,
          isSuperAdmin: found,
        });

        return found;
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
      if (!account?.address || !PACKAGE_ID) {
        console.log("useSuperAdminCapId: Missing account or PACKAGE_ID", { account: account?.address, PACKAGE_ID });
        return null;
      }

      try {
        // Use pagination to ensure we get all objects
        let hasNextPage = true;
        let cursor: string | null = null;
        let capId: string | null = null;

        while (hasNextPage && !capId) {
          const result = await suiClient.getOwnedObjects({
            owner: account.address,
            filter: {
              StructType: `${PACKAGE_ID}::super_admin::SuperAdminCap`,
            },
            options: {
              showContent: true,
            },
            cursor: cursor || undefined,
            limit: 50,
          });

          if (result.data.length > 0) {
            capId = result.data[0].data?.objectId || null;
            console.log("useSuperAdminCapId: Found SuperAdminCap", {
              address: account.address,
              capId,
              count: result.data.length,
            });
          }

          hasNextPage = result.hasNextPage;
          cursor = result.nextCursor || null;
        }

        console.log("useSuperAdminCapId: Final result", {
          address: account.address,
          capId,
        });

        return capId;
      } catch (error) {
        console.error("Error getting super admin cap ID:", error);
        return null;
      }
    },
    enabled: !!account?.address && !!PACKAGE_ID,
    staleTime: 60000,
  });
}


