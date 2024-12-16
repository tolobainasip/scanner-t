import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { TelegramProvider } from '@/components/TelegramProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Document Scanner',
  description: 'Telegram Mini App для сканирования документов',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        <Script
          src="https://docs.opencv.org/4.5.4/opencv.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://unpkg.com/tesseract.js@v2.1.0/dist/tesseract.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={inter.className}>
        <TelegramProvider>
          {children}
        </TelegramProvider>
      </body>
    </html>
  )
}
