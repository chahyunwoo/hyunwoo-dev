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
  experimental: {
    // 클라이언트 라우터 캐시를 쓰지 않는다.
    // <Link> 로 이동하면 브라우저가 들고 있던 RSC 페이로드를 그대로 쓰는데,
    // revalidatePath 는 서버 캐시만 비우므로 이미 받아둔 것은 그대로 남는다.
    // 실측 2026-09-06: DB 와 서버 캐시를 갱신한 뒤에도 네비게이션으로 about 에
    // 들어가면 옛 경력이 보이고, 새로고침해야 새 내용이 나왔다.
    // 이 사이트는 글·이력이 자주 바뀌지 않아 라우터 캐시로 얻는 것이 적다.
    staleTimes: { dynamic: 0, static: 0 },
  },
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
