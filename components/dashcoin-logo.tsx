import Image from "next/image";

interface DashcoinLogoProps {
  className?: string;
  size?: number;
}

export function DashcoinLogo({ className = "", size = 240 }: DashcoinLogoProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        <div
          className="relative w-10 h-10 rounded-full mb-8"
          style={{ width: `${size}px` }}
        >
          <Image
            src="/images/dashcoin.png"
            alt="Dashcoin Research Logo"
            width={size}
            height={size}
          />
        </div>

      </div>
    </div>
  );
}
