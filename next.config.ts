// next.config.ts
import type { NextConfig } from 'next'
const nextConfig: NextConfig = {
  experimental: { typedRoutes: false },
  eslint: { ignoreDuringBuilds: true }   // ⟵ lägg till denna rad
}
export default nextConfig
