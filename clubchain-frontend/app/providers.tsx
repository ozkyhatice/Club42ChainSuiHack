"use client";

import {
  SuiClientProvider,
  WalletProvider,
  createNetworkConfig,
} from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui.js/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import "@mysten/dapp-kit/dist/index.css";
import { NETWORK } from "@/lib/constants";

const queryClient = new QueryClient();
const defaultNetwork = NETWORK;
const { networkConfig } = createNetworkConfig({
  [defaultNetwork]: { url: getFullnodeUrl(defaultNetwork) },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider
          networks={networkConfig}
          defaultNetwork={defaultNetwork}
        >
          <WalletProvider autoConnect>
            {children}
          </WalletProvider>
        </SuiClientProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}

