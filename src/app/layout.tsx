import type { Metadata } from "next"
// import { Geist, Geist_Mono } from "next/font/google"; // Remove Geist
import { Inter } from "next/font/google" // Add Inter
import { Toaster } from "sonner" // Correct the import path for Toaster
import { ThemeProvider } from "@/components/theme-provider" // Import ThemeProvider
import "./globals.css"

// const geistSans = Geist({ // Remove Geist setup
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({ // Remove Geist setup
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" }) // Setup Inter

export const metadata: Metadata = {
  title: "Prodigen - Your AI-Powered Application Suite", // Update title
  description:
    "Personalized AI tools for productivity, finance, wellness, and more." // Update description
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
