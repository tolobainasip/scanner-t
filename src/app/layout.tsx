import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { TelegramProvider } from '@/components/TelegramProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Document Scanner',
  description: 'Scan documents and send them to Telegram',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <TelegramProvider>
          {children}
        </TelegramProvider>
      </body>
    </html>
  )
}
