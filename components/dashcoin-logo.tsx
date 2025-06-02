import Image from "next/image";

interface DashcoinLogoProps {
  className?: string;
  size?: number;
}

export function DashcoinLogo({ className = "", size = 40 }: DashcoinLogoProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        <div
          className="relative w-10 h-10 rounded-full"
          style={{ width: `${size}px`, height: `${size}px` }}
        >
          <Image
            src="/images/Dashcoin%20Research%20Logo.png"
            alt="Dashcoin Research Logo"
            width={size}
            height={size}
            className="rounded-full"
          />
        </div>
        <span
          className="dashcoin-title text-dashYellow-light text-2xl"
          style={{ fontSize: `${size / 2}px` }}
        >
          Dashcoin Research
        </span>
      </div>
    </div>
  );
}
