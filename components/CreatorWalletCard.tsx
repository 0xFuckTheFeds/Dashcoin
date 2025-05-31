"use client";

import { DashcoinCard, DashcoinCardHeader, DashcoinCardTitle, DashcoinCardContent } from "@/components/ui/dashcoin-card";
import { CopyAddress } from "@/components/copy-address";
import { Badge } from "@/components/ui/badge";

interface CreatorWalletCardProps {
  creatorWallet: string | null;
  creatorENS: string | null;
  walletComment: string | null;
}

export function CreatorWalletCard({ creatorWallet, creatorENS, walletComment }: CreatorWalletCardProps) {
  return (
    <DashcoinCard>
      <DashcoinCardHeader>
        <DashcoinCardTitle>Creator Wallet</DashcoinCardTitle>
      </DashcoinCardHeader>
      <DashcoinCardContent>
        <div className="space-y-2">
          {creatorWallet ? (
            <CopyAddress address={creatorWallet} />
          ) : (
            <p className="opacity-60">No wallet available</p>
          )}
          {creatorENS && <Badge variant="outline">{creatorENS}</Badge>}
          <p>{walletComment ? walletComment : "No comment yet"}</p>
        </div>
      </DashcoinCardContent>
    </DashcoinCard>
  );
}
