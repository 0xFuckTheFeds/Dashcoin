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
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans bg-white text-black dark:bg-[#111] dark:text-[#f5f5f5] min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
