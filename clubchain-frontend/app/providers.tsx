"use client";

import {
  SuiClientProvider,
  WalletProvider,
  createNetworkConfig,
} from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";
import "@mysten/dapp-kit/dist/index.css";
import { NETWORK } from "@/lib/constants";
import WalletDisconnectListener from "@/components/auth/WalletDisconnectListener";

const defaultNetwork = NETWORK;
const { networkConfig } = createNetworkConfig({
  [defaultNetwork]: { url: getFullnodeUrl(defaultNetwork) },
});

export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient inside component to avoid sharing state between requests
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <SessionProvider
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true}
    >
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider
          networks={networkConfig}
          defaultNetwork={defaultNetwork}
        >
          <WalletProvider autoConnect>
            <WalletDisconnectListener />
            {children}
          </WalletProvider>
        </SuiClientProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}

