import { Inter } from 'next/font/google';
import './globals.css';
import StoreProvider from '@/lib/redux/StoreProvider';
import { LanguageProvider } from '@/context/LanguageContext';
import { Toaster } from 'react-hot-toast';
import '@/lib/i18n';
import BackToTopButton from '@/src/components/BackTop';

const inter = Inter({ subsets: ['latin', 'arabic'] });

export const metadata = {
  title: 'Bacura Amal',
  description: 'Bacura Amal Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>
        <StoreProvider>
          <LanguageProvider>
            <Toaster position="top-center" reverseOrder={false} />
            <BackToTopButton />
            {children}
          </LanguageProvider>
        </StoreProvider>
      </body>
    </html>
  );
}

