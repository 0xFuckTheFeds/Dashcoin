import Image from "next/image";
import { DashcoinCard } from "@/components/ui/dashcoin-card";

interface TokenHeaderCardProps {
  name: string;
  symbol: string;
  address: string;
  logoUrl?: string;
}

export function TokenHeaderCard({ name, symbol, address, logoUrl }: TokenHeaderCardProps) {
  return (
    <DashcoinCard className="flex items-center gap-3 bg-[#f2f2f2] p-3" style={{minHeight:"auto"}}>
      <Image src={logoUrl || "/placeholder-logo.png"} alt="token logo" width={32} height={32} className="rounded-full" />
      <div className="text-sm">
        <p className="font-semibold text-dashBlack">{name} ({symbol})</p>
        <p className="opacity-70 text-xs text-dashBlack">{address.slice(0,4)}...{address.slice(-4)}</p>
      </div>
    </DashcoinCard>
  );
}
