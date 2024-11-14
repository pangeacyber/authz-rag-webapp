/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Using biome instead.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
