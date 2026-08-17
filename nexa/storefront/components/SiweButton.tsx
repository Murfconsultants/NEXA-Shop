"use client";

import { useSiwe } from "@/hooks/useSiwe";
import { Button } from "./Button";

export function SiweButton() {
  const { isConnected, sessionAddress, loading, error, signIn, signOut } = useSiwe();

  if (!isConnected) return null;

  if (sessionAddress) {
    return (
      <button onClick={signOut} className="text-caption font-normal text-muted underline hover:text-fg">
        {sessionAddress.slice(0, 6)}…{sessionAddress.slice(-4)} — sign out
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="secondary" size="small" onClick={signIn} disabled={loading}>
        {loading ? "Check your wallet…" : "Sign in with Ethereum"}
      </Button>
      {error && <span className="text-caption font-normal text-error">{error}</span>}
    </div>
  );
}
