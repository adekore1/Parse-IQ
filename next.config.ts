import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), {
        canvas: 'commonjs canvas',
      }];
    }
    return config;
  },
};

export default nextConfig;