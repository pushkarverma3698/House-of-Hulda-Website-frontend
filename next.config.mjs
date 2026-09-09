/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ]
  },
  async headers() {
    return [
      {
        // Frames are content-addressed by index and never change. Without this
        // Next serves /public with max-age=0, so every repeat visit re-validates
        // 240 requests before a single frame can be decoded.
        source: '/frames-v2/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
};

export default nextConfig;
