/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://conikuvat.fi/:path*'
      }
    ]
  }
}

module.exports = nextConfig
