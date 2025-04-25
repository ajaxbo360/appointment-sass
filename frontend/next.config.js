/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // If you're using the App Router, uncomment the following:
  // experimental: {
  //   appDir: true,
  // },

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
