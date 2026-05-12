/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Exclude Node.js-only packages from edge/client bundles
  serverExternalPackages: ["mongodb", "bcryptjs"],
}

export default nextConfig
