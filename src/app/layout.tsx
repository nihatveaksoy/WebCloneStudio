import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import { AppNavbar } from "@/components/app/AppNavbar"
import { BackgroundFlyers } from "@/components/app/BackgroundFlyers"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "WebClone Studio",
  description: "Clone, analyze, and enhance any website with AI",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/seo/apple-touch-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AppNavbar />
        <BackgroundFlyers />
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}
