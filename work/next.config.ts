import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    unoptimized: true
  },
  outputFileTracingRoot: path.join(__dirname),
  serverExternalPackages: ['pdfkit']
};

export default nextConfig;
