/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          process.env.NEXT_PUBLIC_API_URL + "/:path*" ||
          "http://localhost:8000/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
