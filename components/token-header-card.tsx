import Image from "next/image";
import { useEffect, useState } from "react";
import { DashcoinCard } from "@/components/ui/dashcoin-card";
import { fetchDexscreenerTokenLogo } from "@/app/actions/dexscreener-actions";

interface TokenHeaderCardProps {
  name: string;
  symbol: string;
  address: string;
  logoUrl?: string;
}

export function TokenHeaderCard({ name, symbol, address, logoUrl }: TokenHeaderCardProps) {
  const [logo, setLogo] = useState<string | undefined>(logoUrl);

  useEffect(() => {
    async function loadLogo() {
      if (logoUrl) {
        setLogo(logoUrl);
        return;
      }

      if (!address) return;

      try {
        const img = await fetchDexscreenerTokenLogo(address);
        if (img) {
          setLogo(img as string);
        }
      } catch (err) {
        console.error("Error fetching token logo", err);
      }
    }

    loadLogo();
  }, [address, logoUrl]);

  return (
    <DashcoinCard className="flex items-center gap-3 bg-[#f2f2f2] p-3" style={{ minHeight: "auto" }}>
      <Image src={logo || "/placeholder-logo.png"} alt="token logo" width={32} height={32} className="rounded-full" />
      <div className="text-sm">
        <p className="font-semibold text-dashBlack">{name} ({symbol})</p>
        <p className="opacity-70 text-xs text-dashBlack">{address.slice(0,4)}...{address.slice(-4)}</p>
      </div>
    </DashcoinCard>
  );
}
