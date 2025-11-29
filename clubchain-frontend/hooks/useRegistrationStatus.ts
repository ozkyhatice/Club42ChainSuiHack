"use client";

import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { PACKAGE_ID } from "@/lib/constants";

/**
 * Hook to check if current user is registered on-chain
 * Checks if user owns a UserProfile object
 */
export function useIsRegistered() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();

  return useQuery({
    queryKey: ["is-registered", account?.address],
    queryFn: async () => {
      if (!account?.address || !PACKAGE_ID) return false;

      try {
        // Check if user owns UserProfile
        const objects = await suiClient.getOwnedObjects({
          owner: account.address,
          filter: {
            StructType: `${PACKAGE_ID}::member::UserProfile`,
          },
          options: {
            showContent: true,
          },
        });

        return objects.data.length > 0;
      } catch (error) {
        console.error("Error checking registration status:", error);
        return false;
      }
    },
    enabled: !!account?.address && !!PACKAGE_ID,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to get the UserProfile object for current user
 */
export function useUserProfile() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();

  return useQuery({
    queryKey: ["user-profile", account?.address],
    queryFn: async () => {
      if (!account?.address || !PACKAGE_ID) return null;

      try {
        const objects = await suiClient.getOwnedObjects({
          owner: account.address,
          filter: {
            StructType: `${PACKAGE_ID}::member::UserProfile`,
          },
          options: {
            showContent: true,
          },
        });

        if (objects.data.length === 0) return null;
        
        const profile = objects.data[0].data?.content;
        if (profile && "fields" in profile) {
          return {
            objectId: objects.data[0].data?.objectId,
            intraId: profile.fields.intra_id,
            walletAddress: profile.fields.wallet_address,
            username: profile.fields.username,
            email: profile.fields.email,
            isRegistered: profile.fields.is_registered,
          };
        }
        
        return null;
      } catch (error) {
        console.error("Error getting user profile:", error);
        return null;
      }
    },
    enabled: !!account?.address && !!PACKAGE_ID,
    staleTime: 60000,
  });
}

