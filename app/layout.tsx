import type React from "react"
import type { Metadata } from "next"
import { League_Spartan } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  variable: "--font-league-spartan",
})

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
      <body className={`${leagueSpartan.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
