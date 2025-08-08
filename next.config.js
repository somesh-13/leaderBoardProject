/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/leaderBoardProject' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/leaderBoardProject/' : '',
}

module.exports = nextConfig