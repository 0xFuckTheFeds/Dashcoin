import type React from "react"
import type { Metadata } from "next"

import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"


export const metadata: Metadata = {
  title: "Dashcoin - Cryptocurrency Dashboard",
  description: "Track Dashcoin and other cryptocurrency metrics and statistics",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="font-sans bg-dashGreen-dark text-dashYellow-light min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
