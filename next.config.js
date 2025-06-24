/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { 
    unoptimized: true 
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  optimizeFonts: false,
  distDir: 'out',
  assetPrefix: '',
  basePath: '',
};

module.exports = nextConfig;