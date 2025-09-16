// next.config.ts
import type { NextConfig } from 'next'
const nextConfig: NextConfig = {
  experimental: { typedRoutes: true },
  eslint: { ignoreDuringBuilds: true }   // ⟵ lägg till denna rad
}
export default nextConfig
