/** @type {import('next').NextConfig} */
const retired = [
  "/about",
  "/pricing",
  "/how-it-works",
  "/calculator",
  "/checkout",
  "/checkout/:path*",
  "/migrate",
  "/migrate/:path*",
  "/kit",
  "/kit/:path*",
  "/blog",
  "/blog/:path*",
];

const nextConfig = {
  reactStrictMode: true,
  experimental: { typedRoutes: false },
  async redirects() {
    return retired.map((source) => ({
      source,
      destination: "/",
      permanent: false,
    }));
  },
};

export default nextConfig;
