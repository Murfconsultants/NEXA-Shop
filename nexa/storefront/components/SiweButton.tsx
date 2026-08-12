"use client";

import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";
import { api } from "@/lib/api";
import { arcTestnet } from "@/lib/chains";

export function SiweButton() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [sessionAddress, setSessionAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getSession().then((s) => setSessionAddress(s.address)).catch(() => {});
  }, []);

  const handleSignIn = async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const { nonce } = await api.getNonce();

      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in to NEXA.",
        uri: window.location.origin,
        version: "1",
        chainId: arcTestnet.id,
        nonce,
      }).prepareMessage();

      const signature = await signMessageAsync({ message });
      const { address: verifiedAddress } = await api.verifySiwe(message, signature);
      setSessionAddress(verifiedAddress);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await api.logout();
    setSessionAddress(null);
  };

  if (!isConnected) return null;

  if (sessionAddress) {
    return (
      <button onClick={handleSignOut} className="text-xs text-neutral-400 underline">
        Signed in as {sessionAddress.slice(0, 6)}…{sessionAddress.slice(-4)} — sign out
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleSignIn}
        disabled={loading}
        className="rounded-md bg-neutral-800 px-3 py-1.5 text-xs font-medium hover:bg-neutral-700 disabled:opacity-50"
      >
        {loading ? "Check your wallet…" : "Sign in with Ethereum"}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
