import { Inter } from "next/font/google";
import Providers from "./providers";
import "@/index.css";

const inter = Inter({ subsets: ["latin"] });

// Get build time from environment variable
const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString();

// eslint-disable-next-line react-refresh/only-export-components
export const metadata = {
  title: "Bacura Amal - باكورة أعمال",
  description: "منصة رقمية متكاملة تربط بين طالبي الخدمات ومقدمي الخدمات",
  other: {
    "last-update": buildTime,
    "app-version": process.env.npm_package_version || "1.0.0",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={inter.className}>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__BUILD_TIME__ = "${buildTime}";`,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

