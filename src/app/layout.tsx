import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { TelegramProvider } from '@/components/TelegramProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Document Scanner',
  description: 'Scan documents and send them to Telegram',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#ffffff',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="manifest" href="/manifest.json" />
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
