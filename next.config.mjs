/** @type {import('next').NextConfig} */
const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
let supaHost = '';
try { if (supaUrl) supaHost = new URL(supaUrl).hostname; } catch {}

const nextConfig = {
  images: {
    remotePatterns: supaHost ? [
      {
        protocol: 'https',
        hostname: supaHost,
        pathname: '/storage/v1/object/public/**',
      },
    ] : [],
  },
};

const withESLint = { eslint: { ignoreDuringBuilds: true } };
export default nextConfig;
