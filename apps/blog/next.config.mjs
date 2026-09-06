/** @type {import('next').NextConfig} */

const nextConfig = {
  transpilePackages: ['@hyunwoo/shared', '@hyunwoo/mdx'],
  reactStrictMode: false,
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
    // NOTE: sitemap.xml / robots.txt 에 짧은 s-maxage 를 따로 주려고 여기에
    // 별도 규칙을 뒀었으나 **적용되지 않는다**. routes-manifest 에는 정규식까지
    // 정상 등록되는데(^(?:/(sitemap.xml|robots.txt))(?:/)?$) 실제 응답은 아래
    // 일반 규칙 값이 나갔다 — app router 의 metadata 라우트(sitemap.ts/robots.ts)가
    // 자체 Cache-Control 을 설정해 config 의 headers() 를 덮어쓰기 때문이다.
    // 실측(2026-09-04, 배포 후): curl -sI https://chahyunwoo.dev/sitemap.xml
    //   -> cache-control: public, max-age=3600, s-maxage=86400, ...
    // 쿼리스트링으로 캐시 키를 바꿔도 같은 값이라 CDN 캐시 잔존이 아니다.
    //
    // 다만 실제 문제(새 글이 sitemap 에 안 뜬다)는 on-demand revalidate 에
    // revalidatePath('/sitemap.xml') 를 추가해 해결했고, 그쪽이 CDN 캐시도
    // 함께 무효화하므로 여기서 더 손대지 않는다. metadata 라우트를 Route
    // Handler 로 바꿔 XML 을 직접 만들면 제어할 수 있지만, 얻는 것에 비해
    // 깨질 여지가 크다.
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
