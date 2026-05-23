/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    turbo: {
      resolveAlias: {
        '@react-pdf/renderer': '@react-pdf/renderer'
      }
    }
  }
}
module.exports = nextConfig
