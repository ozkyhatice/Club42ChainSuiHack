"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { useZkLogin, type ZkLoginProvider } from "@/hooks/useZkLogin";
import { Loader2 } from "lucide-react";

interface ZkLoginButtonProps {
  provider: ZkLoginProvider;
  onSuccess?: () => void;
}

export default function ZkLoginButton({ provider, onSuccess }: ZkLoginButtonProps) {
  const { loginWithZkLogin, isLoading } = useZkLogin();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleZkLogin = async () => {
    // Check if client ID is configured
    if (!provider.clientId) {
      alert(`${provider.name} OAuth is not configured. Please set NEXT_PUBLIC_${provider.name.toUpperCase()}_CLIENT_ID in environment variables.`);
      return;
    }

    try {
      setIsAuthenticating(true);

      // Open OAuth popup
      const redirectUri = `${window.location.origin}/auth/zklogin-callback`;
      const authUrl = getAuthUrl(provider, redirectUri);
      const popup = window.open(
        authUrl,
        "zkLogin",
        "width=500,height=600,scrollbars=yes,resizable=yes"
      );

      if (!popup) {
        throw new Error("Popup blocked. Please allow popups for this site.");
      }

      // Listen for JWT in popup (popup will be closed automatically by waitForJWT)
      const jwt = await waitForJWT(popup, provider);
      
      if (!jwt) {
        throw new Error("Failed to get JWT from OAuth provider");
      }

      // Login with zkLogin
      await loginWithZkLogin(provider, jwt);
      
      onSuccess?.();
    } catch (error) {
      console.error("zkLogin error:", error);
      alert(error instanceof Error ? error.message : "Failed to login");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const getAuthUrl = (provider: ZkLoginProvider, redirectUri: string): string => {
    const nonce = Math.random().toString(36).substring(2, 15);
    
    // Store nonce for verification
    sessionStorage.setItem("zkLoginNonce", nonce);

    switch (provider.name.toLowerCase()) {
      case "google":
        return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${provider.clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=id_token&scope=openid%20email%20profile&nonce=${nonce}`;
      case "facebook":
        return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${provider.clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=id_token&scope=openid%20email&nonce=${nonce}`;
      case "apple":
        return `https://appleid.apple.com/auth/authorize?client_id=${provider.clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=id_token&scope=openid%20email%20name&nonce=${nonce}`;
      case "twitch":
        return `https://id.twitch.tv/oauth2/authorize?client_id=${provider.clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=id_token&scope=openid%20email&nonce=${nonce}`;
      default:
        throw new Error(`Unsupported provider: ${provider.name}`);
    }
  };

  const waitForJWT = (popup: Window, provider: ZkLoginProvider): Promise<string> => {
    return new Promise((resolve, reject) => {
      let isResolved = false;
      let isRejected = false;
      let timeoutId: NodeJS.Timeout | null = null;

      const cleanup = () => {
        window.removeEventListener("message", messageHandler);
        if (timeoutId) clearTimeout(timeoutId);
      };

      const safeResolve = (value: string) => {
        if (isResolved || isRejected) return;
        isResolved = true;
        cleanup();
        try {
          popup.close();
        } catch (e) {
          // Ignore errors when closing popup
        }
        resolve(value);
      };

      const safeReject = (error: Error) => {
        if (isResolved || isRejected) return;
        isRejected = true;
        cleanup();
        try {
          popup.close();
        } catch (e) {
          // Ignore errors when closing popup
        }
        reject(error);
      };

      // Listen for message from popup
      const messageHandler = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) {
          console.warn("Message from different origin:", event.origin);
          return;
        }
        
        console.log("Received message from popup:", event.data);
        
        if (event.data.type === "zkLoginToken" && event.data.token) {
          console.log("Token received, resolving...");
          safeResolve(event.data.token);
        } else if (event.data.type === "zkLoginError") {
          console.error("Error from popup:", event.data.error);
          safeReject(new Error(event.data.error || "Authentication failed"));
        }
      };

      window.addEventListener("message", messageHandler);

      // Note: We don't check popup.closed due to COOP (Cross-Origin-Opener-Policy) restrictions
      // Instead, we rely on:
      // 1. Message-based communication (messageHandler will receive the token)
      // 2. Timeout mechanism (if user closes popup, timeout will eventually trigger)
      // This is a more secure approach and avoids COOP policy violations

      // Timeout after 5 minutes
      timeoutId = setTimeout(() => {
        safeReject(new Error("Authentication timeout"));
      }, 5 * 60 * 1000);
    });
  };

  const isConfigured = !!provider.clientId;

  return (
    <Button
      onClick={handleZkLogin}
      disabled={isLoading || isAuthenticating}
      variant="outline"
      size="lg"
      className="w-full group"
    >
      {isLoading || isAuthenticating ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Authenticating...
        </>
      ) : (
        <>
          <span className="font-semibold">{provider.name}</span>
          {!isConfigured && (
            <span className="text-xs text-warning/80 ml-2">(Not configured)</span>
          )}
          {isConfigured && (
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          )}
        </>
      )}
    </Button>
  );
}

