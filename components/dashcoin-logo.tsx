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

  // For smaller sizes display the compact logo image
  return (
    <Image
      src="/images/dashcoin-logo.png"
      alt="Dashcoin Research Logo"
      width={size}
      height={size}
      className={className}
    />
  )
}
