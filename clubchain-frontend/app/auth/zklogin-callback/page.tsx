"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ZkLoginCallbackPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    // Google OAuth with response_type=id_token returns token in hash fragment, not query params
    // Check URL hash first (this is where Google sends id_token)
    let idToken: string | null = null;
    let error: string | null = null;
    
    // Parse hash fragment (e.g., #id_token=xxx&token_type=Bearer)
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      idToken = hashParams.get("id_token");
      error = hashParams.get("error");
    }
    
    // Fallback to query parameters (some OAuth providers use this)
    if (!idToken && !error) {
      idToken = searchParams.get("id_token");
      error = searchParams.get("error");
    }
    
    console.log("Callback page loaded:", {
      hasIdToken: !!idToken,
      hasError: !!error,
      hash: window.location.hash,
      search: window.location.search
    });
    
    if (error) {
      setStatus("error");
      setErrorMessage(`Authentication error: ${error}`);
      console.error("OAuth error:", error);
      
      // Try to send error to parent window
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(
          { type: "zkLoginError", error },
          window.location.origin
        );
        setTimeout(() => window.close(), 2000);
      }
      return;
    }
    
    if (idToken) {
      console.log("Received id_token, sending to parent window...");
      
      // Send JWT to parent window
      if (window.opener && !window.opener.closed) {
        try {
          window.opener.postMessage(
            { type: "zkLoginToken", token: idToken },
            window.location.origin
          );
          console.log("Token sent to parent window");
          setStatus("success");
          
          // Close popup after a short delay to ensure message is received
          setTimeout(() => {
            window.close();
          }, 500);
        } catch (err) {
          console.error("Error sending message to parent:", err);
          setStatus("error");
          setErrorMessage("Failed to send authentication token. Please close this window and try again.");
        }
      } else {
        console.error("Parent window not found or closed");
        setStatus("error");
        setErrorMessage("Parent window not found. Please close this window and try again.");
      }
    } else {
      console.error("No id_token in URL");
      setStatus("error");
      setErrorMessage("No authentication token received. Please try again.");
      
      // Try to send error to parent window
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(
          { type: "zkLoginError", error: "no_token" },
          window.location.origin
        );
        setTimeout(() => window.close(), 2000);
      }
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        {status === "loading" && (
          <>
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-muted">Completing authentication...</p>
          </>
        )}
        
        {status === "success" && (
          <>
            <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4 border-2 border-success/40">
              <span className="text-3xl text-success">✓</span>
            </div>
            <p className="text-success">Authentication successful!</p>
            <p className="text-sm text-text-muted mt-2">You can close this window.</p>
          </>
        )}
        
        {status === "error" && (
          <>
            <div className="w-12 h-12 rounded-full bg-error/20 flex items-center justify-center mx-auto mb-4 border-2 border-error/40">
              <span className="text-3xl text-error">✕</span>
            </div>
            <p className="text-error font-semibold mb-2">Authentication Failed</p>
            <p className="text-sm text-text-muted">{errorMessage}</p>
            <button
              onClick={() => window.close()}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              Close Window
            </button>
          </>
        )}
      </div>
    </div>
  );
}


