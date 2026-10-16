/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Put title and meta description in the first HTML byte for every client.
  // Dynamic pages otherwise stream those tags, and non-browser crawlers miss them.
  htmlLimitedBots: /.*/,
  experimental: { typedRoutes: false },
  async rewrites() {
    return [{ source: "/:key.txt", destination: "/api/indexnow/:key" }];
  },
  async redirects() {
    const retired = [
      "edit-website-with-chatgpt",
      "framer-alternative-self-hosted",
      "framer-to-nextjs",
      "squarespace-to-nextjs",
      "webflow-is-too-expensive",
      "webflow-to-nextjs",
      "webflow-vs-framer-vs-nextjs",
      "wix-to-nextjs",
    ];
    return retired.map((slug) => ({
      source: `/blog/${slug}`,
      destination: "/blog",
      permanent: true,
    }));
  },
};

export default nextConfig;
