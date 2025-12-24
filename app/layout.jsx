import { Inter } from "next/font/google";
import StoreProvider from "@/lib/redux/StoreProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import BackToTopButton from "@/components/BackTop";
import "@/index.css";

const inter = Inter({ subsets: ["latin", "arabic"] });

export const metadata = {
  title: "Bakora Amal - بكورة أمل",
  description: "منصة رقمية متكاملة تربط بين طالبي الخدمات ومقدمي الخدمات",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={inter.className}>
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
      </body>
    </html>
  );
}

