import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // required for static HTML export (next export)
  images: {
    unoptimized: true, // disabled Next.js Image Optimization for static export
  },
};

export default nextConfig;