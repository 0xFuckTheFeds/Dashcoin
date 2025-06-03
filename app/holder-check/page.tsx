"use client";
import { useState } from "react";
import { DashcoinCard, DashcoinCardHeader, DashcoinCardTitle, DashcoinCardContent } from "@/components/ui/dashcoin-card";
import { DashcoinButton } from "@/components/ui/dashcoin-button";
import { Navbar } from "@/components/navbar";

export default function HolderCheckPage() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [eligible, setEligible] = useState(false);

  const tokenAddress = "7gkgsqE2Uip7LUyrqEi8fyLPNSbn7GYu9yFgtxZwYUVa";

  const connectWallet = async () => {
    const solana = (window as any).solana;
    if (solana && solana.isPhantom) {
      try {
        const resp = await solana.connect();
        const addr = resp.publicKey.toString();
        setWallet(addr);
        checkHoldings(addr);
      } catch (e) {
        console.error("Wallet connection error", e);
      }
    } else {
      alert("Please install Phantom Wallet");
    }
  };

  const checkHoldings = async (address: string) => {
    setLoading(true);
    try {
      const res = await fetch(`https://public-api.solscan.io/account/tokens?account=${address}`);
      if (!res.ok) throw new Error("Failed to fetch tokens");
      const tokens = await res.json();
      const token = tokens.find((t: any) => t.tokenAddress === tokenAddress);
      if (token && token.tokenAmount) {
        const amount = Number(token.tokenAmount.amount) / Math.pow(10, token.tokenAmount.decimals || 0);
        setBalance(amount);
        if (amount >= 1_000_000) {
          setEligible(true);
        }
      } else {
        setBalance(0);
      }
    } catch (err) {
      console.error("Error checking holdings", err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-4 space-y-4">
        <DashcoinCard>
          <DashcoinCardHeader>
            <DashcoinCardTitle>Telegram Invite</DashcoinCardTitle>
          </DashcoinCardHeader>
          <DashcoinCardContent className="space-y-4">
            {wallet ? (
              <p className="dashcoin-text break-all">Connected wallet: {wallet}</p>
            ) : (
              <DashcoinButton onClick={connectWallet}>Connect Phantom Wallet</DashcoinButton>
            )}
            {loading && <p className="dashcoin-text">Checking balance...</p>}
            {balance !== null && !loading && (
              <p className="dashcoin-text">Balance: {balance.toLocaleString()}</p>
            )}
            {eligible && (
              <a
                href="https://web.telegram.org/a/#-1002618682161"
                target="_blank"
                rel="noopener noreferrer"
              >
                <DashcoinButton variant="primary">Join Telegram</DashcoinButton>
              </a>
            )}
          </DashcoinCardContent>
        </DashcoinCard>
      </main>
    </div>
  );
}
