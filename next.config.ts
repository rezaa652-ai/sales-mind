// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // typedRoutes flyttades från experimental
  typedRoutes: false,
  eslint: { ignoreDuringBuilds: true },
}

export default nextConfig
