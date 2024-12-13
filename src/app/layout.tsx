import { Inter } from 'next/font/google'
import './globals.css'
import { Metadata } from 'next'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { NextAuthProvider } from '@/components/providers/session-provider'
import { Toaster } from "@/components/ui/toaster"
import { RouteProgress } from "@/components/ui/route-progress"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Luna',
  description: 'Luna - Plataforma moderna e segura',
  icons: [
    {
      rel: 'icon',
      url: '/favicon.ico',
    },
    {
      rel: 'icon',
      url: '/icon.svg',
      type: 'image/svg+xml',
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextAuthProvider>
            <RouteProgress />
            {children}
            <Toaster />
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
