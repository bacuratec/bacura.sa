"use client";

// Initialize i18n before anything else
import "@/lib/i18n";

import StoreProvider from "@/lib/redux/StoreProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import BackToTopButton from "@/components/BackTop";

export default function Providers({ children }) {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <StoreProvider>
          <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#fff",
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
              },
            }}
          />
          {children}
          <BackToTopButton />
        </StoreProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

