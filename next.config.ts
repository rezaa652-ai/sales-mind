// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: { typedRoutes: false }, // undvik typedRoutes-problem tills vidare
  eslint: { ignoreDuringBuilds: true }, // låt inte ESLint stoppa build
}

export default nextConfig
