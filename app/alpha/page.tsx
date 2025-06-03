"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";

const DASHC_MINT = process.env.NEXT_PUBLIC_DASHC_MINT_ADDRESS || "";

export default function AlphaPage() {
  const [address, setAddress] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    setError(null);
    const provider = (window as any).solana;
    if (!provider) {
      setError("Phantom wallet not found.");
      return;
    }
    try {
      const resp = await provider.connect();
      const pubKey = resp.publicKey.toString();
      setAddress(pubKey);
      await checkToken(pubKey);
    } catch (err) {
      setError("Failed to connect wallet.");
    }
  };

  const checkToken = async (addr: string) => {
    if (!DASHC_MINT) {
      setError("Dashcoin mint address not configured.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("https://api.mainnet-beta.solana.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getTokenAccountsByOwner",
          params: [addr, { mint: DASHC_MINT }, { encoding: "jsonParsed" }],
        }),
      });
      const json = await res.json();
      const amount =
        json?.result?.value?.[0]?.account?.data?.parsed?.info?.tokenAmount?.uiAmount ||
        0;
      setHasToken(amount > 0);
    } catch (err) {
      setError("Failed to fetch token balance.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">DASHC Alpha Group</h1>
        {!address ? (
          <div className="text-center">
            <button
              onClick={connectWallet}
              className="px-4 py-2 bg-dashYellow text-dashGreen-darkest rounded"
            >
              Connect Phantom Wallet
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
        ) : loading ? (
          <p className="text-center">Checking Dashcoin balance...</p>
        ) : hasToken ? (
          <div className="text-center">
            <p className="mb-4">Access granted. You hold Dashcoin.</p>
            <a
              href="https://example.com/private-community"
              target="_blank"
              className="text-dashYellow underline"
            >
              Join the Private Community
            </a>
          </div>
        ) : (
          <p className="text-center">
            You need to hold Dashcoin to access the invite link.
          </p>
        )}
      </div>
    </>
  );
}
