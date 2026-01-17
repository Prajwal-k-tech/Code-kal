"use client";

import { useEffect } from "react";

/**
 * OAuth Callback Page
 * Handles the redirect from Google OAuth and sends the token back to the parent window
 */
export default function OAuthCallback() {
  useEffect(() => {
    // Parse the URL fragment for the id_token
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    
    const idToken = params.get("id_token");
    const state = params.get("state");
    const error = params.get("error");
    const errorDescription = params.get("error_description");

    // Send message to parent window
    if (window.opener) {
      window.opener.postMessage(
        {
          type: "OAUTH_CALLBACK",
          idToken,
          state,
          error: error || errorDescription,
        },
        window.location.origin
      );
      
      // Close the popup after a short delay
      setTimeout(() => window.close(), 100);
    } else {
      // If no opener (direct navigation), redirect to home
      window.location.href = "/";
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200">
      <div className="text-center">
        <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
        <h2 className="text-xl font-semibold">Completing verification...</h2>
        <p className="text-base-content/60 mt-2">This window will close automatically.</p>
      </div>
    </div>
  );
}
