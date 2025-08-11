/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disabled to prevent double API calls in development
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/leaderBoardProject' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/leaderBoardProject/' : '',
}

module.exports = nextConfig