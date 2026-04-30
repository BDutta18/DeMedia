import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import FuturisticNavbar from "@/components/futuristic-navbar"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "DeMedia - Decentralized Publishing Platform",
  description: "Revolutionary Web3 content sharing and tokenization platform",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/demedia-logo.svg",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/demedia-logo.svg",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/demedia-logo.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const analyticsEnabled = process.env.NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS === "true"

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <FuturisticNavbar />
            {children}
          </AuthProvider>
        </ThemeProvider>
        {analyticsEnabled ? <Analytics /> : null}
      </body>
    </html>
  )
}
