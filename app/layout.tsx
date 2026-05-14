import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import StoreHydration from '@/components/StoreHydration'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Retro-Opoly — SMART Validator',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <StoreHydration />
        {children}
      </body>
    </html>
  )
}
