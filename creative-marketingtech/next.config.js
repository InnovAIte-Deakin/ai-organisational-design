/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['kieai.erweima.ai', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    KIE_API_KEY: process.env.KIE_API_KEY,
  },
}

module.exports = nextConfig
