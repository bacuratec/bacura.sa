import { Inter } from 'next/font/google';
import './globals.css';
import '@/lib/i18n';
import Providers from '@/components/Providers';

const inter = Inter({ subsets: ['latin', 'arabic'] });

export const metadata = {
  title: 'Bacura Amal',
  description: 'Bacura Amal Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

