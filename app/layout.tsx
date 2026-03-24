import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Radicalize — O Google Maps dos Esportes Radicais',
    template: '%s | Radicalize',
  },
  description:
    'Descubra, explore e compre experiências em esportes radicais e atividades ao ar livre perto de você.',
  keywords: ['esportes radicais', 'atividades', 'aventura', 'kitesurf', 'rafting', 'trilha'],
  openGraph: {
    siteName: 'Radicalize',
    type: 'website',
    locale: 'pt_BR',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <SessionProvider>
          {children}
          <Toaster position="top-right" richColors />
        </SessionProvider>
      </body>
    </html>
  )
}
