/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disabled to prevent double API calls in development
  trailingSlash: true, // Keep this to match API route expectations
  images: {
    unoptimized: true,
  },
  // Remove basePath for root domain deployment
  // basePath: process.env.NODE_ENV === 'production' ? '/leaderBoardProject' : '',
  // assetPrefix: process.env.NODE_ENV === 'production' ? '/leaderBoardProject/' : '',
}

module.exports = nextConfig