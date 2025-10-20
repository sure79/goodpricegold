import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // 프로덕션 빌드 시 ESLint 경고를 무시
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 프로덕션 빌드 시 TypeScript 오류를 무시 (필요한 경우)
    ignoreBuildErrors: false,
  },
  images: {
    domains: ['localhost', 'goodgeumni.vercel.app', 'geumnikkaebi.vercel.app']
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
