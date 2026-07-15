import type { Metadata, Viewport } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Симулятор СашиПораши",
  description: "Юмористический кликер-симулятор выживания на куче мусора",
}

export const viewport: Viewport = {
  themeColor: "#1a1a1a",
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className="bg-background">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
