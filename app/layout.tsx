import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { dir } from 'i18next'
import { languages } from '../i18n/settings'
import Providers from './providers'

const inter = Inter({ subsets: ['latin'] })

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }))
}

export const metadata = {
  title: 'بكورة أمل - منصة الخدمات الرقمية',
  description: 'منصة متكاملة تربط بين طالبي الخدمات ومقدمي الخدمات في مجال أنظمة التيار الخفيف',
  keywords: 'باكورة أعمل, خدمات, التيار الخفيف, مقدمي خدمات, طالبي خدمات',
  authors: [{ name: 'باكورة أعمل' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'باكورة أعمل - منصة الخدمات الرقمية',
    description: 'منصة متكاملة تربط بين طالبي الخدمات ومقدمي الخدمات في مجال أنظمة التيار الخفيف',
    type: 'website',
    locale: 'ar_SA',
  },
}

export default function RootLayout({
  children,
  params: { lng }
}: {
  children: React.ReactNode
  params: { lng: string }
}) {
  return (
    <html lang={lng} dir={dir(lng)}>
      <head />
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <Toaster
          position="top-center"
          richColors
          closeButton
          duration={4000}
          theme="light"
        />
      </body>
    </html>
  )
}
