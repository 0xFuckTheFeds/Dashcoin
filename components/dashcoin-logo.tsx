import Image from "next/image";

interface DashcoinLogoProps {
  className?: string;
  size?: number;
}

export function DashcoinLogo({ className = "", size = 240 }: DashcoinLogoProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2">

          <Image
            src="/images/fulllogo.png"
            alt="Dashcoin Research Logo"
            width={size}
            height={size}
          />

      </div>
    </div>
  );
}
