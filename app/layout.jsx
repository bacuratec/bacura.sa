import { Inter } from "next/font/google";
import Providers from "./providers";
import "@/index.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Bakora Amal - بكورة أمل",
  description: "منصة رقمية متكاملة تربط بين طالبي الخدمات ومقدمي الخدمات",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

