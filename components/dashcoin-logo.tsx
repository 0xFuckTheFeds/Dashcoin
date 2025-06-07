import Image from "next/image"

interface DashcoinLogoProps {
  className?: string
  size?: number
}

export function DashcoinLogo({ className = "", size = 240 }: DashcoinLogoProps) {
  // Use the full image for large displays to preserve the original layout
  if (size > 100) {
    return (
      <Image
        src="/images/fulllogo.png"
        alt="Dashcoin Research Logo"
        width={size}
        height={size}
        className={className}
      />
    )
  }

  // For smaller sizes (like in the navbar) render the icon with text so the
  // text color can be easily controlled.
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/images/dashcoin.png"
        alt="Dashcoin logo"
        width={size}
        height={size}
      />
      <span
        className="font-bold text-white whitespace-nowrap"
        style={{ fontSize: `${size * 0.6}px` }}
      >
        Dashcoin Research
      </span>
    </div>
  )
}
