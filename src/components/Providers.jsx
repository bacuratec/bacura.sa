'use client';

import StoreProvider from '@/lib/redux/StoreProvider';
import { LanguageProvider } from '@/context/LanguageContext';
import { Toaster } from 'react-hot-toast';
import BackToTopButton from '@/components/BackTop';

export default function Providers({ children }) {
  return (
    <StoreProvider>
      <LanguageProvider>
        <Toaster position="top-center" reverseOrder={false} />
        <BackToTopButton />
        {children}
      </LanguageProvider>
    </StoreProvider>
  );
}

