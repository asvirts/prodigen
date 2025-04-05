import type { Metadata } from "next"
import { Inter as NextInter } from "next/font/google" // Add Inter with a different name to avoid conflicts
import { Toaster } from "sonner" // Correct the import path for Toaster
import { Providers } from "./providers" // Import our custom Providers component
import "./globals.css"
import { Analytics } from "@vercel/analytics/react"

// Configure the Inter font with proper options
const inter = NextInter({
  subsets: ["latin"],
  display: "swap", // Ensure text is visible during font load
  variable: "--font-sans"
})

export const metadata: Metadata = {
  title: "Prodigen - Your AI-Powered Application Suite", // Update title
  description:
    "Personalized AI tools for productivity, finance, wellness, and more." // Update description
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Analytics />
        <Providers>
          <div className="flex justify-center">{children}</div>
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
