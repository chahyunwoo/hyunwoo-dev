/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@hyunwoo/shared', '@hyunwoo/ui', '@hyunwoo/mdx'],
  compiler: {
    // console.error 는 남긴다. apiFetch 가 API 실패를 이 채널로만 알리는데
    // (실패 시 null 을 돌려주므로 호출부에서는 "데이터 없음"과 구별되지 않는다),
    // 프로덕션에서 지워버리면 정작 필요한 곳에서 장애가 다시 조용해진다.
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.chahyunwoo.dev',
      },
    ],
  },
  reactCompiler: true,
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
        },
      ],
    },
  ],
}

export default nextConfig
