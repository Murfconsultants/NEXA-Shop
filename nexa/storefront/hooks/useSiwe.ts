"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";
import { api } from "@/lib/api";
import { arcTestnet } from "@/lib/chains";

export function useSiwe() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [sessionAddress, setSessionAddress] = useState<string | null>(null);
  const [checkedSession, setCheckedSession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getSession()
      .then((s) => setSessionAddress(s.address))
      .catch(() => {})
      .finally(() => setCheckedSession(true));
  }, []);

  const signIn = useCallback(async () => {
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
  }, [address, signMessageAsync]);

  const signOut = useCallback(async () => {
    await api.logout();
    setSessionAddress(null);
  }, []);

  return { isConnected, sessionAddress, checkedSession, loading, error, signIn, signOut };
}
