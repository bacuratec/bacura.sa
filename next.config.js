/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // إيقاف App Router مؤقتاً لاستخدام Pages Router فقط
  experimental: {
    ppr: false,
  },
  // إعدادات للـ API proxy (إذا لزم الأمر)
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://51.112.209.149:5141/api/:path*",
      },
    ];
  },
};

export default nextConfig;

