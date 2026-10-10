/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { typedRoutes: false },
  async rewrites() {
    return [{ source: "/:key.txt", destination: "/api/indexnow/:key" }];
  },
};
export default nextConfig;
