import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"

export const metadata: Metadata = {
  title: "DeMedia - Decentralized Publishing Platform",
  description: "Revolutionary Web3 content sharing and tokenization platform",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/logo.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/logo.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/logo.png",
        type: "image/svg+xml",
      },
    ],
    apple: "/logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
