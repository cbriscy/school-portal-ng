/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable Turbopack for production builds (use Webpack instead)
  turbo: {
    rules: {}
  },
  experimental: {
    // Fallback to Webpack for API routes with JSX
    serverComponentsExternalPackages: ['@react-pdf/renderer']
  }
}
module.exports = nextConfig
